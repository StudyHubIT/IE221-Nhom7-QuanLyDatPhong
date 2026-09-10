"""
Task C — Đặt phòng & Thanh toán (Vũ)
Module helper chứa các hàm mapper chuyển đổi ORM Model -> Pydantic Schema DTO
và xử lý enum an toàn cho Booking & Payment.
"""

from datetime import datetime
from app.models.hotel import Booking as BookingModel
from app.models.hotel import Payment as PaymentModel
from app.schemas.hotel import (
    Booking,
    BookingRoom,
    BookingStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
)
from app.api.v1.refund_utils import build_refund_response


def safe_payment_method(val: str | None) -> PaymentMethod:
    """Chuyển đổi chuỗi phương thức thanh toán sang Enum PaymentMethod an toàn (Fallback về BANKING nếu lỗi)."""
    if not val:
        return PaymentMethod.BANKING
    try:
        return PaymentMethod(val)
    except ValueError:
        return PaymentMethod.BANKING


def safe_payment_status(val: str | None) -> PaymentStatus:
    """Chuyển đổi chuỗi trạng thái thanh toán sang Enum PaymentStatus an toàn (Fallback về PAID nếu lỗi)."""
    if not val:
        return PaymentStatus.PAID
    try:
        return PaymentStatus(val)
    except ValueError:
        return PaymentStatus.PAID


def safe_booking_status(val: str | None) -> BookingStatus:
    """Chuyển đổi chuỗi trạng thái đơn đặt phòng sang Enum BookingStatus an toàn (Fallback về PENDING nếu lỗi)."""
    if not val:
        return BookingStatus.PENDING
    try:
        return BookingStatus(val)
    except ValueError:
        return BookingStatus.PENDING


def build_booking_response(booking: BookingModel) -> Booking:
    """Mapper chuyển đổi ORM BookingModel thành Pydantic Schema Response DTO."""

    # 1. Chuyển đổi danh sách chi tiết phòng (BookingItemModel -> BookingRoom)
    rooms: list[BookingRoom] = []
    for item in booking.items:
        so_phong = item.room.so_phong if item.room else ""
        ten_loai = item.room.loai_phong.ten_loai if (item.room and item.room.loai_phong) else ""
        rooms.append(
            BookingRoom(
                phong_id=item.phong_id,
                so_phong=so_phong,
                ten_loai=ten_loai,
                don_gia=float(item.don_gia),
            )
        )

    # 2. Xử lý chuẩn hóa ngày check-in/check-out và tính tổng số tiền (đơn giá x số đêm)
    check_in_date = booking.check_in.date() if isinstance(booking.check_in, datetime) else booking.check_in
    check_out_date = booking.check_out.date() if isinstance(booking.check_out, datetime) else booking.check_out
    nights = max((check_out_date - check_in_date).days, 1)
    total = sum(float(item.don_gia) for item in booking.items) * nights

    # 3. Chuyển đổi thông tin thanh toán đầu tiên (nếu có)
    payment_obj: Payment | None = None
    if booking.payments:
        pay = booking.payments[0]
        payment_obj = Payment(
            id=pay.id,
            amount=float(pay.amount),
            method=safe_payment_method(pay.method),
            status=safe_payment_status(pay.status),
            created_at=pay.created_at,
            booking_id=pay.booking_id,
            booking_code=f"DP-{booking.id:04d}",
            customer_name=booking.user.full_name if (booking.user and booking.user.full_name) else (booking.user.email if booking.user else ""),
        )

    # 4. Chuyển đổi thông tin yêu cầu hoàn tiền (nếu có)
    refund_obj = None
    if booking.payments and booking.payments[0].refunds:
        refund_obj = build_refund_response(booking.payments[0].refunds[0])

    # 5. Lấy thông tin người đặt (Họ tên, Email, Số điện thoại)
    user_name = booking.user.full_name if (booking.user and booking.user.full_name) else (booking.user.email if booking.user else "")
    user_email = booking.user.email if booking.user else ""
    user_phone = booking.user.phone if booking.user else None

    # 6. Đóng gói đối tượng Booking DTO hoàn chỉnh
    return Booking(
        id=booking.id,
        code=f"DP-{booking.id:04d}",
        user_id=booking.user_id,
        user_name=user_name,
        user_email=user_email,
        user_phone=user_phone,
        check_in=check_in_date,
        check_out=check_out_date,
        created_at=booking.created_at,
        trang_thai=safe_booking_status(booking.trang_thai),
        rooms=rooms,
        total=total,
        payment=payment_obj,
        refund=refund_obj,
    )


def build_payment_response(payment: PaymentModel) -> Payment:
    """Mapper chuyển đổi ORM PaymentModel thành Pydantic Schema Response DTO."""

    # 1. Trích xuất tên khách hàng thanh toán
    customer_name = payment.user.full_name if (payment.user and payment.user.full_name) else (payment.user.email if payment.user else "")

    # 2. Khởi tạo đối tượng Payment DTO và trả về
    return Payment(
        id=payment.id,
        amount=float(payment.amount),
        method=safe_payment_method(payment.method),
        status=safe_payment_status(payment.status),
        created_at=payment.created_at,
        booking_id=payment.booking_id,
        booking_code=f"DP-{payment.booking_id:04d}",
        customer_name=customer_name,
    )
