import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.main import create_app


def test_create_app_returns_fastapi_instance():
    """Application factory produces a properly configured FastAPI application."""
    app = create_app()
    assert isinstance(app, FastAPI)
    assert app.title in ["Matrigluco", "MatriGluco API", "MatriGluco"]
    assert app.docs_url == "/docs"
    assert app.redoc_url == "/redoc"


def test_routes_registration():
    """Verifies that canonical v1 routes and legacy compatibility routes are registered in OpenAPI paths."""
    app = create_app()
    openapi_schema = app.openapi()
    paths = openapi_schema.get("paths", {})

    # Health endpoints
    assert "/health/live" in paths or "/api/v1/health/live" in paths
    assert "/health/ready" in paths or "/api/v1/health/ready" in paths

    # Root endpoint
    assert "/" in paths

    # Canonical v1 prefix
    assert any(p.startswith("/api/v1") for p in paths)

    # Legacy compatibility prefix
    assert any(p.startswith("/api") for p in paths)


def test_middleware_request_id_and_security_headers():
    """TestClient receives X-Request-ID and protective security headers."""
    app = create_app()
    client = TestClient(app)

    response = client.get("/api/v1/health/live")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"


def test_standard_error_response_shape():
    """Triggering a 404 returns the standardized MatriGluco error response envelope."""
    app = create_app()
    client = TestClient(app)

    response = client.get("/api/v1/non-existent-endpoint-xyz")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert "code" in data["error"]
    assert "message" in data["error"]
    assert "meta" in data
    assert "request_id" in data["meta"]
