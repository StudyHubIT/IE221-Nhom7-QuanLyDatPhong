from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import app


client = TestClient(app)


def test_health_endpoint_reports_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_pages_returns_empty_collection_by_default():
    response = client.get("/api/pages")

    assert response.status_code == 200
    assert response.json() == []


def test_settings_parses_cors_origins_from_env_string(monkeypatch):
    monkeypatch.setenv("API_CORS_ORIGINS", "http://localhost:3001")

    settings = Settings()

    assert settings.api_cors_origins == ["http://localhost:3001"]
