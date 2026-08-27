import pytest
from fastapi.testclient import TestClient


def test_cors_options_preflight_allowed_origin(client: TestClient):
    """Preflight OPTIONS request from configured origin succeeds with CORS headers."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization, Content-Type, X-Request-ID",
    }
    resp = client.options("/api/v1/auth/login", headers=headers)
    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert resp.headers.get("access-control-allow-credentials") == "true"
