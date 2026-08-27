import pytest
from fastapi.testclient import TestClient


def test_security_headers_present(client: TestClient):
    """Verifies that hardened security headers are returned on API responses."""
    response = client.get("/api/v1/health/live")
    assert response.status_code == 200

    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert response.headers.get("X-Frame-Options") == "DENY"


def test_custom_request_id_validated(client: TestClient):
    """Valid X-Request-ID is preserved and reflected in response header."""
    custom_id = "valid-req-id-12345"
    response = client.get("/api/v1/health/live", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_id


def test_malicious_request_id_replaced(client: TestClient):
    """Oversized or unsafe X-Request-ID is replaced with safe generated UUID."""
    unsafe_id = "A" * 1000  # 1000 chars
    response = client.get("/api/v1/health/live", headers={"X-Request-ID": unsafe_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") != unsafe_id
    assert len(response.headers.get("X-Request-ID", "")) <= 64
