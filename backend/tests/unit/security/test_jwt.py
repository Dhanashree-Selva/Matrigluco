import pytest
import time
from datetime import timedelta
import jwt
from app.core.security import create_access_token, decode_access_token
from app.core.config import get_settings
from app.core.exceptions import ExpiredAccessTokenError, InvalidAccessTokenError


def test_access_token_creation_and_decoding():
    """Access JWT contains required claims and decodes with valid signature."""
    user_id = "11111111-2222-3333-4444-555555555555"
    token = create_access_token(user_id=user_id, role="user")

    payload = decode_access_token(token)
    assert payload["sub"] == user_id
    assert payload["role"] == "user"
    assert payload.get("type") == "access"
    assert "exp" in payload
    assert "iat" in payload
    assert "jti" in payload


def test_expired_access_token_rejected():
    """Expired access token raises ExpiredAccessTokenError."""
    user_id = "11111111-2222-3333-4444-555555555555"
    expired_token = create_access_token(
        user_id=user_id,
        role="user",
        expires_delta=timedelta(seconds=-10),
    )

    with pytest.raises(ExpiredAccessTokenError):
        decode_access_token(expired_token)


def test_tampered_or_invalid_secret_rejected():
    """Tampered token or invalid signature raises InvalidAccessTokenError."""
    user_id = "11111111-2222-3333-4444-555555555555"
    token = create_access_token(user_id=user_id, role="user")

    # Tamper token string
    tampered_token = token[:-4] + "abcd"
    with pytest.raises(InvalidAccessTokenError):
        decode_access_token(tampered_token)

    # Token signed with different secret
    fake_token = jwt.encode(
        {"sub": user_id, "role": "user", "type": "access"},
        "wrong_signing_secret_key_123456789",
        algorithm="HS256",
    )
    with pytest.raises(InvalidAccessTokenError):
        decode_access_token(fake_token)
