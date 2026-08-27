import pytest
from fastapi.testclient import TestClient


def test_standard_error_envelope_404(client: TestClient):
    """404 Not Found returns normalized error envelope with code and request ID."""
    resp = client.get("/api/v1/non_existent_route_404")
    assert resp.status_code == 404
    data = resp.json()
    assert "error" in data
    assert "code" in data["error"]
    assert "message" in data["error"]
    assert "meta" in data
    assert "request_id" in data["meta"]
    assert resp.headers.get("X-Request-ID") == data["meta"]["request_id"]


def test_standard_error_envelope_422_validation(client: TestClient):
    """422 Validation Error returns normalized error envelope with structured details."""
    resp = client.post("/api/v1/auth/login", json={"invalid_key": "bad_value"})
    assert resp.status_code == 422
    data = resp.json()
    assert "error" in data
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"
    assert "details" in data["error"]
    assert isinstance(data["error"]["details"], list)
    assert "meta" in data
    assert "request_id" in data["meta"]


def test_standard_error_envelope_401_unauthenticated(client: TestClient):
    """401 Unauthorized returns normalized error envelope."""
    resp = client.get("/api/v1/profiles/me")
    assert resp.status_code == 401
    data = resp.json()
    assert "error" in data
    assert "code" in data["error"]
    assert "meta" in data
