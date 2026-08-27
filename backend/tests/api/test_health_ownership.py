import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_health_detail_cross_user_denied(
    client: TestClient, test_user_a: User, test_user_b: User, user_a_token: str, user_b_token: str
):
    """User A cannot read User B's health measurement."""
    # User B creates a measurement
    b_resp = client.post(
        "/api/v1/health-measurements",
        headers={"Authorization": f"Bearer {user_b_token}"},
        json={
            "metric_type": "glucose",
            "value_primary": 130.0,
            "unit": "mg/dL",
        },
    )
    assert b_resp.status_code == 201
    b_id = b_resp.json()["id"]

    # User A attempts to read User B's measurement
    a_resp = client.get(
        f"/api/v1/health-measurements/{b_id}",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert a_resp.status_code == 404


def test_health_update_cross_user_denied(
    client: TestClient, test_user_b: User, user_a_token: str, user_b_token: str
):
    """User A cannot update User B's health measurement."""
    b_resp = client.post(
        "/api/v1/health-measurements",
        headers={"Authorization": f"Bearer {user_b_token}"},
        json={
            "metric_type": "weight",
            "value_primary": 65.0,
            "unit": "kg",
        },
    )
    assert b_resp.status_code == 201
    b_id = b_resp.json()["id"]

    a_resp = client.patch(
        f"/api/v1/health-measurements/{b_id}",
        headers={"Authorization": f"Bearer {user_a_token}"},
        json={"value_primary": 70.0},
    )
    assert a_resp.status_code == 404


def test_health_delete_cross_user_denied(
    client: TestClient, test_user_b: User, user_a_token: str, user_b_token: str
):
    """User A cannot delete User B's health measurement."""
    b_resp = client.post(
        "/api/v1/health-measurements",
        headers={"Authorization": f"Bearer {user_b_token}"},
        json={
            "metric_type": "glucose",
            "value_primary": 110.0,
            "unit": "mg/dL",
        },
    )
    assert b_resp.status_code == 201
    b_id = b_resp.json()["id"]

    a_resp = client.delete(
        f"/api/v1/health-measurements/{b_id}",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert a_resp.status_code == 404
