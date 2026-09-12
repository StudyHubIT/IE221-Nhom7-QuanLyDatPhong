from datetime import date, datetime, time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import CurrentAdmin
from app.api.v1.refund_utils import build_refund_response
from app.api.v1.stubs import stub_admin, stub_booking
from app.core.db import get_db
from app.core.security import create_access_token, verify_password, hash_password
from app.models.hotel import Admin as AdminModel
from app.models.hotel import Booking as BookingModel
from app.models.hotel import BookingItem as BookingItemModel
from app.models.hotel import Payment as PaymentModel
from app.models.hotel import Refund as RefundModel
from app.models.hotel import Role as RoleModel
from app.models.hotel import Room as RoomModel
from app.models.hotel import RoomType as RoomTypeModel
from app.models.hotel import User as UserModel
from app.schemas.hotel import (
    AdminAccount,
    AdminRole,
    AdminWrite,
    Booking,
    BookingStatus,
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
    RoomStatus,
    RoomType,
    RoomTypeWrite,
    RoomWrite,
    StatusPatch,
    TokenResponse,
)

from app.api.v1.admin_bookings import bookings_router
from app.api.v1.admin_payments import payments_router

auth_router = APIRouter(prefix="/api/v1/admin/auth", tags=["AdminAuth"])
dashboard_router = APIRouter(prefix="/api/v1/admin", tags=["AdminDashboard"])
room_types_router = APIRouter(
    prefix="/api/v1/admin/room-types", tags=["AdminRoomTypes"]
)
rooms_router = APIRouter(prefix="/api/v1/admin/rooms", tags=["AdminRooms"])
refunds_router = APIRouter(prefix="/api/v1/admin/refunds", tags=["AdminRefunds"])
customers_router = APIRouter(
    prefix="/api/v1/admin/customers", tags=["AdminCustomers"]
)
staff_router = APIRouter(prefix="/api/v1/admin", tags=["AdminStaff"])


def _empty_page(page: int, page_size: int):
    return Paginated(page=page, page_size=page_size)


def _room_type_response(db: Session, room_type: RoomTypeModel) -> RoomType:
    room_count = db.scalar(
        select(func.count(RoomModel.id)).where(RoomModel.loai_phong_id == room_type.id)
    )
    return RoomType.model_validate(room_type).model_copy(
        update={"room_count": room_count}
    )


def _room_response(room: RoomModel, room_type: RoomTypeModel) -> Room:
    return Room.model_validate(room).model_copy(
        update={
            "ten_loai": room_type.ten_loai,
            "gia_co_ban": float(room_type.gia_co_ban),
        }
    )


def _room_with_type(db: Session, room_id: int) -> tuple[RoomModel, RoomTypeModel] | None:
    return db.execute(
        select(RoomModel, RoomTypeModel)
        .join(RoomTypeModel, RoomModel.loai_phong_id == RoomTypeModel.id)
        .where(RoomModel.id == room_id)
    ).one_or_none()


def _has_unfinished_booking(db: Session, room_id: int) -> bool:
    return db.scalar(
        select(BookingItemModel.id)
        .join(BookingModel, BookingItemModel.datphong_id == BookingModel.id)
        .where(
            BookingItemModel.phong_id == room_id,
            BookingModel.trang_thai.notin_(("CANCELLED", "CHECKED_OUT")),
        )
        .limit(1)
    ) is not None


def _require_room_type(db: Session, room_type_id: int) -> RoomTypeModel:
    room_type = db.get(RoomTypeModel, room_type_id)
    if room_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room type not found")
    return room_type


