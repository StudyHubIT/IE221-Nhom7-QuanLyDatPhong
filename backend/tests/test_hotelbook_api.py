import uuid
from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from app.core.db import SessionLocal
from app.main import app
from app.models.hotel import Booking, BookingItem, Room, RoomType, User


client = TestClient(app)

# Matches the seed accounts created by `app.db_seed` (see backend/tests/conftest.py).
SEED_USER_EMAIL = "user1@gmail.com"
SEED_ADMIN_EMAIL = "admin@hotel.com"
SEED_PASSWORD = "password123"

EXPECTED_PATHS = {
    "/health",
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/auth/logout",
    "/api/v1/auth/me",
    "/api/v1/room-types",
    "/api/v1/room-types/{id}",
    "/api/v1/rooms/availability",
    "/api/v1/bookings",
    "/api/v1/bookings/{id}",
    "/api/v1/bookings/{id}/cancel",
    "/api/v1/admin/auth/login",
    "/api/v1/admin/auth/logout",
    "/api/v1/admin/auth/me",
    "/api/v1/admin/dashboard",
    "/api/v1/admin/room-types",
    "/api/v1/admin/room-types/{id}",
    "/api/v1/admin/rooms",
    "/api/v1/admin/rooms/{id}",
    "/api/v1/admin/rooms/{id}/status",
    "/api/v1/admin/bookings",
    "/api/v1/admin/bookings/{id}",
    "/api/v1/admin/bookings/{id}/status",
    "/api/v1/admin/payments",
    "/api/v1/admin/refunds",
    "/api/v1/admin/refunds/{id}/approve",
    "/api/v1/admin/refunds/{id}/reject",
    "/api/v1/admin/customers",
    "/api/v1/admin/customers/{id}/status",
    "/api/v1/admin/admins",
    "/api/v1/admin/admins/{id}",
    "/api/v1/admin/admins/{id}/status",
    "/api/v1/admin/roles",
}

def test_openapi_title_is_hotelbook_api():
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert response.json()["info"]["title"] == "HotelBook API"


def test_docs_page_is_available():
    response = client.get("/docs")

    assert response.status_code == 200


def test_openapi_includes_hotelbook_paths():
    response = client.get("/openapi.json")
    paths = set(response.json()["paths"].keys())

    missing = EXPECTED_PATHS - paths
    assert missing == set(), f"Missing OpenAPI paths: {sorted(missing)}"


def test_list_public_room_types_returns_real_room_types_with_room_counts():
    with SessionLocal() as db:
        room_type = db.scalars(select(RoomType).order_by(RoomType.id)).first()
        assert room_type is not None
        expected_count = db.scalar(
            select(func.count(Room.id)).where(Room.loai_phong_id == room_type.id)
        )

    response = client.get("/api/v1/room-types")

    assert response.status_code == 200
    body = response.json()
    assert body
    assert all(
        set(item) == {
            "id",
            "ten_loai",
            "gia_co_ban",
            "description",
            "image",
            "room_count",
        }
        for item in body
    )
    returned_room_type = next(item for item in body if item["id"] == room_type.id)
    assert returned_room_type["room_count"] == expected_count
    assert returned_room_type["description"] is None
    assert returned_room_type["image"] is None


