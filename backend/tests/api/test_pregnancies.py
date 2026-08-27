import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_pregnancy_crud_flow(client: TestClient, test_user_a: User, user_a_token: str):
    """POST, GET, PATCH /api/v1/pregnancies flow works with owner scoping."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    # 1. POST /pregnancies
    post_resp = client.post(
        "/api/v1/pregnancies",
        headers=headers,
        json={
            "pregnancy_week": 24,
            "expected_due_date": "2026-11-15",
            "previous_pregnancies": 1,
        },
    )
    assert post_resp.status_code == 201
    created_data = post_resp.json()
    assert created_data["pregnancy_week"] == 24
    assert created_data["expected_due_date"] == "2026-11-15"

    # 2. GET /pregnancies
    list_resp = client.get("/api/v1/pregnancies", headers=headers)
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert len(list_data) == 1
    assert list_data[0]["pregnancy_week"] == 24

    # 3. GET /pregnancies/{id}
    detail_resp = client.get(f"/api/v1/pregnancies/{created_data['id']}", headers=headers)
    assert detail_resp.status_code == 200

    # 4. PATCH /pregnancies/{id}
    patch_resp = client.patch(
        f"/api/v1/pregnancies/{created_data['id']}",
        headers=headers,
        json={"pregnancy_week": 25},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["pregnancy_week"] == 25


def test_pregnancy_cross_user_denial(
    client: TestClient, test_user_a: User, test_user_b: User, user_a_token: str, user_b_token: str
):
    """User A cannot access User B's pregnancy context (returns 404)."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    resp = client.get(f"/api/v1/pregnancies/{test_user_b.public_id}", headers=headers_a)
    assert resp.status_code == 404