def _duplicate_room_number(db: Session, so_phong: str, room_id: int | None = None) -> bool:
    statement = select(RoomModel.id).where(RoomModel.so_phong == so_phong)
    if room_id is not None:
        statement = statement.where(RoomModel.id != room_id)
    return db.scalar(statement.limit(1)) is not None


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
def get_dashboard(admin: CurrentAdmin, db: Annotated[Session, Depends(get_db)]) -> Dashboard:
    from app.models.hotel import Booking, Payment, Room, Refund
    from sqlalchemy import extract
    from datetime import datetime
    from app.schemas.hotel import Refund as RefundSchema, Booking as BookingSchema, BookingRoom
    from app.api.v1.refund_utils import build_refund_response

    now = datetime.now()

    pending_count = db.scalar(select(func.count(Booking.id)).where(Booking.trang_thai == "PENDING")) or 0
    confirmed_count = db.scalar(select(func.count(Booking.id)).where(Booking.trang_thai == "CONFIRMED")) or 0
    
    monthly_revenue = db.scalar(
        select(func.sum(Payment.amount))
        .where(
            Payment.status == "PAID",
            extract('year', Payment.created_at) == now.year,
            extract('month', Payment.created_at) == now.month
        )
    ) or 0.0

    rooms_available = db.scalar(select(func.count(Room.id)).where(Room.trang_thai == "AVAILABLE")) or 0
    rooms_occupied = db.scalar(select(func.count(Room.id)).where(Room.trang_thai == "OCCUPIED")) or 0

    pending_refunds_count = db.scalar(select(func.count(Refund.id)).where(Refund.status == "REQUESTED")) or 0

    # Get latest 5 requested refunds
    refunds_db = db.query(Refund).filter(Refund.status == "REQUESTED").order_by(Refund.created_at.desc()).limit(5).all()
    pending_refunds = [build_refund_response(r) for r in refunds_db]

    # Get latest 5 bookings
    bookings_db = db.query(Booking).order_by(Booking.created_at.desc()).limit(5).all()
    latest_bookings = []
    for b in bookings_db:
        # Build booking schema manually since we don't have a stub here
        total = sum([item.don_gia for item in b.items])
        rooms = [BookingRoom(
            phong_id=item.phong_id, 
            so_phong=item.room.so_phong, 
            ten_loai=item.room.loai_phong.ten_loai,
            don_gia=float(item.don_gia)
        ) for item in b.items]
        
        latest_bookings.append(BookingSchema(
            id=b.id,
            code=f"BK-{b.id:04d}",
            user_id=b.user_id,
            user_name=b.user.full_name or b.user.email,
            user_email=b.user.email,
            user_phone=b.user.phone,
            check_in=b.check_in.date(),
            check_out=b.check_out.date(),
            created_at=b.created_at,
            trang_thai=b.trang_thai,
            rooms=rooms,
            total=float(total)
        ))

    return Dashboard(
        pending_count=pending_count,
        confirmed_count=confirmed_count,
        monthly_revenue=float(monthly_revenue),
        rooms_available=rooms_available,
        rooms_occupied=rooms_occupied,
        pending_refunds_count=pending_refunds_count,
        pending_refunds=pending_refunds,
        latest_bookings=latest_bookings
    )


