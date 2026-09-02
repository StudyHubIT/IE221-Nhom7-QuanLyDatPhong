from app.models.hotel import Refund as RefundModel
from app.schemas.hotel import Refund, RefundStatus


def build_refund_response(refund: RefundModel) -> Refund:
    payment = refund.payment
    booking = payment.booking

    return Refund(
        id=refund.id,
        code=f"RF-{refund.id:02d}",
        booking_id=booking.id,
        booking_code=f"DP-{booking.id:04d}",
        payment_id=payment.id,
        refund_amount=float(refund.refund_amount),
        status=RefundStatus(refund.status),
        reason=refund.reason,
        customer_name=booking.user.full_name,
        approved_by=refund.approved_by,
        created_at=refund.created_at,
    )