def test_public_room_type_detail_returns_real_non_maintenance_rooms():
    token = uuid.uuid4().hex[:10]
    with SessionLocal() as db:
        room_type = RoomType(ten_loai=f"B1 detail {token}", gia_co_ban=123_456)
        db.add(room_type)
        db.flush()
        available_room = Room(
            so_phong=f"B1{token}A",
            loai_phong_id=room_type.id,
            trang_thai="AVAILABLE",
        )
        maintenance_room = Room(
            so_phong=f"B1{token}M",
            loai_phong_id=room_type.id,
            trang_thai="MAINTENANCE",
        )
        db.add_all([available_room, maintenance_room])
        db.commit()
        room_type_id = room_type.id
        available_room_id = available_room.id
        maintenance_room_id = maintenance_room.id

    response = client.get(f"/api/v1/room-types/{room_type_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == room_type_id
    assert body["room_count"] == 2
    returned_room_ids = {room["id"] for room in body["available_rooms"]}
    assert available_room_id in returned_room_ids
    assert maintenance_room_id not in returned_room_ids
    assert all(room["loai_phong_id"] == room_type_id for room in body["available_rooms"])


def test_public_room_type_detail_excludes_overlapping_non_cancelled_bookings():
    token = uuid.uuid4().hex[:10]
    with SessionLocal() as db:
        user = db.scalars(select(User).order_by(User.id)).first()
        assert user is not None
        room_type = RoomType(ten_loai=f"B1 dates {token}", gia_co_ban=234_567)
        db.add(room_type)
        db.flush()
        held_room = Room(
            so_phong=f"D{token}H",
            loai_phong_id=room_type.id,
            trang_thai="AVAILABLE",
        )
        cancelled_room = Room(
            so_phong=f"D{token}C",
            loai_phong_id=room_type.id,
            trang_thai="AVAILABLE",
        )
        free_room = Room(
            so_phong=f"D{token}F",
            loai_phong_id=room_type.id,
            trang_thai="AVAILABLE",
        )
        db.add_all([held_room, cancelled_room, free_room])
        db.flush()
        active_booking = Booking(
            user_id=user.id,
            check_in=datetime(2030, 1, 10),
            check_out=datetime(2030, 1, 15),
            trang_thai="CONFIRMED",
        )
        cancelled_booking = Booking(
            user_id=user.id,
            check_in=datetime(2030, 1, 10),
            check_out=datetime(2030, 1, 15),
            trang_thai="CANCELLED",
        )
        db.add_all([active_booking, cancelled_booking])
        db.flush()
        db.add_all(
            [
                BookingItem(
                    datphong_id=active_booking.id,
                    phong_id=held_room.id,
                    don_gia=234_567,
                ),
                BookingItem(
                    datphong_id=cancelled_booking.id,
                    phong_id=cancelled_room.id,
                    don_gia=234_567,
                ),
            ]
        )
        db.commit()
        room_type_id = room_type.id
        held_room_id = held_room.id
        cancelled_room_id = cancelled_room.id
        free_room_id = free_room.id

    response = client.get(
        f"/api/v1/room-types/{room_type_id}",
        params={"check_in": "2030-01-12", "check_out": "2030-01-14"},
    )

    assert response.status_code == 200
    returned_room_ids = {room["id"] for room in response.json()["available_rooms"]}
    assert held_room_id not in returned_room_ids
    assert {cancelled_room_id, free_room_id} <= returned_room_ids


def test_public_room_type_detail_returns_404_when_missing():
    response = client.get("/api/v1/room-types/-1")

    assert response.status_code == 404


def test_search_availability_requires_dates():
    response = client.get("/api/v1/rooms/availability")

    assert response.status_code == 422


def _create_availability_room(*, token, price, status="AVAILABLE", room_type_id=None):
    with SessionLocal() as db:
        if room_type_id is None:
            room_type = RoomType(ten_loai=f"B2 type {token}", gia_co_ban=price)
            db.add(room_type)
            db.flush()
            room_type_id = room_type.id
        room = Room(
            so_phong=f"B2{token}",
            loai_phong_id=room_type_id,
            trang_thai=status,
        )
        db.add(room)
        db.commit()
        return room_type_id, room.id


def _create_booking_for_room(*, room_id, status, check_in, check_out):
    with SessionLocal() as db:
        user = db.scalars(select(User).order_by(User.id)).first()
        assert user is not None
        booking = Booking(
            user_id=user.id,
            check_in=check_in,
            check_out=check_out,
            trang_thai=status,
        )
        db.add(booking)
        db.flush()
        db.add(BookingItem(datphong_id=booking.id, phong_id=room_id, don_gia=100_000))
        db.commit()


def test_search_availability_returns_real_available_room_fields_and_excludes_maintenance():
    token = uuid.uuid4().hex[:10]
    room_type_id, available_room_id = _create_availability_room(
        token=f"{token}A", price=345_678
    )
    _, maintenance_room_id = _create_availability_room(
        token=f"{token}M",
        price=345_678,
        status="MAINTENANCE",
        room_type_id=room_type_id,
    )

    response = client.get(
        "/api/v1/rooms/availability",
        params={
            "check_in": "2031-08-14",
            "check_out": "2031-08-16",
            "loai_phong_id": room_type_id,
        },
    )

    assert response.status_code == 200
    body = response.json()
    returned_room = next(item for item in body if item["id"] == available_room_id)
    assert returned_room == {
        "id": available_room_id,
        "so_phong": f"B2{token}A",
        "loai_phong_id": room_type_id,
        "trang_thai": "AVAILABLE",
        "ten_loai": f"B2 type {token}A",
        "gia_co_ban": 345678.0,
        "available": True,
    }
    assert maintenance_room_id not in {item["id"] for item in body}


def test_search_availability_excludes_overlapping_non_cancelled_booking_only():
    token = uuid.uuid4().hex[:10]
    room_type_id, held_room_id = _create_availability_room(
        token=f"{token}H", price=456_789
    )
    _, cancelled_room_id = _create_availability_room(
        token=f"{token}C", price=456_789, room_type_id=room_type_id
    )
    _, non_overlapping_room_id = _create_availability_room(
        token=f"{token}N", price=456_789, room_type_id=room_type_id
    )
    _create_booking_for_room(
        room_id=held_room_id,
        status="CONFIRMED",
        check_in=datetime(2032, 1, 10),
        check_out=datetime(2032, 1, 15),
    )
    _create_booking_for_room(
        room_id=cancelled_room_id,
        status="CANCELLED",
        check_in=datetime(2032, 1, 10),
        check_out=datetime(2032, 1, 15),
    )
    _create_booking_for_room(
        room_id=non_overlapping_room_id,
        status="CONFIRMED",
        check_in=datetime(2032, 1, 15),
        check_out=datetime(2032, 1, 18),
    )

    response = client.get(
        "/api/v1/rooms/availability",
        params={
            "check_in": "2032-01-12",
            "check_out": "2032-01-15",
            "loai_phong_id": room_type_id,
        },
    )

    assert response.status_code == 200
    returned_room_ids = {item["id"] for item in response.json()}
    assert held_room_id not in returned_room_ids
    assert {cancelled_room_id, non_overlapping_room_id} <= returned_room_ids


def test_search_availability_filters_by_room_type_and_price():
    token = uuid.uuid4().hex[:10]
    cheap_type_id, cheap_room_id = _create_availability_room(
        token=f"{token}L", price=200_000
    )
    _, expensive_room_id = _create_availability_room(
        token=f"{token}H", price=900_000
    )

    type_response = client.get(
        "/api/v1/rooms/availability",
        params={
            "check_in": "2033-01-10",
            "check_out": "2033-01-12",
            "loai_phong_id": cheap_type_id,
        },
    )
    min_price_response = client.get(
        "/api/v1/rooms/availability",
        params={
            "check_in": "2033-01-10",
            "check_out": "2033-01-12",
            "min_price": 800_000,
        },
    )
    max_price_response = client.get(
        "/api/v1/rooms/availability",
        params={
            "check_in": "2033-01-10",
            "check_out": "2033-01-12",
            "max_price": 300_000,
        },
    )

    assert type_response.status_code == 200
    assert cheap_room_id in {item["id"] for item in type_response.json()}
    assert all(item["loai_phong_id"] == cheap_type_id for item in type_response.json())
    assert min_price_response.status_code == 200
    assert expensive_room_id in {item["id"] for item in min_price_response.json()}
    assert cheap_room_id not in {item["id"] for item in min_price_response.json()}
    assert max_price_response.status_code == 200
    assert cheap_room_id in {item["id"] for item in max_price_response.json()}
    assert expensive_room_id not in {item["id"] for item in max_price_response.json()}


def test_search_availability_rejects_invalid_date_range():
    response = client.get(
        "/api/v1/rooms/availability",
        params={"check_in": "2031-08-16", "check_out": "2031-08-16"},
    )

    assert response.status_code == 400


def test_search_availability_rejects_count_below_one():
    response = client.get(
        "/api/v1/rooms/availability",
        params={"check_in": "2031-08-14", "check_out": "2031-08-16", "count": 0},
    )

    assert response.status_code == 422


def test_search_availability_accepts_count_without_limiting_results():
    token = uuid.uuid4().hex[:10]
    room_type_id, first_room_id = _create_availability_room(
        token=f"{token}A", price=567_890
    )
    _, second_room_id = _create_availability_room(
        token=f"{token}B", price=567_890, room_type_id=room_type_id
    )

    response = client.get(
        "/api/v1/rooms/availability",
        params={
            "check_in": "2034-01-10",
            "check_out": "2034-01-12",
            "loai_phong_id": room_type_id,
            "count": 1,
        },
    )

    assert response.status_code == 200
    assert {first_room_id, second_room_id} <= {item["id"] for item in response.json()}


def test_login_returns_access_token():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "user1@gmail.com", "password": "password123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_rejects_wrong_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "user1@gmail.com", "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_register_creates_user_and_returns_token():
    unique_email = f"test-{uuid.uuid4().hex[:12]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Người Dùng Test",
            "email": unique_email,
            "phone": "0900000000",
            "password": "a-strong-password",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_register_rejects_duplicate_email():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Trùng Email",
            "email": SEED_USER_EMAIL,
            "password": "whatever-password",
        },
    )

    assert response.status_code == 409


