import pytest
import uuid


def test_refresh_token_rotation_and_reuse_rejection(client):
    """Validates that refreshing a token rotates it, and reusing the old token is rejected."""
    test_email = f"rotation-test-{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    # 1. Register
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": test_email,
            "password": password,
            "full_name": "Rotation Test User",
            "age": 28,
        },
    )
    assert reg_resp.status_code == 201

    # 2. Login -> Token Pair A
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": password},
    )
    assert login_resp.status_code == 200
    data_a = login_resp.json()
    assert "access_token" in data_a
    refresh_token_a = data_a["refresh_token"]

    # 3. Refresh with Token A -> Token Pair B
    refresh_resp_1 = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token_a},
    )
    assert refresh_resp_1.status_code == 200
    data_b = refresh_resp_1.json()
    refresh_token_b = data_b["refresh_token"]
    assert refresh_token_b != refresh_token_a

    # 4. Reusing Token A MUST fail (Token was already rotated/revoked)
    replay_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token_a},
    )
    assert replay_resp.status_code == 401
    assert replay_resp.json()["error"]["code"] == "REFRESH_TOKEN_REUSE_DETECTED"
