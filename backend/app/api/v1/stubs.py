from datetime import date, datetime

from app.schemas.hotel import (
    AdminAccount,
    AdminRole,
    Booking,
    BookingRoom,
    BookingStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
    Room,
    RoomStatus,
    RoomType,
    RoomTypeDetail,
)

STUB_TOKEN = "stub-token"


def stub_room_type(room_type_id: int = 1) -> RoomType:
    return RoomType(
        id=room_type_id,
        ten_loai="Phòng Đơn",
        gia_co_ban=500_000,
        description="Phòng gọn gàng cho 1 khách.",
        image=None,
        room_count=2,
    )


def stub_room(room_id: int = 1) -> Room:
    return Room(
        id=room_id,
        so_phong="101",
        loai_phong_id=1,
        trang_thai=RoomStatus.AVAILABLE,
        ten_loai="Phòng Đơn",
        gia_co_ban=500_000,
    )


def stub_room_type_detail(room_type_id: int = 1) -> RoomTypeDetail:
    base = stub_room_type(room_type_id)
    return RoomTypeDetail(
        **base.model_dump(),
        available_rooms=[stub_room()],
    )


def stub_booking(
    booking_id: int = 2,
    check_in: date | None = None,
    check_out: date | None = None,
    method: PaymentMethod = PaymentMethod.BANKING,
) -> Booking:
    created_at = datetime(2026, 8, 10)
    return Booking(
        id=booking_id,
        code=f"DP-{booking_id:04d}",
        user_id=1,
        user_name="Nguyễn Văn A",
        user_email="user1@gmail.com",
        user_phone="0900000001",
        check_in=check_in or date(2026, 8, 14),
        check_out=check_out or date(2026, 8, 16),
        created_at=created_at,
        trang_thai=BookingStatus.CONFIRMED,
        rooms=[
            BookingRoom(
                phong_id=1,
                so_phong="101",
                ten_loai="Phòng Đơn",
                don_gia=500_000,
            )
        ],
        total=1_000_000,
        payment=Payment(
            id=1,
            amount=1_000_000,
            method=method,
            status=PaymentStatus.PAID,
            created_at=created_at,
            booking_id=booking_id,
            booking_code=f"DP-{booking_id:04d}",
            customer_name="Nguyễn Văn A",
        ),
        refund=None,
    )


def stub_admin(admin_id: int = 1) -> AdminAccount:
    return AdminAccount(
        id=admin_id,
        full_name="Super Admin",
        email="admin@hotel.com",
        role=AdminRole.SUPER_ADMIN,
    )
