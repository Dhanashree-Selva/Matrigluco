import pytest
from fastapi.testclient import TestClient


def test_request_id_and_timing_headers(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    assert "X-Process-Time" in response.headers
    assert response.headers["X-Request-ID"] != ""
