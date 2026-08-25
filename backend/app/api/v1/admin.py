from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentAdmin
from app.api.v1.stubs import stub_admin, stub_booking, stub_room, stub_room_type
from app.core.db import get_db
from app.core.security import create_access_token, verify_password
from app.models.hotel import Admin as AdminModel
from app.schemas.hotel import (
    AdminAccount,
    AdminWrite,
    Booking,
    BookingStatusPatch,
    Customer,
    Dashboard,
    LoginRequest,
    Paginated,
    Payment,
    Refund,
    RefundStatus,
    Role,
    Room,
    RoomType,
    RoomTypeWrite,
    RoomWrite,
    StatusPatch,
    TokenResponse,
)

auth_router = APIRouter(prefix="/api/v1/admin/auth", tags=["AdminAuth"])
dashboard_router = APIRouter(prefix="/api/v1/admin", tags=["AdminDashboard"])
room_types_router = APIRouter(
    prefix="/api/v1/admin/room-types", tags=["AdminRoomTypes"]
)
rooms_router = APIRouter(prefix="/api/v1/admin/rooms", tags=["AdminRooms"])
bookings_router = APIRouter(
    prefix="/api/v1/admin/bookings", tags=["AdminBookings"]
)
payments_router = APIRouter(
    prefix="/api/v1/admin/payments", tags=["AdminPayments"]
)
refunds_router = APIRouter(prefix="/api/v1/admin/refunds", tags=["AdminRefunds"])
customers_router = APIRouter(
    prefix="/api/v1/admin/customers", tags=["AdminCustomers"]
)
staff_router = APIRouter(prefix="/api/v1/admin", tags=["AdminStaff"])


def _empty_page(page: int, page_size: int):
    return Paginated(page=page, page_size=page_size)


@auth_router.post("/login")
def login_admin(
    body: LoginRequest, db: Annotated[Session, Depends(get_db)]
) -> TokenResponse:
    admin = db.query(AdminModel).filter(AdminModel.email == body.email).first()
    if admin is None or not verify_password(body.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai thông tin đăng nhập",
        )

    return TokenResponse(access_token=create_access_token("admin", admin.id))


@auth_router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_admin(_admin: CurrentAdmin) -> None:
    return None


@auth_router.get("/me")
def admin_me(admin: CurrentAdmin) -> AdminAccount:
    return admin


@dashboard_router.get("/dashboard")
def get_dashboard(_admin: CurrentAdmin) -> Dashboard:
    return Dashboard()


