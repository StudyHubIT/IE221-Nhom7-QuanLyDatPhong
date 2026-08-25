import pytest
from fastapi.testclient import TestClient

from app.main import app

SEED_USER_EMAIL = "user1@gmail.com"
SEED_ADMIN_EMAIL = "admin@hotel.com"
SEED_PASSWORD = "password123"


@pytest.fixture()
def user_auth_header() -> dict[str, str]:
    client = TestClient(app)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": SEED_USER_EMAIL, "password": SEED_PASSWORD},
    )
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_auth_header() -> dict[str, str]:
    client = TestClient(app)
    response = client.post(
        "/api/v1/admin/auth/login",
        json={"email": SEED_ADMIN_EMAIL, "password": SEED_PASSWORD},
    )
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