def test_me_requires_auth():
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_me_returns_seeded_user_profile(user_auth_header):
    response = client.get("/api/v1/auth/me", headers=user_auth_header)

    assert response.status_code == 200
    assert response.json()["email"] == SEED_USER_EMAIL


def test_admin_login_returns_access_token():
    response = client.post(
        "/api/v1/admin/auth/login",
        json={"email": SEED_ADMIN_EMAIL, "password": SEED_PASSWORD},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_admin_login_rejects_wrong_password():
    response = client.post(
        "/api/v1/admin/auth/login",
        json={"email": SEED_ADMIN_EMAIL, "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_admin_me_returns_seeded_admin_profile(admin_auth_header):
    response = client.get("/api/v1/admin/auth/me", headers=admin_auth_header)

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == SEED_ADMIN_EMAIL
    assert body["role"] == "SUPER_ADMIN"


def test_user_token_rejected_on_admin_route(user_auth_header):
    response = client.get("/api/v1/admin/auth/me", headers=user_auth_header)

    assert response.status_code == 401


def test_admin_token_rejected_on_user_route(admin_auth_header):
    response = client.get("/api/v1/auth/me", headers=admin_auth_header)

    assert response.status_code == 401


def test_admin_room_types_require_admin_authentication():
    response = client.get("/api/v1/admin/room-types")

    assert response.status_code == 401


def test_admin_room_type_list_filters_paginates_and_counts_rooms(admin_auth_header):
    token = uuid.uuid4().hex[:10]
    with SessionLocal() as db:
        room_type = RoomType(ten_loai=f"B3 list {token}", gia_co_ban=321_000)
        db.add(room_type)
        db.flush()
        db.add_all(
            [
                Room(
                    so_phong=f"B3{token}A",
                    loai_phong_id=room_type.id,
                    trang_thai="AVAILABLE",
                ),
                Room(
                    so_phong=f"B3{token}B",
                    loai_phong_id=room_type.id,
                    trang_thai="AVAILABLE",
                ),
            ]
        )
        db.commit()
        room_type_id = room_type.id

    response = client.get(
        "/api/v1/admin/room-types",
        headers=admin_auth_header,
        params={"q": f"B3 list {token}", "page": 1, "page_size": 1},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["page"] == 1
    assert body["page_size"] == 1
    assert body["items"] == [
        {
            "id": room_type_id,
            "ten_loai": f"B3 list {token}",
            "gia_co_ban": 321000.0,
            "description": None,
            "image": None,
            "room_count": 2,
        }
    ]


def test_admin_room_type_create_get_and_update_persist(admin_auth_header):
    token = uuid.uuid4().hex[:10]
    create_response = client.post(
        "/api/v1/admin/room-types",
        headers=admin_auth_header,
        json={"ten_loai": f"B3 create {token}", "gia_co_ban": 222_000},
    )

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["room_count"] == 0
    room_type_id = created["id"]

    detail_response = client.get(
        f"/api/v1/admin/room-types/{room_type_id}", headers=admin_auth_header
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["ten_loai"] == f"B3 create {token}"

    update_response = client.put(
        f"/api/v1/admin/room-types/{room_type_id}",
        headers=admin_auth_header,
        json={"ten_loai": f"B3 updated {token}", "gia_co_ban": 333_000},
    )
    assert update_response.status_code == 200
    assert update_response.json()["ten_loai"] == f"B3 updated {token}"
    assert update_response.json()["gia_co_ban"] == 333000.0

    with SessionLocal() as db:
        persisted = db.get(RoomType, room_type_id)
        assert persisted is not None
        assert persisted.ten_loai == f"B3 updated {token}"


def test_admin_room_type_missing_detail_and_update_return_404(admin_auth_header):
    missing_id = 9_999_999

    detail_response = client.get(
        f"/api/v1/admin/room-types/{missing_id}", headers=admin_auth_header
    )
    update_response = client.put(
        f"/api/v1/admin/room-types/{missing_id}",
        headers=admin_auth_header,
        json={"ten_loai": "Missing", "gia_co_ban": 1},
    )

    assert detail_response.status_code == 404
    assert update_response.status_code == 404


def test_admin_room_type_delete_succeeds_when_no_rooms_reference_it(admin_auth_header):
    token = uuid.uuid4().hex[:10]
    create_response = client.post(
        "/api/v1/admin/room-types",
        headers=admin_auth_header,
        json={"ten_loai": f"B3 delete {token}", "gia_co_ban": 111_000},
    )
    room_type_id = create_response.json()["id"]

    response = client.delete(
        f"/api/v1/admin/room-types/{room_type_id}", headers=admin_auth_header
    )

    assert response.status_code == 204
    assert client.get(
        f"/api/v1/admin/room-types/{room_type_id}", headers=admin_auth_header
    ).status_code == 404


def test_admin_room_type_delete_returns_409_when_rooms_reference_it(admin_auth_header):
    token = uuid.uuid4().hex[:10]
    with SessionLocal() as db:
        room_type = RoomType(ten_loai=f"B3 referenced {token}", gia_co_ban=444_000)
        db.add(room_type)
        db.flush()
        db.add(
            Room(
                so_phong=f"B3{token}R",
                loai_phong_id=room_type.id,
                trang_thai="AVAILABLE",
            )
        )
        db.commit()
        room_type_id = room_type.id

    response = client.delete(
        f"/api/v1/admin/room-types/{room_type_id}", headers=admin_auth_header
    )

    assert response.status_code == 409


def test_admin_room_type_missing_delete_returns_404(admin_auth_header):
    response = client.delete(
        "/api/v1/admin/room-types/9999999", headers=admin_auth_header
    )

    assert response.status_code == 404


def _create_b4_room(*, token, status="AVAILABLE"):
    with SessionLocal() as db:
        room_type = RoomType(ten_loai=f"B4 type {token}", gia_co_ban=654_321)
        db.add(room_type)
        db.flush()
        room = Room(
            so_phong=f"B4{token}",
            loai_phong_id=room_type.id,
            trang_thai=status,
        )
        db.add(room)
        db.commit()
        return room_type.id, room.id


def _create_b4_booking(*, room_id, booking_status):
    with SessionLocal() as db:
        user = db.scalars(select(User).order_by(User.id)).first()
        assert user is not None
        booking = Booking(
            user_id=user.id,
            check_in=datetime(2035, 1, 10),
            check_out=datetime(2035, 1, 12),
            trang_thai=booking_status,
        )
        db.add(booking)
        db.flush()
        db.add(BookingItem(datphong_id=booking.id, phong_id=room_id, don_gia=654_321))
        db.commit()


def test_admin_rooms_require_admin_authentication():
    response = client.get("/api/v1/admin/rooms")

    assert response.status_code == 401


def test_admin_room_list_filters_searches_and_paginates_real_rooms(admin_auth_header):
    token = uuid.uuid4().hex[:10]
    room_type_id, first_room_id = _create_b4_room(token=f"{token}A")
    _, second_room_id = _create_b4_room(token=f"{token}B", status="MAINTENANCE")

    response = client.get(
        "/api/v1/admin/rooms",
        headers=admin_auth_header,
        params={"q": f"B4{token}", "page": 1, "page_size": 1},
    )
    type_response = client.get(
        "/api/v1/admin/rooms",
        headers=admin_auth_header,
        params={"loai_phong_id": room_type_id},
    )
    status_response = client.get(
        "/api/v1/admin/rooms",
        headers=admin_auth_header,
        params={"trang_thai": "MAINTENANCE", "q": f"B4{token}"},
    )
    invalid_status_response = client.get(
        "/api/v1/admin/rooms",
        headers=admin_auth_header,
        params={"trang_thai": "BROKEN"},
    )

    assert response.status_code == 200
    assert response.json()["total"] == 2
    assert response.json()["page"] == 1
    assert response.json()["page_size"] == 1
    item = response.json()["items"][0]
    assert set(item) == {
        "id", "so_phong", "loai_phong_id", "trang_thai", "ten_loai", "gia_co_ban"
    }
    assert item["id"] in {first_room_id, second_room_id}
    assert type_response.status_code == 200
    assert first_room_id in {item["id"] for item in type_response.json()["items"]}
    assert status_response.status_code == 200
    assert status_response.json()["total"] == 1
    assert status_response.json()["items"][0]["id"] == second_room_id
    assert invalid_status_response.status_code == 422


def test_admin_room_create_persists_and_duplicate_returns_409(admin_auth_header):
    token = uuid.uuid4().hex[:10]
    room_type_id, _ = _create_b4_room(token=f"{token}T")
    body = {
        "so_phong": f"B4create{token}",
        "loai_phong_id": room_type_id,
        "trang_thai": "AVAILABLE",
    }

    create_response = client.post("/api/v1/admin/rooms", headers=admin_auth_header, json=body)
    duplicate_response = client.post(
        "/api/v1/admin/rooms", headers=admin_auth_header, json=body
    )

    assert create_response.status_code == 201
    assert create_response.json()["ten_loai"] == f"B4 type {token}T"
    assert duplicate_response.status_code == 409
    with SessionLocal() as db:
        assert db.get(Room, create_response.json()["id"]).so_phong == body["so_phong"]


def test_admin_room_create_with_missing_room_type_returns_404(admin_auth_header):
    response = client.post(
        "/api/v1/admin/rooms",
        headers=admin_auth_header,
        json={"so_phong": f"B4missing{uuid.uuid4().hex[:10]}", "loai_phong_id": 9_999_999, "trang_thai": "AVAILABLE"},
    )

    assert response.status_code == 404


def test_admin_room_detail_update_and_duplicate_handling(admin_auth_header):
    token = uuid.uuid4().hex[:10]
    room_type_id, room_id = _create_b4_room(token=f"{token}A")
    _, other_room_id = _create_b4_room(token=f"{token}B")
    detail_response = client.get(f"/api/v1/admin/rooms/{room_id}", headers=admin_auth_header)
    update_response = client.put(
        f"/api/v1/admin/rooms/{room_id}",
        headers=admin_auth_header,
        json={"so_phong": f"B4updated{token}", "loai_phong_id": room_type_id, "trang_thai": "OCCUPIED"},
    )
    duplicate_response = client.put(
        f"/api/v1/admin/rooms/{room_id}",
        headers=admin_auth_header,
        json={"so_phong": f"B4{token}B", "loai_phong_id": room_type_id, "trang_thai": "AVAILABLE"},
    )

    assert detail_response.status_code == 200
    assert detail_response.json()["id"] == room_id
    assert update_response.status_code == 200
    assert update_response.json()["trang_thai"] == "OCCUPIED"
    assert duplicate_response.status_code == 409
    assert client.get("/api/v1/admin/rooms/9999999", headers=admin_auth_header).status_code == 404
    assert client.put(
        "/api/v1/admin/rooms/9999999",
        headers=admin_auth_header,
        json={"so_phong": f"B4none{token}", "loai_phong_id": room_type_id, "trang_thai": "AVAILABLE"},
    ).status_code == 404
    assert other_room_id != room_id


def test_admin_room_delete_succeeds_without_booking_references(admin_auth_header):
    _, room_id = _create_b4_room(token=uuid.uuid4().hex[:10])

    response = client.delete(f"/api/v1/admin/rooms/{room_id}", headers=admin_auth_header)

    assert response.status_code == 204
    assert client.get(f"/api/v1/admin/rooms/{room_id}", headers=admin_auth_header).status_code == 404


def test_admin_room_delete_and_status_patch_are_blocked_by_unfinished_booking(admin_auth_header):
    _, room_id = _create_b4_room(token=uuid.uuid4().hex[:10])
    _create_b4_booking(room_id=room_id, booking_status="CONFIRMED")

    delete_response = client.delete(f"/api/v1/admin/rooms/{room_id}", headers=admin_auth_header)
    patch_response = client.patch(
        f"/api/v1/admin/rooms/{room_id}/status",
        headers=admin_auth_header,
        json={"status": "MAINTENANCE"},
    )

    assert delete_response.status_code == 409
    assert patch_response.status_code == 409


@pytest.mark.parametrize("booking_status", ["CANCELLED", "CHECKED_OUT"])
def test_admin_room_completed_bookings_do_not_block_status_patch(admin_auth_header, booking_status):
    _, room_id = _create_b4_room(token=uuid.uuid4().hex[:10])
    _create_b4_booking(room_id=room_id, booking_status=booking_status)

    response = client.patch(
        f"/api/v1/admin/rooms/{room_id}/status",
        headers=admin_auth_header,
        json={"status": "MAINTENANCE"},
    )

    assert response.status_code == 200
    assert response.json()["trang_thai"] == "MAINTENANCE"


def test_admin_room_delete_completed_booking_history_reports_schema_conflict(admin_auth_header):
    _, room_id = _create_b4_room(token=uuid.uuid4().hex[:10])
    _create_b4_booking(room_id=room_id, booking_status="CANCELLED")

    response = client.delete(f"/api/v1/admin/rooms/{room_id}", headers=admin_auth_header)

    assert response.status_code == 409
    assert response.json()["detail"] == "Cannot delete room with booking history"


def test_admin_room_status_patch_rejects_missing_room_and_invalid_status(admin_auth_header):
    _, room_id = _create_b4_room(token=uuid.uuid4().hex[:10])

    missing_response = client.patch(
        "/api/v1/admin/rooms/9999999/status",
        headers=admin_auth_header,
        json={"status": "MAINTENANCE"},
    )
    invalid_response = client.patch(
        f"/api/v1/admin/rooms/{room_id}/status",
        headers=admin_auth_header,
        json={"status": "BROKEN"},
    )

    assert missing_response.status_code == 404
    assert invalid_response.status_code == 400


def test_garbage_token_is_rejected():
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer not-a-real-token"},
    )

    assert response.status_code == 401


def test_my_bookings_requires_auth():
    response = client.get("/api/v1/bookings")

    assert response.status_code == 401


def test_my_bookings_returns_paginated_stub(user_auth_header):
    response = client.get("/api/v1/bookings", headers=user_auth_header)

    assert response.status_code == 200
    body = response.json()
    assert body["items"] == []
    assert body["total"] == 0
    assert body["page"] == 1
    assert body["page_size"] == 20


def test_checkout_returns_created_booking(user_auth_header):
    response = client.post(
        "/api/v1/bookings",
        headers=user_auth_header,
        json={
            "check_in": "2026-08-14",
            "check_out": "2026-08-16",
            "phong_ids": [1],
            "method": "BANKING",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["trang_thai"] == "CONFIRMED"
    assert body["payment"]["status"] == "PAID"


def test_admin_dashboard_requires_auth():
    response = client.get("/api/v1/admin/dashboard")

    assert response.status_code == 401


def test_admin_dashboard_returns_kpis(admin_auth_header):
    response = client.get("/api/v1/admin/dashboard", headers=admin_auth_header)

    assert response.status_code == 200
    body = response.json()
    assert "pending_count" in body
    assert "pending_refunds" in body
    assert "latest_bookings" in body
