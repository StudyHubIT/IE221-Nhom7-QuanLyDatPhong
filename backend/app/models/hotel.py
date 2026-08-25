from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Table,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

# Columns with a server_default (status/trang_thai/created_at) are declared
# NOT NULL here even though documents/sql/erd.md leaves them nullable —
# deliberate tightening since a default always applies at insert time.

# ===== Association tables (pure many-to-many, no extra columns) =====

admin_roles = Table(
    "admin_roles",
    Base.metadata,
    Column("admin_id", ForeignKey("admins.id"), primary_key=True),
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", ForeignKey("permissions.id"), primary_key=True),
)


# ===== User & Auth =====


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), server_default="ACTIVE")

    roles: Mapped[list["Role"]] = relationship(
        secondary=admin_roles, back_populates="admins"
    )
    approved_refunds: Mapped[list["Refund"]] = relationship(back_populates="approved_by_admin")


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    admins: Mapped[list[Admin]] = relationship(
        secondary=admin_roles, back_populates="roles"
    )
    permissions: Mapped[list["Permission"]] = relationship(
        secondary=role_permissions, back_populates="roles"
    )


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))

    roles: Mapped[list[Role]] = relationship(
        secondary=role_permissions, back_populates="permissions"
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), server_default="ACTIVE")

    bookings: Mapped[list["Booking"]] = relationship(back_populates="user")
    payments: Mapped[list["Payment"]] = relationship(back_populates="user")


# ===== Room & Booking =====


class RoomType(Base):
    __tablename__ = "loaiphong"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten_loai: Mapped[str] = mapped_column(String(100), nullable=False)
    gia_co_ban: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)

    rooms: Mapped[list["Room"]] = relationship(back_populates="loai_phong")


class Room(Base):
    __tablename__ = "phong"

    id: Mapped[int] = mapped_column(primary_key=True)
    so_phong: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    loai_phong_id: Mapped[int] = mapped_column(
        ForeignKey("loaiphong.id"), nullable=False
    )
    trang_thai: Mapped[str] = mapped_column(String(50), server_default="AVAILABLE")

    loai_phong: Mapped[RoomType] = relationship(back_populates="rooms")
    booking_items: Mapped[list["BookingItem"]] = relationship(back_populates="room")


class Booking(Base):
    __tablename__ = "datphong"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    check_in: Mapped[datetime] = mapped_column(DateTime(), nullable=False)
    check_out: Mapped[datetime] = mapped_column(DateTime(), nullable=False)
    trang_thai: Mapped[str] = mapped_column(String(50), server_default="PENDING")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )

    user: Mapped[User] = relationship(back_populates="bookings")
    items: Mapped[list["BookingItem"]] = relationship(back_populates="booking")
    payments: Mapped[list["Payment"]] = relationship(back_populates="booking")


class BookingItem(Base):
    __tablename__ = "ct_datphong"
    __table_args__ = (
        UniqueConstraint("datphong_id", "phong_id", name="uq_ct_datphong"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    datphong_id: Mapped[int] = mapped_column(
        ForeignKey("datphong.id"), nullable=False
    )
    phong_id: Mapped[int] = mapped_column(ForeignKey("phong.id"), nullable=False)
    don_gia: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)

    booking: Mapped[Booking] = relationship(back_populates="items")
    room: Mapped[Room] = relationship(back_populates="booking_items")


# ===== Payment =====


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("datphong.id"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    method: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )

    booking: Mapped[Booking] = relationship(back_populates="payments")
    user: Mapped[User] = relationship(back_populates="payments")
    refunds: Mapped[list["Refund"]] = relationship(back_populates="payment")


class Refund(Base):
    __tablename__ = "refunds"

    id: Mapped[int] = mapped_column(primary_key=True)
    payment_id: Mapped[int] = mapped_column(
        ForeignKey("payments.id"), nullable=False
    )
    refund_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    status: Mapped[str | None] = mapped_column(String(50))
    reason: Mapped[str | None] = mapped_column(String(255))
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("admins.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )

    payment: Mapped[Payment] = relationship(back_populates="refunds")
    approved_by_admin: Mapped[Admin | None] = relationship(
        back_populates="approved_refunds"
    )
