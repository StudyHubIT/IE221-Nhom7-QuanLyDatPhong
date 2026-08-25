import uuid

from fastapi.testclient import TestClient

from app.main import app


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


def test_list_public_room_types_returns_empty_collection():
    response = client.get("/api/v1/room-types")

    assert response.status_code == 200
    assert response.json() == []


def test_search_availability_requires_dates():
    response = client.get("/api/v1/rooms/availability")

    assert response.status_code == 422


def test_search_availability_returns_empty_list():
    response = client.get(
        "/api/v1/rooms/availability",
        params={"check_in": "2026-08-14", "check_out": "2026-08-16"},
    )

    assert response.status_code == 200
    assert response.json() == []


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
