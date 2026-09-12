from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.hotel import (
    Booking,
    BookingItem,
    Room as RoomModel,
    RoomType as RoomTypeModel,
)
from app.schemas.hotel import AvailabilityItem, RoomType, RoomTypeDetail

room_types_router = APIRouter(prefix="/api/v1/room-types", tags=["RoomTypes"])
rooms_router = APIRouter(prefix="/api/v1/rooms", tags=["Rooms"])


@room_types_router.get("")
def list_public_room_types(
    db: Annotated[Session, Depends(get_db)],
) -> list[RoomType]:
    room_count = func.count(RoomModel.id).label("room_count")
    rows = db.execute(
        select(RoomTypeModel, room_count)
        .outerjoin(RoomModel, RoomModel.loai_phong_id == RoomTypeModel.id)
        .group_by(RoomTypeModel.id)
        .order_by(RoomTypeModel.id)
    ).all()

    return [
        RoomType.model_validate(room_type).model_copy(update={"room_count": count})
        for room_type, count in rows
    ]


def _available_rooms_statement(
    room_type_id: int | None,
    check_in: date | None,
    check_out: date | None,
):
    statement = (
        select(RoomModel)
        .where(
            RoomModel.trang_thai != "MAINTENANCE",
        )
        .order_by(RoomModel.id)
    )

    if room_type_id is not None:
        statement = statement.where(RoomModel.loai_phong_id == room_type_id)

    if check_in is not None and check_out is not None:
        held_room_ids = (
            select(BookingItem.phong_id)
            .join(Booking, BookingItem.datphong_id == Booking.id)
            .where(
                Booking.check_in < check_out,
                Booking.check_out > check_in,
                Booking.trang_thai != "CANCELLED",
            )
        )
        statement = statement.where(RoomModel.id.not_in(held_room_ids))

    return statement


@room_types_router.get("/{id}")
def get_public_room_type(
    id: int,
    db: Annotated[Session, Depends(get_db)],
    check_in: date | None = None,
    check_out: date | None = None,
) -> RoomTypeDetail:
    room_type = db.get(RoomTypeModel, id)
    if room_type is None:
        raise HTTPException(status_code=404, detail="Room type not found")

    room_count = db.scalar(
        select(func.count(RoomModel.id)).where(RoomModel.loai_phong_id == id)
    )
    
    available_rooms = db.scalars(
        _available_rooms_statement(id, check_in, check_out)
    ).all()

    room_type_data = RoomType.model_validate(room_type).model_dump()
    room_type_data["room_count"] = room_count
    return RoomTypeDetail(**room_type_data, available_rooms=available_rooms)


@rooms_router.get("/availability")
def search_availability(
    check_in: date,
    check_out: date,
    db: Annotated[Session, Depends(get_db)],
    loai_phong_id: int | None = None,
    count: int | None = Query(default=None, ge=1),
    min_price: float | None = None,
    max_price: float | None = None,
    page: int | None = Query(default=None, ge=1),
    page_size: int | None = Query(default=None, ge=1, le=100),
) -> list[AvailabilityItem]:
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")

    statement = _available_rooms_statement(loai_phong_id, check_in, check_out).join(
        RoomTypeModel, RoomModel.loai_phong_id == RoomTypeModel.id
    )
    if min_price is not None:
        statement = statement.where(RoomTypeModel.gia_co_ban >= min_price)
    if max_price is not None:
        statement = statement.where(RoomTypeModel.gia_co_ban <= max_price)

    if page is not None and page_size is not None:
        statement = statement.offset((page - 1) * page_size).limit(page_size)

    rows = db.execute(statement.add_columns(RoomTypeModel)).all()
    if count is not None and len(rows) < count:
        return []

    return [
        AvailabilityItem.model_validate(room).model_copy(
            update={
                "ten_loai": room_type.ten_loai,
                "gia_co_ban": float(room_type.gia_co_ban),
                "available": True,
            }
        )
        for room, room_type in rows
    ]
