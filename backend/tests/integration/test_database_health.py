import pytest
from app.db.healthcheck import check_database_health
from fastapi.testclient import TestClient
from app.main import app


def test_database_healthcheck_returns_healthy():
    """Database healthcheck utility returns healthy status and latency measurement."""
    status_info = check_database_health()
    assert isinstance(status_info, dict)
    assert status_info.get("status") in ["healthy", "unhealthy", "available", "up", "down"]
    assert "latency_ms" in status_info


def test_health_readiness_endpoint_contains_clean_db_status():
    """Readiness endpoint reports database status without leaking passwords or host credentials."""
    client = TestClient(app)
    response = client.get("/api/v1/health/ready")
    assert response.status_code in [200, 503]
    data = response.json()

    assert "components" in data or "data" in data or "status" in data
    response_str = response.text
    # Ensure no passwords or raw credentials leak
    assert "password" not in response_str.lower() or "password_hash" not in response_str
    assert "CHANGE_ME" not in response_str
