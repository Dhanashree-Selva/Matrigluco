import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_get_current_user_me(client: TestClient, test_user_a: User, user_a_token: str):
    """GET /api/v1/users/me returns authenticated account profile."""
    headers = {"Authorization": f"Bearer {user_a_token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user_a.email
    assert data["id"] in [test_user_a.id, test_user_a.public_id]


def test_get_current_user_unauthenticated(client: TestClient):
    """GET /api/v1/users/me unauthenticated returns 401."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
