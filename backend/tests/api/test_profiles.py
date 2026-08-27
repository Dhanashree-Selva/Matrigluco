import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_get_and_patch_profile_me(client: TestClient, test_user_a: User, user_a_token: str):
    """GET and PATCH /api/v1/profiles/me allows self-service updates and rejects forbidden fields."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    # 1. GET /profiles/me
    get_resp = client.get("/api/v1/profiles/me", headers=headers)
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["email"] == test_user_a.email

    # 2. PATCH /profiles/me with valid fields
    patch_resp = client.patch(
        "/api/v1/profiles/me",
        headers=headers,
        json={
            "full_name": "Updated Patient Name",
            "age": 29,
            "blood_group": "O+",
        },
    )
    assert patch_resp.status_code == 200
    patched_data = patch_resp.json()
    assert patched_data["full_name"] == "Updated Patient Name"
    assert patched_data["age"] == 29
    assert patched_data["blood_group"] == "O+"

    # 3. PATCH /profiles/me with forbidden field (role / user_id) returns 422
    attack_resp = client.patch(
        "/api/v1/profiles/me",
        headers=headers,
        json={"role": "admin"},
    )
    assert attack_resp.status_code == 422
