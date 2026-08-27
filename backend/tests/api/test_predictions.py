import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User


def test_create_prediction_authenticated_success(
    client: TestClient, test_user_a: User, user_a_token: str
):
    """Authenticated user creates prediction and receives 201 Created with canonical features."""
    headers = {"Authorization": f"Bearer {user_a_token}"}
    payload = {
        "pregnancies": 2,
        "glucose": 145.0,
        "blood_pressure": 85.0,
        "skin_thickness": 28.0,
        "insulin": 130.0,
        "bmi": 29.5,
        "diabetes_pedigree_function": 0.52,
        "age": 33,
    }

    response = client.post("/api/v1/predictions", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()

    assert "id" in data
    assert data["probability"] > 0.0
    assert "probability_score" in data
    assert data["risk_band"] in ["low", "moderate", "high"]
    assert data["prediction_result"] in ["Diabetic", "Non-Diabetic"]
    assert data["model"]["key"] == "diabetes-risk"
    assert data["model"]["version"] == "1.0.0"
    assert "disclaimer" in data
    assert data["contains_imputed_values"] is False
    assert len(data["features_snapshot"]) == 8


def test_create_prediction_unauthenticated_fails(client: TestClient):
    """Unauthenticated prediction creation is rejected with 401."""
    payload = {
        "pregnancies": 1,
        "glucose": 120.0,
        "blood_pressure": 80.0,
        "skin_thickness": 20.0,
        "insulin": 80.0,
        "bmi": 25.0,
        "diabetes_pedigree_function": 0.35,
        "age": 28,
    }
    response = client.post("/api/v1/predictions", json=payload)
    assert response.status_code == 401


def test_create_prediction_missing_features_rejected_without_defaults(
    client: TestClient, user_a_token: str
):
    """Missing required model feature returns 422 and does not fabricate default zeros."""
    headers = {"Authorization": f"Bearer {user_a_token}"}
    incomplete_payload = {
        "glucose": 140.0,
        "blood_pressure": 80.0,
        # Missing skin_thickness, insulin, dpf, age
    }

    response = client.post("/api/v1/predictions", json=incomplete_payload, headers=headers)
    assert response.status_code == 422


def test_get_model_info_endpoint(client: TestClient):
    """GET /api/v1/predictions/model-info returns Model Card metadata and educational disclaimer."""
    response = client.get("/api/v1/predictions/model-info")
    assert response.status_code == 200
    data = response.json()

    assert data["model_key"] == "diabetes-risk"
    assert data["version"] == "1.0.0"
    assert len(data["feature_order"]) == 8
    assert "metrics" in data
    assert data["metrics"]["accuracy"] > 0.70
    assert "educational_notice" in data


def test_list_and_get_prediction_detail(client: TestClient, test_user_a: User, user_a_token: str):
    """User can list their predictions and fetch specific detail by UUID."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    # Create a prediction
    create_resp = client.post(
        "/api/v1/predictions",
        headers=headers,
        json={
            "pregnancies": 1,
            "glucose": 110.0,
            "blood_pressure": 70.0,
            "skin_thickness": 20.0,
            "insulin": 75.0,
            "bmi": 23.5,
            "diabetes_pedigree_function": 0.28,
            "age": 26,
        },
    )
    assert create_resp.status_code == 201
    pred_id = create_resp.json()["id"]

    # List predictions
    list_resp = client.get("/api/v1/predictions?page=1&page_size=10", headers=headers)
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["pagination"]["total"] >= 1
    assert len(list_data["items"]) >= 1

    # Get specific detail
    detail_resp = client.get(f"/api/v1/predictions/{pred_id}", headers=headers)
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["id"] == pred_id
    assert detail_data["features_snapshot"]["glucose"] == 110.0


def test_delete_prediction_soft_deletes(client: TestClient, test_user_a: User, user_a_token: str):
    """Deleting a prediction archives it, removing it from active list and detail."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    create_resp = client.post(
        "/api/v1/predictions",
        headers=headers,
        json={
            "pregnancies": 2,
            "glucose": 125.0,
            "blood_pressure": 75.0,
            "skin_thickness": 22.0,
            "insulin": 85.0,
            "bmi": 26.0,
            "diabetes_pedigree_function": 0.32,
            "age": 29,
        },
    )
    pred_id = create_resp.json()["id"]

    # Delete (archive)
    del_resp = client.delete(f"/api/v1/predictions/{pred_id}", headers=headers)
    assert del_resp.status_code == 204

    # Getting detail of archived prediction returns 404
    get_after_del = client.get(f"/api/v1/predictions/{pred_id}", headers=headers)
    assert get_after_del.status_code == 404


def test_cross_user_prediction_idor_protection(
    client: TestClient,
    test_user_a: User,
    test_user_b: User,
    user_a_token: str,
    user_b_token: str,
):
    """User A cannot view or delete User B's prediction by UUID (strictly 404 Not Found)."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # User B creates a prediction
    create_b = client.post(
        "/api/v1/predictions",
        headers=headers_b,
        json={
            "pregnancies": 3,
            "glucose": 160.0,
            "blood_pressure": 90.0,
            "skin_thickness": 35.0,
            "insulin": 200.0,
            "bmi": 34.0,
            "diabetes_pedigree_function": 0.85,
            "age": 38,
        },
    )
    assert create_b.status_code == 201
    pred_b_id = create_b.json()["id"]

    # Attack 1: User A attempts to view User B's prediction detail
    attack_get = client.get(f"/api/v1/predictions/{pred_b_id}", headers=headers_a)
    assert attack_get.status_code == 404

    # Attack 2: User A attempts to delete User B's prediction
    attack_del = client.delete(f"/api/v1/predictions/{pred_b_id}", headers=headers_a)
    assert attack_del.status_code == 404