@room_types_router.get("")
def list_room_types(
    _admin: CurrentAdmin,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[RoomType]:
    return _empty_page(page, page_size)


@room_types_router.post("", status_code=status.HTTP_201_CREATED)
def create_room_type(body: RoomTypeWrite, _admin: CurrentAdmin) -> RoomType:
    return RoomType(id=1, ten_loai=body.ten_loai, gia_co_ban=body.gia_co_ban)


@room_types_router.get("/{id}")
def get_room_type(id: int, _admin: CurrentAdmin) -> RoomType:
    return stub_room_type(id)


@room_types_router.put("/{id}")
def update_room_type(
    id: int, body: RoomTypeWrite, _admin: CurrentAdmin
) -> RoomType:
    return RoomType(id=id, ten_loai=body.ten_loai, gia_co_ban=body.gia_co_ban)


@room_types_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room_type(id: int, _admin: CurrentAdmin) -> None:
    return None


@rooms_router.get("")
def list_rooms(
    _admin: CurrentAdmin,
    loai_phong_id: int | None = None,
    trang_thai: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Room]:
    return _empty_page(page, page_size)


@rooms_router.post("", status_code=status.HTTP_201_CREATED)
def create_room(body: RoomWrite, _admin: CurrentAdmin) -> Room:
    return Room(
        id=1,
        so_phong=body.so_phong,
        loai_phong_id=body.loai_phong_id,
        trang_thai=body.trang_thai,
    )


@rooms_router.get("/{id}")
def get_room(id: int, _admin: CurrentAdmin) -> Room:
    return stub_room(id)


@rooms_router.put("/{id}")
def update_room(id: int, body: RoomWrite, _admin: CurrentAdmin) -> Room:
    return Room(
        id=id,
        so_phong=body.so_phong,
        loai_phong_id=body.loai_phong_id,
        trang_thai=body.trang_thai,
    )


@rooms_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(id: int, _admin: CurrentAdmin) -> None:
    return None


@rooms_router.patch("/{id}/status")
def patch_room_status(
    id: int, body: StatusPatch, _admin: CurrentAdmin
) -> Room:
    room = stub_room(id)
    return room.model_copy(update={"trang_thai": body.status})


@bookings_router.get("")
def list_admin_bookings(
    _admin: CurrentAdmin,
    status: str | None = None,
    user_id: int | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
) -> Paginated[Booking]:
    return _empty_page(page, page_size)


@bookings_router.get("/{id}")
def get_admin_booking(id: int, _admin: CurrentAdmin) -> Booking:
    return stub_booking(booking_id=id)


@bookings_router.patch("/{id}/status")
def patch_booking_status(
    id: int, body: BookingStatusPatch, _admin: CurrentAdmin
) -> Booking:
    booking = stub_booking(booking_id=id)
    return booking.model_copy(update={"trang_thai": body.trang_thai})


@payments_router.get("")
def list_payments(
    _admin: CurrentAdmin,
    status: str | None = None,
    method: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Payment]:
    return _empty_page(page, page_size)


@refunds_router.get("")
def list_refunds(
    _admin: CurrentAdmin,
    status: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Refund]:
    return _empty_page(page, page_size)


def _stub_refund(refund_id: int, refund_status: RefundStatus) -> Refund:
    booking = stub_booking()
    return Refund(
        id=refund_id,
        code=f"RF-{refund_id:02d}",
        booking_id=booking.id,
        booking_code=booking.code,
        payment_id=1,
        refund_amount=booking.total,
        status=refund_status,
        reason="Đổi lịch trình",
        customer_name=booking.user_name,
        approved_by=1 if refund_status == RefundStatus.APPROVED else None,
        created_at=datetime.now(),
    )


@refunds_router.post("/{id}/approve")
def approve_refund(id: int, _admin: CurrentAdmin) -> Refund:
    return _stub_refund(id, RefundStatus.APPROVED)


@refunds_router.post("/{id}/reject")
def reject_refund(id: int, _admin: CurrentAdmin) -> Refund:
    return _stub_refund(id, RefundStatus.REJECTED)


@customers_router.get("")
def list_customers(
    _admin: CurrentAdmin,
    status: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Customer]:
    return _empty_page(page, page_size)


@customers_router.patch("/{id}/status")
def patch_customer_status(
    id: int, body: StatusPatch, _admin: CurrentAdmin
) -> Customer:
    return Customer(
        id=id,
        full_name="Nguyễn Văn A",
        email="user1@gmail.com",
        phone="0900000001",
        status=body.status,
    )


@staff_router.get("/admins")
def list_admins(
    _admin: CurrentAdmin,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[AdminAccount]:
    return _empty_page(page, page_size)


@staff_router.post("/admins", status_code=status.HTTP_201_CREATED)
def create_admin(body: AdminWrite, _admin: CurrentAdmin) -> AdminAccount:
    return AdminAccount(
        id=3,
        full_name=body.full_name,
        email=body.email,
        role=body.role,
    )


@staff_router.get("/admins/{id}")
def get_admin(id: int, _admin: CurrentAdmin) -> AdminAccount:
    return stub_admin(id)


@staff_router.put("/admins/{id}")
def update_admin(id: int, body: AdminWrite, _admin: CurrentAdmin) -> AdminAccount:
    return AdminAccount(
        id=id,
        full_name=body.full_name,
        email=body.email,
        role=body.role,
    )


@staff_router.patch("/admins/{id}/status")
def patch_admin_status(
    id: int, body: StatusPatch, _admin: CurrentAdmin
) -> AdminAccount:
    admin = stub_admin(id)
    return admin.model_copy(update={"status": body.status})


@staff_router.get("/roles")
def list_roles(_admin: CurrentAdmin) -> list[Role]:
    return [
        Role(
            code="SUPER_ADMIN",
            name="Super Admin",
            permissions=[
                "MANAGE_ROOM",
                "MANAGE_BOOKING",
                "MANAGE_PAYMENT",
                "APPROVE_REFUND",
            ],
        ),
        Role(
            code="STAFF",
            name="Staff",
            permissions=["MANAGE_ROOM", "MANAGE_BOOKING"],
        ),
    ]


admin_routers = [
    auth_router,
    dashboard_router,
    room_types_router,
    rooms_router,
    bookings_router,
    payments_router,
    refunds_router,
    customers_router,
    staff_router,
]
