from datetime import datetime, time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.api.v1.booking_utils import build_booking_response
from app.api.v1.refund_utils import build_refund_response
from app.core.db import get_db
from app.models.hotel import Booking as BookingModel
from app.models.hotel import BookingItem as BookingItemModel
from app.models.hotel import Payment as PaymentModel
from app.models.hotel import Refund as RefundModel
from app.models.hotel import Room as RoomModel
from app.schemas.hotel import (
    Booking,
    BookingStatus,
    CancelRequest,
    CheckoutRequest,
    Paginated,
    PaymentStatus,
    Refund,
    RefundStatus,
)

router = APIRouter(prefix="/api/v1/bookings", tags=["Bookings"])


@router.get("")
def list_my_bookings(
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Booking]:
    # 1. Khởi tạo danh sách bộ lọc theo user_id người dùng hiện tại
    filters = [BookingModel.user_id == user.id]
    # Lọc theo trạng thái đơn nếu có truyền tham số status
    if status is not None:
        filters.append(BookingModel.trang_thai == status)

    # 2. Đếm tổng số đơn đặt phòng thỏa điều kiện lọc
    total = db.scalar(
        select(func.count()).select_from(BookingModel).where(*filters)
    ) or 0

    # 3. Truy vấn danh sách đơn đặt phòng theo phân trang (offset / limit)
    bookings = db.scalars(
        select(BookingModel)
        .where(*filters)
        .order_by(BookingModel.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    # 4. Chuyển đổi ORM Model sang Response DTO và trả về kết quả
    return Paginated[Booking](
        items=[build_booking_response(b) for b in bookings],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def checkout(
    body: CheckoutRequest,
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> Booking:
    # 1. Kiểm tra tính hợp lệ của thời gian nhận/trả phòng (ngày checkout phải sau checkin)
    if body.check_in >= body.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày nhận/trả phòng không hợp lệ",
        )

    # 2. Kiểm tra danh sách phòng được chọn (phải chọn ít nhất 1 phòng)
    if not body.phong_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng chọn ít nhất 1 phòng",
        )

    # 3. Truy vấn danh sách phòng từ DB và kiểm tra tất cả ID phòng có tồn tại không
    rooms = db.scalars(
        select(RoomModel).where(RoomModel.id.in_(body.phong_ids))
    ).all()

    if len(rooms) != len(set(body.phong_ids)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Một số phòng không tồn tại",
        )

    # 4. Chuyển đổi kiểu dữ liệu ngày date sang datetime để so sánh trùng lịch
    check_in_dt = datetime.combine(body.check_in, time.min)
    check_out_dt = datetime.combine(body.check_out, time.min)

    # 5. Kiểm tra phòng có bị lặp/trùng lịch đặt với các đơn khác trong cùng khoảng thời gian không (Overlap Check)
    overlapping = db.scalar(
        select(BookingItemModel.id)
        .join(BookingModel, BookingItemModel.datphong_id == BookingModel.id)
        .where(
            BookingItemModel.phong_id.in_(body.phong_ids),
            BookingModel.trang_thai.notin_(("CANCELLED",)),
            BookingModel.check_in < check_out_dt,
            BookingModel.check_out > check_in_dt,
        )
        .limit(1)
    )

    if overlapping is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phòng đã bị đặt trong khoảng thời gian này",
        )

    # 6. Khởi tạo đối tượng đơn đặt phòng (BookingModel) ở trạng thái CONFIRMED
    booking = BookingModel(
        user_id=user.id,
        check_in=check_in_dt,
        check_out=check_out_dt,
        trang_thai=BookingStatus.CONFIRMED.value,
        created_at=datetime.now(),
    )
    db.add(booking)
    db.flush()

    # 7. Tạo các chi tiết đơn đặt phòng (BookingItemModel) cho từng phòng đã chọn
    for room in rooms:
        price = room.loai_phong.gia_co_ban
        item = BookingItemModel(
            datphong_id=booking.id,
            phong_id=room.id,
            don_gia=price,
        )
        db.add(item)

    # 8. Tính tổng tiền đơn hàng dựa trên đơn giá phòng và số đêm lưu trú
    nights = max((body.check_out - body.check_in).days, 1)
    total_amount = sum(float(r.loai_phong.gia_co_ban) for r in rooms) * nights

    # 9. Khởi tạo bản ghi thanh toán (PaymentModel) tương ứng ở trạng thái PAID
    payment = PaymentModel(
        booking_id=booking.id,
        user_id=user.id,
        amount=total_amount,
        method=body.method.value,
        status=PaymentStatus.PAID.value,
        created_at=datetime.now(),
    )
    db.add(payment)

    # 10. Lưu tất cả thay đổi vào cơ sở dữ liệu trong 1 Transaction duy nhất
    db.commit()
    db.refresh(booking)

    # 11. Trả về kết quả thông tin đơn đặt phòng đã tạo
    return build_booking_response(booking)


@router.get("/{id}")
def get_my_booking(
    id: int,
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> Booking:
    # 1. Truy vấn đơn đặt phòng theo ID thuộc về user_id hiện tại
    booking = db.scalar(
        select(BookingModel).where(
            BookingModel.id == id,
            BookingModel.user_id == user.id,
        )
    )

    # Kiểm tra nếu không tìm thấy đơn đặt phòng
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đơn đặt phòng",
        )

    # 2. Chuyển đổi ORM Model thành Response DTO và trả về kết quả
    return build_booking_response(booking)


@router.post("/{id}/cancel", status_code=status.HTTP_201_CREATED)
def cancel_my_booking(
    id: int,
    body: CancelRequest,
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> Refund:
    """Khách hủy đơn, tạo một yêu cầu hoàn tiền REQUESTED."""

    # 1. Truy vấn thông tin đơn đặt phòng thuộc về người dùng hiện tại
    booking = db.scalar(
        select(BookingModel).where(
            BookingModel.id == id, BookingModel.user_id == user.id
        )
    )
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đơn đặt phòng",
        )

    # 2. Kiểm tra trạng thái đơn đặt phòng (Chỉ cho phép hủy khi đang PENDING hoặc CONFIRMED)
    if booking.trang_thai not in ("PENDING", "CONFIRMED"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đơn này không còn ở trạng thái được hủy",
        )

    # 3. Kiểm tra thông tin thanh toán (Phải có giao dịch thanh toán mới cho phép yêu cầu hoàn tiền)
    if len(booking.payments) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đơn này chưa có thanh toán nên không thể hoàn tiền",
        )

    # 4. Kiểm tra lịch sử yêu cầu hoàn tiền (Tránh tạo yêu cầu trùng lặp)
    for payment in booking.payments:
        for old_refund in payment.refunds:
            if old_refund.status in ("REQUESTED", "APPROVED"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Đơn này đã có yêu cầu hoàn tiền",
                )

    # 5. Lấy giao dịch thanh toán đầu tiên của đơn
    payment = booking.payments[0]

    # 6. Tạo yêu cầu hoàn tiền mới (RefundModel) ở trạng thái REQUESTED
    refund = RefundModel(
        payment_id=payment.id,
        refund_amount=payment.amount,
        status=RefundStatus.REQUESTED.value,
        reason=body.reason,
    )
    db.add(refund)
    db.commit()
    db.refresh(refund)

    # 7. Trả về thông tin yêu cầu hoàn tiền đã khởi tạo
    return build_refund_response(refund)
