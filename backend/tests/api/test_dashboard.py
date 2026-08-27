import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_get_dashboard_summary(client: TestClient, test_user_a: User, user_a_token: str):
    """GET /api/v1/dashboard/summary returns consolidated maternal indicators."""
    headers = {"Authorization": f"Bearer {user_a_token}"}
    response = client.get("/api/v1/dashboard/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "latest_measurements" in data
    assert "trends" in data
    assert "measurement_counts" in data
    assert "upcoming_consultation" in data


def test_dashboard_summary_unauthenticated(client: TestClient):
    """Unauthenticated dashboard request returns 401."""
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 401