@room_types_router.get("")
def list_room_types(
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[RoomType]:
    filters = []
    if q and q.strip():
        filters.append(RoomTypeModel.ten_loai.ilike(f"%{q.strip()}%"))

    room_count = func.count(RoomModel.id).label("room_count")
    statement = (
        select(RoomTypeModel, room_count)
        .outerjoin(RoomModel, RoomModel.loai_phong_id == RoomTypeModel.id)
        .where(*filters)
        .group_by(RoomTypeModel.id)
        .order_by(RoomTypeModel.id)
    )
    total = db.scalar(select(func.count()).select_from(RoomTypeModel).where(*filters))
    rows = db.execute(statement.offset((page - 1) * page_size).limit(page_size)).all()

    return Paginated(
        items=[
            RoomType.model_validate(room_type).model_copy(
                update={"room_count": count}
            )
            for room_type, count in rows
        ],
        total=total or 0,
        page=page,
        page_size=page_size,
    )


@room_types_router.post("", status_code=status.HTTP_201_CREATED)
def create_room_type(
    body: RoomTypeWrite,
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> RoomType:
    room_type = RoomTypeModel(**body.model_dump())
    db.add(room_type)
    db.commit()
    db.refresh(room_type)
    return _room_type_response(db, room_type)


@room_types_router.get("/{id}")
def get_room_type(
    id: int, _admin: CurrentAdmin, db: Annotated[Session, Depends(get_db)]
) -> RoomType:
    room_type = db.get(RoomTypeModel, id)
    if room_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room type not found")
    return _room_type_response(db, room_type)


@room_types_router.put("/{id}")
def update_room_type(
    id: int,
    body: RoomTypeWrite,
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> RoomType:
    room_type = db.get(RoomTypeModel, id)
    if room_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room type not found")

    room_type.ten_loai = body.ten_loai
    room_type.gia_co_ban = body.gia_co_ban
    db.commit()
    db.refresh(room_type)
    return _room_type_response(db, room_type)


@room_types_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room_type(
    id: int, _admin: CurrentAdmin, db: Annotated[Session, Depends(get_db)]
) -> None:
    room_type = db.get(RoomTypeModel, id)
    if room_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room type not found")

    has_rooms = db.scalar(
        select(RoomModel.id).where(RoomModel.loai_phong_id == id).limit(1)
    )
    if has_rooms is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete room type while rooms reference it",
        )

    db.delete(room_type)
    db.commit()


@rooms_router.get("")
def list_rooms(
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    loai_phong_id: int | None = None,
    trang_thai: RoomStatus | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Room]:
    filters = []
    if loai_phong_id is not None:
        filters.append(RoomModel.loai_phong_id == loai_phong_id)
    if trang_thai is not None:
        filters.append(RoomModel.trang_thai == trang_thai.value)
    if q and q.strip():
        filters.append(RoomModel.so_phong.ilike(f"%{q.strip()}%"))

    statement = (
        select(RoomModel, RoomTypeModel)
        .join(RoomTypeModel, RoomModel.loai_phong_id == RoomTypeModel.id)
        .where(*filters)
        .order_by(RoomModel.id)
    )
    total = db.scalar(select(func.count()).select_from(RoomModel).where(*filters))
    rows = db.execute(statement.offset((page - 1) * page_size).limit(page_size)).all()
    return Paginated(
        items=[_room_response(room, room_type) for room, room_type in rows],
        total=total or 0,
        page=page,
        page_size=page_size,
    )


@rooms_router.post("", status_code=status.HTTP_201_CREATED)
def create_room(
    body: RoomWrite,
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> Room:
    room_type = _require_room_type(db, body.loai_phong_id)
    if _duplicate_room_number(db, body.so_phong):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Room number already exists")

    room = RoomModel(**body.model_dump())
    db.add(room)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Room number already exists")
    db.refresh(room)
    return _room_response(room, room_type)


@rooms_router.get("/{id}")
def get_room(
    id: int, _admin: CurrentAdmin, db: Annotated[Session, Depends(get_db)]
) -> Room:
    result = _room_with_type(db, id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return _room_response(*result)


@rooms_router.put("/{id}")
def update_room(
    id: int,
    body: RoomWrite,
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> Room:
    room = db.get(RoomModel, id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    room_type = _require_room_type(db, body.loai_phong_id)
    if _duplicate_room_number(db, body.so_phong, room_id=id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Room number already exists")

    room.so_phong = body.so_phong
    room.loai_phong_id = body.loai_phong_id
    room.trang_thai = body.trang_thai.value
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Room number already exists")
    db.refresh(room)
    return _room_response(room, room_type)


@rooms_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    id: int, _admin: CurrentAdmin, db: Annotated[Session, Depends(get_db)]
) -> None:
    room = db.get(RoomModel, id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    if _has_unfinished_booking(db, id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete room with an unfinished booking",
        )

    db.delete(room)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete room with booking history",
        )


@rooms_router.patch("/{id}/status")
def patch_room_status(
    id: int,
    body: StatusPatch,
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> Room:
    try:
        room_status = RoomStatus(body.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid room status",
        )

    result = _room_with_type(db, id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    room, room_type = result
    if _has_unfinished_booking(db, id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot change room status with an unfinished booking",
        )

    room.trang_thai = room_status.value
    db.commit()
    db.refresh(room)
    return _room_response(room, room_type)





@refunds_router.get("")
def list_refunds(
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    status: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Refund]:
    """Danh sách yêu cầu hoàn tiền cho màn hình CMS."""
    query = (
        db.query(RefundModel)
        .join(PaymentModel, RefundModel.payment_id == PaymentModel.id)
        .join(BookingModel, PaymentModel.booking_id == BookingModel.id)
        .join(UserModel, BookingModel.user_id == UserModel.id)
    )

    if status is not None:
        query = query.filter(RefundModel.status == status)

    if q is not None and q.strip() != "":
        keyword = q.strip()
        # Ô tìm kiếm nhận cả mã hoàn tiền (RF-01, hoặc chỉ số 1) lẫn tên khách.
        so_thu_tu = keyword.upper().removeprefix("RF-")
        if so_thu_tu.isdigit():
            query = query.filter(RefundModel.id == int(so_thu_tu))
        else:
            query = query.filter(UserModel.full_name.ilike(f"%{keyword}%"))

    total = query.count()
    rows = (
        query.order_by(RefundModel.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return Paginated[Refund](
        items=[build_refund_response(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


def _get_requested_refund(db: Session, refund_id: int) -> RefundModel:
    """Lấy yêu cầu hoàn tiền và bắt buộc nó còn đang chờ duyệt."""
    refund = db.query(RefundModel).filter(RefundModel.id == refund_id).first()
    if refund is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy yêu cầu hoàn tiền",
        )
    if refund.status != RefundStatus.REQUESTED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yêu cầu hoàn tiền này đã được xử lý",
        )
    return refund


@refunds_router.post("/{id}/approve")
def approve_refund(
    id: int, admin: CurrentAdmin, db: Annotated[Session, Depends(get_db)]
) -> Refund:
    """Duyệt hoàn tiền: ghi nhận người duyệt và hủy luôn đơn đặt phòng."""
    refund = _get_requested_refund(db, id)

    # Hai bảng REFUNDS và DATPHONG phải đổi cùng lúc nên chỉ commit một lần.
    refund.status = RefundStatus.APPROVED.value
    refund.approved_by = admin.id
    refund.payment.booking.trang_thai = BookingStatus.CANCELLED.value
    db.commit()
    db.refresh(refund)

    return build_refund_response(refund)


@refunds_router.post("/{id}/reject")
def reject_refund(
    id: int, _admin: CurrentAdmin, db: Annotated[Session, Depends(get_db)]
) -> Refund:
    """Từ chối hoàn tiền: đơn đặt phòng giữ nguyên trạng thái cũ."""
    refund = _get_requested_refund(db, id)

    refund.status = RefundStatus.REJECTED.value
    db.commit()
    db.refresh(refund)

    return build_refund_response(refund)


@customers_router.get("")
def list_customers(
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    status: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Customer]:
    query = db.query(UserModel)
    if status:
        query = query.filter(UserModel.status == status)
    if q:
        search = f"%{q}%"
        query = query.filter(
            (UserModel.email.ilike(search)) |
            (UserModel.full_name.ilike(search)) |
            (UserModel.phone.ilike(search))
        )
    total = query.count()
    users = query.offset((page - 1) * page_size).limit(page_size).all()
    return Paginated(
        items=[Customer.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
    )


@customers_router.patch("/{id}/status")
def patch_customer_status(
    id: int, body: StatusPatch, _admin: CurrentAdmin, db: Annotated[Session, Depends(get_db)]
) -> Customer:
    user = db.query(UserModel).filter(UserModel.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
    user.status = body.status
    db.commit()
    db.refresh(user)
    return Customer.model_validate(user)


def require_super_admin(admin: CurrentAdmin) -> AdminAccount:
    if admin.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Yêu cầu quyền Super Admin")
    return admin


SuperAdmin = Annotated[AdminAccount, Depends(require_super_admin)]


def _map_admin(admin: AdminModel) -> AdminAccount:
    role_code = AdminRole.STAFF
    if admin.roles:
        try:
            role_code = AdminRole(admin.roles[0].code)
        except ValueError:
            role_code = AdminRole.STAFF
    return AdminAccount(
        id=admin.id,
        full_name=admin.full_name,
        email=admin.email,
        role=role_code,
        status=admin.status,
    )


@staff_router.get("/admins")
def list_admins(
    _admin: SuperAdmin,
    db: Annotated[Session, Depends(get_db)],
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[AdminAccount]:
    query = db.query(AdminModel)
    if q:
        search = f"%{q}%"
        query = query.filter(
            (AdminModel.email.ilike(search)) |
            (AdminModel.full_name.ilike(search))
        )
    total = query.count()
    admins = query.offset((page - 1) * page_size).limit(page_size).all()
    return Paginated(
        items=[_map_admin(a) for a in admins],
        total=total,
        page=page,
        page_size=page_size,
    )


@staff_router.post("/admins", status_code=status.HTTP_201_CREATED)
def create_admin(body: AdminWrite, _admin: SuperAdmin, db: Annotated[Session, Depends(get_db)]) -> AdminAccount:
    existing = db.query(AdminModel).filter(AdminModel.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email đã tồn tại")
    
    role = db.query(RoleModel).filter(RoleModel.code == body.role).first()
    if not role:
        raise HTTPException(status_code=400, detail="Role không hợp lệ")

    password = body.password or "password123"
    
    admin = AdminModel(
        email=body.email,
        full_name=body.full_name,
        password_hash=hash_password(password),
    )
    admin.roles.append(role)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return _map_admin(admin)


@staff_router.get("/admins/{id}")
def get_admin(id: int, _admin: SuperAdmin, db: Annotated[Session, Depends(get_db)]) -> AdminAccount:
    admin = db.query(AdminModel).filter(AdminModel.id == id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    return _map_admin(admin)


@staff_router.put("/admins/{id}")
def update_admin(id: int, body: AdminWrite, _admin: SuperAdmin, db: Annotated[Session, Depends(get_db)]) -> AdminAccount:
    admin = db.query(AdminModel).filter(AdminModel.id == id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    
    existing = db.query(AdminModel).filter(AdminModel.email == body.email, AdminModel.id != id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email đã tồn tại")
        
    role = db.query(RoleModel).filter(RoleModel.code == body.role).first()
    if not role:
        raise HTTPException(status_code=400, detail="Role không hợp lệ")

    admin.email = body.email
    admin.full_name = body.full_name
    admin.roles = [role]
    
    if body.password:
        admin.password_hash = hash_password(body.password)
        
    db.commit()
    db.refresh(admin)
    return _map_admin(admin)


@staff_router.patch("/admins/{id}/status")
def patch_admin_status(
    id: int, body: StatusPatch, _admin: SuperAdmin, db: Annotated[Session, Depends(get_db)]
) -> AdminAccount:
    admin = db.query(AdminModel).filter(AdminModel.id == id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    
    admin.status = body.status
    db.commit()
    db.refresh(admin)
    return _map_admin(admin)


@staff_router.get("/roles")
def list_roles(_admin: SuperAdmin, db: Annotated[Session, Depends(get_db)]) -> list[Role]:
    roles = db.query(RoleModel).all()
    return [
        Role(
            code=r.code,
            name=r.name,
            permissions=[p.code for p in r.permissions]
        ) for r in roles
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
