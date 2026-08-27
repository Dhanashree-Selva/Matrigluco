from fastapi.testclient import TestClient


def test_liveness_root_health(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert "environment" in data


def test_liveness_v1_health(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_readiness_probe_structure(client: TestClient):
    response = client.get("/health/ready")
    # Status code is either 200 (if DB is running) or 503 (if DB is offline in test runner)
    assert response.status_code in [200, 503]
    data = response.json()
    assert "status" in data
    assert "dependencies" in data
    assert "database" in data["dependencies"]
    assert "redis" in data["dependencies"]
    assert "storage" in data["dependencies"]
    assert "ml" in data["dependencies"]
    assert "ai" in data["dependencies"]
