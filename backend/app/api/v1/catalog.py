from datetime import date

from fastapi import APIRouter, Query

from app.api.v1.stubs import stub_room_type_detail
from app.schemas.hotel import AvailabilityItem, RoomType, RoomTypeDetail

room_types_router = APIRouter(prefix="/api/v1/room-types", tags=["RoomTypes"])
rooms_router = APIRouter(prefix="/api/v1/rooms", tags=["Rooms"])


@room_types_router.get("")
def list_public_room_types() -> list[RoomType]:
    return []


@room_types_router.get("/{id}")
def get_public_room_type(
    id: int,
    check_in: date | None = None,
    check_out: date | None = None,
) -> RoomTypeDetail:
    return stub_room_type_detail(id)


@rooms_router.get("/availability")
def search_availability(
    check_in: date,
    check_out: date,
    loai_phong_id: int | None = None,
    count: int | None = Query(default=None, ge=1),
    min_price: float | None = None,
    max_price: float | None = None,
) -> list[AvailabilityItem]:
    return []
