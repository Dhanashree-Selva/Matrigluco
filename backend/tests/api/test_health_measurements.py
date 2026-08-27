import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_health_measurements_create_and_list(
    client: TestClient, test_user_a: User, user_a_token: str
):
    """POST /api/v1/health-measurements creates valid measurement."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    # 1. POST glucose measurement
    post_resp = client.post(
        "/api/v1/health-measurements",
        headers=headers,
        json={
            "metric_type": "glucose",
            "value_primary": 118.5,
            "unit": "mg/dL",
            "notes": "Fasting glucose test",
        },
    )
    assert post_resp.status_code == 201
    data = post_resp.json()
    assert data["metric_type"] == "glucose"
    assert data["value_primary"] == 118.5
    assert data["unit"] == "mg/dL"

    # 2. GET /health-measurements
    list_resp = client.get("/api/v1/health-measurements", headers=headers)
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["total"] >= 1
    assert len(list_data["items"]) >= 1


def test_health_measurement_blood_pressure_validation(client: TestClient, user_a_token: str):
    """POST blood_pressure requires both systolic and diastolic values in mmHg."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    # Valid Blood Pressure
    bp_resp = client.post(
        "/api/v1/health-measurements",
        headers=headers,
        json={
            "metric_type": "blood_pressure",
            "systolic": 120.0,
            "diastolic": 80.0,
            "unit": "mmHg",
        },
    )
    assert bp_resp.status_code == 201
    bp_data = bp_resp.json()
    assert bp_data["value_primary"] == 120.0
    assert bp_data["value_secondary"] == 80.0
    assert bp_data["unit"] == "mmHg"

    # Missing Diastolic rejected
    bad_bp = client.post(
        "/api/v1/health-measurements",
        headers=headers,
        json={
            "metric_type": "blood_pressure",
            "systolic": 120.0,
            "unit": "mmHg",
        },
    )
    assert bad_bp.status_code == 422


def test_health_measurement_extra_field_rejected(client: TestClient, user_a_token: str):
    """Extra fields like user_id are forbidden in request schema."""
    headers = {"Authorization": f"Bearer {user_a_token}"}
    attack_resp = client.post(
        "/api/v1/health-measurements",
        headers=headers,
        json={
            "metric_type": "glucose",
            "value_primary": 120.0,
            "unit": "mg/dL",
            "user_id": "malicious-user-id",
        },
    )
    assert attack_resp.status_code == 422
