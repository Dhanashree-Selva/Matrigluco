import pytest
from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["api_v1"] == "/api/v1"


def test_health_endpoints(client: TestClient):
    # Liveness
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

    # Readiness
    resp = client.get("/health/ready")
    assert resp.status_code in [200, 503]
    data = resp.json()
    assert "database" in data
    assert "redis" in data


def test_openapi_schema(client: TestClient):
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    data = resp.json()
    assert "paths" in data
    assert "/api/v1/predictions/predict" in data["paths"]
    assert "/api/v1/auth/signup" in data["paths"]
    assert "/api/v1/chatbot/conversations" in data["paths"]


def test_predict_risk_endpoint(client: TestClient):
    payload = {
        "pregnancies": 2,
        "glucose": 140.0,
        "blood_pressure": 80.0,
        "skin_thickness": 20.0,
        "insulin": 85.0,
        "bmi": 29.5,
        "diabetes_pedigree": 0.35,
        "age": 28,
    }
    resp = client.post("/api/v1/predictions/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "prediction_result" in data
    assert "risk_level" in data
    assert "probability_score" in data
