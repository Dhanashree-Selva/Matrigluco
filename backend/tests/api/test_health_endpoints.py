import pytest
from fastapi.testclient import TestClient


def test_health_live_probe(client: TestClient):
    """GET /api/v1/health/live verifies process liveness."""
    response = client.get("/api/v1/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_health_ready_probe(client: TestClient):
    """GET /api/v1/health/ready returns infrastructure readiness status."""
    response = client.get("/api/v1/health/ready")
    assert response.status_code in [200, 503]
    data = response.json()
    assert "status" in data
    assert "dependencies" in data
