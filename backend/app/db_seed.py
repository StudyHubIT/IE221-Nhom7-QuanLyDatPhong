"""Seed dev data. Run with: poetry run python -m app.db_seed (or `make seed`).

Idempotent: does nothing if `admins` already has rows, so it's safe to run
more than once (e.g. on every container start).
"""

from app.core.db import SessionLocal
from app.core.security import hash_password
from app.models.hotel import (
    Admin,
    Permission,
    Role,
    Room,
    RoomType,
    User,
    admin_roles,
    role_permissions,
)

SEED_PASSWORD = "password123"


def seed() -> None:
    db = SessionLocal()
    try:
        if db.query(Admin).first() is not None:
            print("Seed data already present, skipping.")
            return

        super_admin = Admin(
            email="admin@hotel.com",
            password_hash=hash_password(SEED_PASSWORD),
            full_name="Super Admin",
            status="ACTIVE",
        )
        staff = Admin(
            email="staff@hotel.com",
            password_hash=hash_password(SEED_PASSWORD),
            full_name="Nhân viên",
            status="ACTIVE",
        )
        db.add_all([super_admin, staff])

        role_super_admin = Role(code="SUPER_ADMIN", name="Super Administrator")
        role_staff = Role(code="STAFF", name="Staff")
        db.add_all([role_super_admin, role_staff])

        perm_room = Permission(code="MANAGE_ROOM", description="Quản lý phòng")
        perm_booking = Permission(code="MANAGE_BOOKING", description="Quản lý đặt phòng")
        perm_payment = Permission(code="MANAGE_PAYMENT", description="Quản lý thanh toán")
        perm_refund = Permission(code="APPROVE_REFUND", description="Duyệt hoàn tiền")
        db.add_all([perm_room, perm_booking, perm_payment, perm_refund])

        user1 = User(
            email="user1@gmail.com",
            phone="0900000001",
            password_hash=hash_password(SEED_PASSWORD),
            full_name="Nguyễn Văn A",
            status="ACTIVE",
        )
        user2 = User(
            email="user2@gmail.com",
            phone="0900000002",
            password_hash=hash_password(SEED_PASSWORD),
            full_name="Trần Thị B",
            status="ACTIVE",
        )
        db.add_all([user1, user2])

        loai_don = RoomType(ten_loai="Phòng Đơn", gia_co_ban=500_000)
        loai_doi = RoomType(ten_loai="Phòng Đôi", gia_co_ban=800_000)
        loai_vip = RoomType(ten_loai="Phòng VIP", gia_co_ban=1_500_000)
        db.add_all([loai_don, loai_doi, loai_vip])

        db.flush()  # assign ids before wiring association tables / FKs

        db.execute(
            admin_roles.insert(),
            [
                {"admin_id": super_admin.id, "role_id": role_super_admin.id},
                {"admin_id": staff.id, "role_id": role_staff.id},
            ],
        )
        db.execute(
            role_permissions.insert(),
            [
                {"role_id": role_super_admin.id, "permission_id": perm_room.id},
                {"role_id": role_super_admin.id, "permission_id": perm_booking.id},
                {"role_id": role_super_admin.id, "permission_id": perm_payment.id},
                {"role_id": role_super_admin.id, "permission_id": perm_refund.id},
                {"role_id": role_staff.id, "permission_id": perm_room.id},
                {"role_id": role_staff.id, "permission_id": perm_booking.id},
            ],
        )

        db.add_all(
            [
                Room(so_phong="101", loai_phong_id=loai_don.id, trang_thai="AVAILABLE"),
                Room(so_phong="102", loai_phong_id=loai_don.id, trang_thai="AVAILABLE"),
                Room(so_phong="201", loai_phong_id=loai_doi.id, trang_thai="AVAILABLE"),
                Room(so_phong="202", loai_phong_id=loai_doi.id, trang_thai="AVAILABLE"),
                Room(so_phong="VIP01", loai_phong_id=loai_vip.id, trang_thai="AVAILABLE"),
            ]
        )

        db.commit()
        print("Seed data created.")
        print(f"  Admin:  admin@hotel.com / {SEED_PASSWORD}")
        print(f"  Staff:  staff@hotel.com / {SEED_PASSWORD}")
        print(f"  User:   user1@gmail.com / {SEED_PASSWORD}")
        print(f"  User:   user2@gmail.com / {SEED_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
