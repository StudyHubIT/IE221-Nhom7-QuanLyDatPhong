from datetime import datetime

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser
from app.api.v1.stubs import stub_booking
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
    _user: CurrentUser,
) -> Refund:
    booking = stub_booking(booking_id=id)
    return Refund(
        id=1,
        code="RF-01",
        booking_id=id,
        booking_code=booking.code,
        payment_id=1,
        refund_amount=booking.total,
        status=RefundStatus.REQUESTED,
        reason=body.reason,
        customer_name=booking.user_name,
        approved_by=None,
        created_at=datetime.now(),
    )
