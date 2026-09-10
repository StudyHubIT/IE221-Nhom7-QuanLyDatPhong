from datetime import date, datetime
from enum import Enum
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field


class BookingStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    CHECKED_OUT = "CHECKED_OUT"
    CANCELLED = "CANCELLED"


class RoomStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    MAINTENANCE = "MAINTENANCE"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class PaymentMethod(str, Enum):
    BANKING = "BANKING"
    CASH = "CASH"


class RefundStatus(str, Enum):
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class AccountStatus(str, Enum):
    ACTIVE = "ACTIVE"
    LOCKED = "LOCKED"


class AdminRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    STAFF = "STAFF"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str | None = None


class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    phone: str | None = None
    full_name: str | None = None
    status: AccountStatus = AccountStatus.ACTIVE


class StatusPatch(BaseModel):
    status: str


T = TypeVar("T")


class Paginated(BaseModel, Generic[T]):
    items: list[T] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20


class RoomType(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ten_loai: str
    gia_co_ban: float
    description: str | None = None
    image: str | None = None
    room_count: int | None = None


class RoomTypeWrite(BaseModel):
    ten_loai: str
    gia_co_ban: float


class Room(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    so_phong: str
    loai_phong_id: int
    trang_thai: RoomStatus
    ten_loai: str | None = None
    gia_co_ban: float | None = None


class RoomWrite(BaseModel):
    so_phong: str
    loai_phong_id: int
    trang_thai: RoomStatus


class AvailabilityItem(Room):
    available: bool = True


class RoomTypeDetail(RoomType):
    available_rooms: list[Room] = Field(default_factory=list)


class BookingRoom(BaseModel):
    phong_id: int
    so_phong: str
    ten_loai: str
    don_gia: float


class Payment(BaseModel):
    id: int
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    created_at: datetime
    booking_id: int | None = None
    booking_code: str | None = None
    customer_name: str | None = None


class Refund(BaseModel):
    id: int
    code: str
    booking_id: int
    booking_code: str | None = None
    payment_id: int
    refund_amount: float
    status: RefundStatus
    reason: str | None = None
    customer_name: str | None = None
    approved_by: int | None = None
    created_at: datetime


class Booking(BaseModel):
    id: int
    code: str
    user_id: int
    user_name: str
    user_email: str
    user_phone: str | None = None
    check_in: date
    check_out: date
    created_at: datetime
    trang_thai: BookingStatus
    rooms: list[BookingRoom]
    total: float
    payment: Payment | None = None
    refund: Refund | None = None


class CheckoutRequest(BaseModel):
    check_in: date
    check_out: date
    phong_ids: list[int]
    method: PaymentMethod


class CancelRequest(BaseModel):
    reason: str


class BookingStatusPatch(BaseModel):
    trang_thai: BookingStatus


class Dashboard(BaseModel):
    pending_count: int = 0
    confirmed_count: int = 0
    monthly_revenue: float = 0
    rooms_available: int = 0
    rooms_occupied: int = 0
    pending_refunds_count: int = 0
    pending_refunds: list[Refund] = Field(default_factory=list)
    latest_bookings: list[Booking] = Field(default_factory=list)


class Customer(BaseModel):
    id: int
    full_name: str | None = None
    email: str
    phone: str | None = None
    status: AccountStatus = AccountStatus.ACTIVE


class AdminAccount(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str | None = None
    email: str
    role: AdminRole
    status: AccountStatus = AccountStatus.ACTIVE


class AdminWrite(BaseModel):
    full_name: str
    email: str
    role: AdminRole
    password: str | None = None


class Role(BaseModel):
    code: str
    name: str | None = None
    permissions: list[str] = Field(default_factory=list)
