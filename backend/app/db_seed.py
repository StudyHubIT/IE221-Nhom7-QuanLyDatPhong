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
        # 1. Roles & Permissions
        role_super_admin = db.query(Role).filter_by(code="SUPER_ADMIN").first()
        if not role_super_admin:
            role_super_admin = Role(code="SUPER_ADMIN", name="Super Administrator")
            db.add(role_super_admin)

        role_staff = db.query(Role).filter_by(code="STAFF").first()
        if not role_staff:
            role_staff = Role(code="STAFF", name="Staff")
            db.add(role_staff)

        permissions_data = [
            ("MANAGE_ROOM", "Quản lý phòng"),
            ("MANAGE_BOOKING", "Quản lý đặt phòng"),
            ("MANAGE_PAYMENT", "Quản lý thanh toán"),
            ("APPROVE_REFUND", "Duyệt hoàn tiền"),
        ]
        perms_dict = {}
        for code, desc in permissions_data:
            p = db.query(Permission).filter_by(code=code).first()
            if not p:
                p = Permission(code=code, description=desc)
                db.add(p)
            perms_dict[code] = p

        db.flush()

        # Link role permissions
        if not role_super_admin.permissions:
            role_super_admin.permissions = list(perms_dict.values())
        if not role_staff.permissions:
            role_staff.permissions = [perms_dict["MANAGE_ROOM"], perms_dict["MANAGE_BOOKING"]]

        # 2. Admins
        admins_data = [
            ("admin@hotel.com", "Super Admin Tổng", "ACTIVE", role_super_admin),
            ("staff@hotel.com", "Nhân viên Lễ tân", "ACTIVE", role_staff),
            ("nguyenvana_admin@hotel.com", "Nguyễn Văn An (Staff)", "ACTIVE", role_staff),
            ("lethic_admin@hotel.com", "Lê Thị Cúc (Staff - Đã khóa)", "LOCKED", role_staff),
            ("tranvand_admin@hotel.com", "Trần Văn Dũng (Admin)", "ACTIVE", role_super_admin),
        ]
        for email, full_name, status, role in admins_data:
            admin = db.query(Admin).filter_by(email=email).first()
            if not admin:
                admin = Admin(
                    email=email,
                    password_hash=hash_password(SEED_PASSWORD),
                    full_name=full_name,
                    status=status,
                )
                admin.roles.append(role)
                db.add(admin)

        # 3. Users / Customers
        users_data = [
            ("user1@gmail.com", "0900000001", "Nguyễn Văn A", "ACTIVE"),
            ("user2@gmail.com", "0900000002", "Trần Thị B", "ACTIVE"),
            ("khachhang.locked@gmail.com", "0912345678", "Phạm Văn Khóa (Tài khoản bị khóa)", "LOCKED"),
            ("lehoangnam@gmail.com", "0987654321", "Lê Hoàng Nam", "ACTIVE"),
            ("dangthimai@gmail.com", "0933112233", "Đặng Thị Mai", "ACTIVE"),
            ("vutrongphung@gmail.com", "0944556677", "Vũ Trọng Phụng", "ACTIVE"),
            ("nguyenhoaian@gmail.com", "0977889900", "Nguyễn Hoài An", "ACTIVE"),
            ("hoangthao.locked@gmail.com", "0966554433", "Hoàng Thị Thảo (Khóa)", "LOCKED"),
            ("buituankiet@gmail.com", "0922334455", "Bùi Tuấn Kiệt", "ACTIVE"),
            ("phananhthu@gmail.com", "0911223344", "Phan Anh Thư", "ACTIVE"),
            ("doanducmanh@gmail.com", "0988776655", "Đoàn Đức Mạnh", "ACTIVE"),
            ("nguyenquynhtrang@gmail.com", "0955443322", "Nguyễn Quỳnh Trang", "ACTIVE"),
        ]
        for email, phone, full_name, status in users_data:
            user = db.query(User).filter_by(email=email).first()
            if not user:
                user = User(
                    email=email,
                    phone=phone,
                    password_hash=hash_password(SEED_PASSWORD),
                    full_name=full_name,
                    status=status,
                )
                db.add(user)

        # 4. Room Types & Rooms
        room_types_data = [
            (1, "Phòng Đơn Standard", 500_000),
            (2, "Phòng Đôi Superior", 850_000),
            (3, "Phòng VIP Suite", 1_600_000),
            (4, "Phòng Deluxe Hướng Biển", 2_200_000),
        ]
        for r_id, ten_loai, gia in room_types_data:
            rt = db.query(RoomType).filter_by(id=r_id).first()
            if not rt:
                rt = RoomType(id=r_id, ten_loai=ten_loai, gia_co_ban=gia)
                db.add(rt)

        db.flush()

        rooms_data = [
            ("101", 1, "AVAILABLE"),
            ("102", 1, "AVAILABLE"),
            ("103", 1, "MAINTENANCE"),
            ("201", 2, "AVAILABLE"),
            ("202", 2, "AVAILABLE"),
            ("203", 2, "OCCUPIED"),
            ("301", 3, "AVAILABLE"),
            ("VIP01", 3, "AVAILABLE"),
            ("DLX01", 4, "AVAILABLE"),
            ("DLX02", 4, "MAINTENANCE"),
        ]
        for so_phong, loai_id, trang_thai in rooms_data:
            r = db.query(Room).filter_by(so_phong=so_phong).first()
            if not r:
                r = Room(so_phong=so_phong, loai_phong_id=loai_id, trang_thai=trang_thai)
                db.add(r)

        db.commit()
        print("Seed dev data completed successfully!")
        print(f"  Default password for all accounts: {SEED_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

