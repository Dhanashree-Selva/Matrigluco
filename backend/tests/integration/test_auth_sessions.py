import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User


def test_session_listing_and_revocation(
    client: TestClient,
    test_user_a: User,
    test_user_b: User,
    user_a_token: str,
    user_b_token: str,
):
    """User can list and revoke their own sessions, but cannot revoke other users' sessions."""
    # User A logs in
    login_a = client.post(
        "/api/v1/auth/login",
        json={"email": test_user_a.email, "password": "Password123!"},
    )
    assert login_a.status_code == 200

    # User B logs in
    login_b = client.post(
        "/api/v1/auth/login",
        json={"email": test_user_b.email, "password": "Password123!"},
    )
    assert login_b.status_code == 200

    # User A lists sessions
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    sessions_a_resp = client.get("/api/v1/auth/sessions", headers=headers_a)
    assert sessions_a_resp.status_code == 200
    sessions_a = sessions_a_resp.json()["sessions"]
    assert len(sessions_a) >= 1
    session_a_id = sessions_a[0]["id"]

    # User B lists sessions
    headers_b = {"Authorization": f"Bearer {user_b_token}"}
    sessions_b_resp = client.get("/api/v1/auth/sessions", headers=headers_b)
    assert sessions_b_resp.status_code == 200
    sessions_b = sessions_b_resp.json()["sessions"]
    assert len(sessions_b) >= 1
    session_b_id = sessions_b[0]["id"]

    # Attack: User A attempts to revoke User B's session
    cross_revoke = client.delete(f"/api/v1/auth/sessions/{session_b_id}", headers=headers_a)
    assert cross_revoke.status_code == 404  # Not found under User A ownership!

    # User A successfully revokes their own session
    own_revoke = client.delete(f"/api/v1/auth/sessions/{session_a_id}", headers=headers_a)
    assert own_revoke.status_code == 204


def test_logout_all_sessions(client: TestClient, test_user_a: User, user_a_token: str):
    """Logout-all revokes all active sessions for current user."""
    # Create multiple sessions
    client.post("/api/v1/auth/login", json={"email": test_user_a.email, "password": "Password123!"})
    client.post("/api/v1/auth/login", json={"email": test_user_a.email, "password": "Password123!"})

    headers = {"Authorization": f"Bearer {user_a_token}"}
    sessions_before = client.get("/api/v1/auth/sessions", headers=headers).json()["sessions"]
    assert len(sessions_before) >= 2

    # Logout all
    logout_all_resp = client.post("/api/v1/auth/logout-all", headers=headers)
    assert logout_all_resp.status_code == 204

    # Active sessions list is now empty
    sessions_after = client.get("/api/v1/auth/sessions", headers=headers).json()["sessions"]
    assert len(sessions_after) == 0
