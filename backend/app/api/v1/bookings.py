from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.api.v1.refund_utils import build_refund_response
from app.api.v1.stubs import stub_booking
from app.core.db import get_db
from app.models.hotel import Booking as BookingModel
from app.models.hotel import Refund as RefundModel
from app.schemas.hotel import (
    Booking,
    CancelRequest,
    CheckoutRequest,
    Paginated,
    Refund,
    RefundStatus,
)

router = APIRouter(prefix="/api/v1/bookings", tags=["Bookings"])


@router.get("")
def list_my_bookings(
    _user: CurrentUser,
    status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Booking]:
    return Paginated[Booking](page=page, page_size=page_size)


@router.post("", status_code=status.HTTP_201_CREATED)
def checkout(body: CheckoutRequest, _user: CurrentUser) -> Booking:
    return stub_booking(
        check_in=body.check_in,
        check_out=body.check_out,
        method=body.method,
    )


@router.get("/{id}")
def get_my_booking(id: int, _user: CurrentUser) -> Booking:
    return stub_booking(booking_id=id)


@router.post("/{id}/cancel", status_code=status.HTTP_201_CREATED)
def cancel_my_booking(
    id: int,
    body: CancelRequest,
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> Refund:
    """Khách hủy đơn, tạo một yêu cầu hoàn tiền REQUESTED."""
    booking = (
        db.query(BookingModel)
        .filter(BookingModel.id == id, BookingModel.user_id == user.id)
        .first()
    )
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đơn đặt phòng",
        )

    # Chưa nhận phòng mới được hủy.
    if booking.trang_thai not in ("PENDING", "CONFIRMED"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đơn này không còn ở trạng thái được hủy",
        )

    # Không có thanh toán thì không có gì để hoàn lại.
    if len(booking.payments) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đơn này chưa có thanh toán nên không thể hoàn tiền",
        )

    # Đơn đã có yêu cầu hoàn tiền đang chờ duyệt hoặc đã duyệt thì không cho hủy lần nữa.
    for payment in booking.payments:
        for old_refund in payment.refunds:
            if old_refund.status in ("REQUESTED", "APPROVED"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Đơn này đã có yêu cầu hoàn tiền",
                )

    # Mỗi đơn chỉ có một lần thanh toán.
    payment = booking.payments[0]

    refund = RefundModel(
        payment_id=payment.id,
        refund_amount=payment.amount,
        status=RefundStatus.REQUESTED.value,
        reason=body.reason,
    )
    db.add(refund)
    db.commit()
    db.refresh(refund)

    return build_refund_response(refund)
