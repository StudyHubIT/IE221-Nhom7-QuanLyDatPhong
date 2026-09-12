"""
Task C — Đặt phòng & Thanh toán (Vũ)
Router quản lý các API Admin Bookings:
- GET /api/v1/admin/bookings: Danh sách đơn đặt phòng (Admin) + bộ lọc status, dates, user_id, search
- GET /api/v1/admin/bookings/{id}: Chi tiết đơn đặt phòng (Admin)
- PATCH /api/v1/admin/bookings/{id}/status: Cập nhật trạng thái đơn đặt phòng theo State Machine
"""

from datetime import date, datetime, time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import CurrentAdmin
from app.api.v1.booking_utils import build_booking_response
from app.core.db import get_db
from app.models.hotel import Booking as BookingModel
from app.models.hotel import User as UserModel
from app.schemas.hotel import (
    Booking,
    BookingStatusPatch,
    Paginated,
)

# Khai báo APIRouter cho Admin Bookings
bookings_router = APIRouter(
    prefix="/api/v1/admin/bookings", tags=["AdminBookings"]
)

# Ma trận các chuyển đổi trạng thái đơn đặt phòng hợp lệ (State Machine Chống Nhảy Cấp / Chuyển Ngược)
VALID_STATUS_TRANSITIONS = {
    "PENDING": ["CONFIRMED", "CANCELLED"],
    "CONFIRMED": ["CHECKED_IN", "CANCELLED"],
    "CHECKED_IN": ["CHECKED_OUT"],
}


@bookings_router.get("")
def list_admin_bookings(
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    status: str | None = None,
    user_id: int | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
) -> Paginated[Booking]:
    """Lấy danh sách tất cả đơn đặt phòng dành cho Admin với các bộ lọc linh hoạt."""

    # 1. Xây dựng danh sách điều kiện lọc (SQLAlchemy 2.0 style)
    filters = []

    # Lọc theo trạng thái đơn (PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED)
    if status is not None:
        filters.append(BookingModel.trang_thai == status)

    # Lọc theo ID người dùng/khách hàng
    if user_id is not None:
        filters.append(BookingModel.user_id == user_id)

    # Lọc theo khoảng ngày nhận phòng (from_date <= check_in)
    if from_date is not None:
        filters.append(BookingModel.check_in >= datetime.combine(from_date, time.min))

    # Lọc theo khoảng ngày trả phòng (check_out <= to_date)
    if to_date is not None:
        filters.append(BookingModel.check_out <= datetime.combine(to_date, time.max))

    # Lọc theo từ khóa tìm kiếm (Mã đơn DP-xxxx hoặc Tên/Email khách hàng)
    if q and q.strip():
        keyword = q.strip()
        code_id = keyword.upper().removeprefix("DP-")
        if code_id.isdigit():
            # Nếu truyền vào dạng DP-0002 hoặc số 2 -> Tìm theo ID đơn
            filters.append(BookingModel.id == int(code_id))
        else:
            # Tìm theo Tên hoặc Email của người dùng
            filters.append(
                BookingModel.user_id.in_(
                    select(UserModel.id).where(
                        (UserModel.full_name.ilike(f"%{keyword}%"))
                        | (UserModel.email.ilike(f"%{keyword}%"))
                    )
                )
            )

    # 2. Đếm tổng số bản ghi thỏa điều kiện lọc
    total = db.scalar(
        select(func.count()).select_from(BookingModel).where(*filters)
    ) or 0

    # 3. Truy vấn danh sách đơn đặt phòng theo trang (Phân trang offset / limit)
    bookings = db.scalars(
        select(BookingModel)
        .where(*filters)
        .order_by(BookingModel.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    # 4. Chuyển đổi dữ liệu ORM sang Pydantic DTO và trả về response
    return Paginated[Booking](
        items=[build_booking_response(b) for b in bookings],
        total=total,
        page=page,
        page_size=page_size,
    )


@bookings_router.get("/{id}")
def get_admin_booking(
    id: int,
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> Booking:
    """Lấy chi tiết một đơn đặt phòng bất kỳ cho Admin."""

    # 1. Truy vấn đơn đặt phòng theo ID
    booking = db.get(BookingModel, id)
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đơn đặt phòng",
        )

    # 2. Trả về thông tin chi tiết đơn hàng
    return build_booking_response(booking)


@bookings_router.patch("/{id}/status")
def patch_booking_status(
    id: int,
    body: BookingStatusPatch,
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> Booking:
    """Cập nhật trạng thái đơn đặt phòng bởi Admin (Kiểm tra quy tắc State Machine)."""

    # 1. Kiểm tra đơn đặt phòng có tồn tại không
    booking = db.get(BookingModel, id)
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đơn đặt phòng",
        )

    # 2. Kiểm tra điều kiện chuyển trạng thái hợp lệ (State Machine validation)
    allowed = VALID_STATUS_TRANSITIONS.get(booking.trang_thai, [])
    target_status = body.trang_thai.value
    if target_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chuyển trạng thái không hợp lệ: không thể chuyển từ {booking.trang_thai} sang {target_status}",
        )

    # 3. Cập nhật trạng thái mới và lưu vào cơ sở dữ liệu
    booking.trang_thai = target_status
    db.commit()
    db.refresh(booking)

    # 4. Trả về thông tin đơn hàng sau khi cập nhật
    return build_booking_response(booking)
