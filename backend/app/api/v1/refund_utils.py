"""Hàm dùng chung cho nhóm endpoint hoàn tiền (Task D)."""

from app.models.hotel import Refund as RefundModel
from app.schemas.hotel import Refund, RefundStatus


def build_refund_response(refund: RefundModel) -> Refund:
    """Đổi một dòng REFUNDS trong database thành JSON trả về cho client.

    Bảng REFUNDS chỉ lưu payment_id, nên mã hoàn tiền, mã đơn và tên khách
    phải lấy thêm qua chuỗi quan hệ: REFUNDS -> PAYMENTS -> DATPHONG -> USERS.
    """
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
