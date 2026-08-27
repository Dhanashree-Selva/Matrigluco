import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.auth import UserSession, AuthToken
from app.core.security import hash_token


def test_user_registration_success(client: TestClient, db_session: Session):
    """Registration creates user with Argon2 hash and issues tokens."""
    payload = {
        "email": "NewMom@Example.com",
        "password": "StrongPassword123!",
        "full_name": "New Mother",
        "expected_due_date": "2026-11-20",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newmom@example.com"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]

    # Verify user exists in database with Argon2 hash
    user = db_session.query(User).filter(User.email_normalized == "newmom@example.com").first()
    assert user is not None
    assert user.password_hash.startswith("$argon2id$")
    assert user.password_hash != "StrongPassword123!"


def test_duplicate_registration_rejected(client: TestClient, test_user_a: User):
    """Duplicate email registration is rejected with 409 Conflict."""
    payload = {
        "email": "USER_A@example.com",
        "password": "AnotherPassword123!",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "CONFLICT"


def test_user_login_success(client: TestClient, test_user_a: User):
    """Login with valid credentials succeeds and returns token pair."""
    payload = {
        "email": "user_a@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == test_user_a.email


def test_login_invalid_password_fails_generic(client: TestClient, test_user_a: User):
    """Invalid password returns generic 401 Unauthorized."""
    payload = {
        "email": "user_a@example.com",
        "password": "WrongPassword999!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_login_nonexistent_email_fails_generic(client: TestClient):
    """Non-existent email returns generic 401 Unauthorized."""
    payload = {
        "email": "nonexistent@example.com",
        "password": "AnyPassword123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_login_disabled_account_rejected(
    client: TestClient, test_user_a: User, db_session: Session
):
    """Disabled account login is rejected with 403 Forbidden."""
    test_user_a.status = "disabled"
    db_session.commit()

    payload = {
        "email": test_user_a.email,
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "ACCOUNT_DISABLED"


def test_get_me_authenticated(client: TestClient, test_user_a: User, user_a_token: str):
    """GET /auth/me returns authenticated user principal."""
    headers = {"Authorization": f"Bearer {user_a_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user_a.email
    assert data["id"] == test_user_a.id


def test_get_me_unauthenticated_fails(client: TestClient):
    """GET /auth/me without token returns 401 Unauthorized."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_refresh_token_rotation_lifecycle(client: TestClient, test_user_a: User):
    """Refresh token rotation issues new access token + new refresh token, and revokes old token."""
    # 1. Login to get initial refresh token
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": test_user_a.email, "password": "Password123!"},
    )
    assert login_resp.status_code == 200
    initial_refresh = login_resp.json()["refresh_token"]

    # 2. Use initial refresh token -> receives rotated tokens
    refresh_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh},
    )
    assert refresh_resp.status_code == 200
    rotated_data = refresh_resp.json()
    new_refresh = rotated_data["refresh_token"]
    assert new_refresh != initial_refresh

    # 3. Presenting old initial refresh token triggers REUSE DETECTION!
    reuse_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh},
    )
    assert reuse_resp.status_code == 401
    assert reuse_resp.json()["error"]["code"] == "REFRESH_TOKEN_REUSE_DETECTED"

    # 4. Subsequent use of child token in compromised family also fails
    compromised_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": new_refresh},
    )
    assert compromised_resp.status_code == 401


def test_logout_revokes_session(client: TestClient, test_user_a: User):
    """Logout invalidates the refresh token."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": test_user_a.email, "password": "Password123!"},
    )
    refresh_token = login_resp.json()["refresh_token"]

    logout_resp = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
    )
    assert logout_resp.status_code == 204

    # Using revoked token now fails
    refresh_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_resp.status_code == 401


def test_password_change_revokes_sessions(client: TestClient, test_user_a: User, user_a_token: str):
    """Changing password updates hash and revokes existing refresh tokens."""
    # Login to obtain a refresh token
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": test_user_a.email, "password": "Password123!"},
    )
    old_refresh = login_resp.json()["refresh_token"]

    # Change password
    headers = {"Authorization": f"Bearer {user_a_token}"}
    change_resp = client.post(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"current_password": "Password123!", "new_password": "BrandNewPassword123!"},
    )
    assert change_resp.status_code == 200

    # Old password no longer works
    fail_login = client.post(
        "/api/v1/auth/login",
        json={"email": test_user_a.email, "password": "Password123!"},
    )
    assert fail_login.status_code == 401

    # New password works
    success_login = client.post(
        "/api/v1/auth/login",
        json={"email": test_user_a.email, "password": "BrandNewPassword123!"},
    )
    assert success_login.status_code == 200

    # Prior refresh token is revoked
    old_refresh_use = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert old_refresh_use.status_code == 401


def test_password_reset_flow(client: TestClient, test_user_a: User, db_session: Session):
    """Forgot password creates one-time token and resets password upon presentation."""
    # Request reset
    forgot_resp = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": test_user_a.email},
    )
    assert forgot_resp.status_code == 200

    # Retrieve generated reset token hash from DB for test verification
    token_record = (
        db_session.query(AuthToken)
        .filter(AuthToken.user_id == test_user_a.id, AuthToken.token_type == "password_reset")
        .order_by(AuthToken.created_at.desc())
        .first()
    )
    assert token_record is not None

    from app.core.security import generate_opaque_token

    raw_token = generate_opaque_token("rst_test_")
    token_record.token_hash = hash_token(raw_token)
    db_session.commit()

    reset_resp = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": "ResetPassword987!"},
    )
    assert reset_resp.status_code == 200

    # Login with new password
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": test_user_a.email, "password": "ResetPassword987!"},
    )
    assert login_resp.status_code == 200

    # Replay of consumed token fails
    replay_resp = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": "AnotherNewPassword123!"},
    )
    assert replay_resp.status_code == 400
    assert replay_resp.json()["error"]["code"] == "CONSUMED_AUTH_TOKEN"


def test_resend_verification_endpoint(client: TestClient, test_user_a: User, db_session: Session):
    """Resending verification token creates a new email_verification token and returns 200."""
    # Set user as unverified for test
    test_user_a.is_email_verified = False
    db_session.commit()

    resp = client.post(
        "/api/v1/auth/resend-verification",
        json={"email": test_user_a.email},
    )
    assert resp.status_code == 200
    assert "verification link will be sent" in resp.json()["message"]

    # Verify a new verification token exists in DB
    token_record = (
        db_session.query(AuthToken)
        .filter(AuthToken.user_id == test_user_a.id, AuthToken.token_type == "email_verification")
        .order_by(AuthToken.created_at.desc())
        .first()
    )
    assert token_record is not None
    assert token_record.consumed_at is None
