import time
from datetime import timedelta
import pytest
from app.core.security import (
    get_password_hash,
    verify_password,
    validate_password_strength,
    create_access_token,
    decode_access_token,
    generate_opaque_token,
    hash_token,
    constant_time_compare,
)
from app.core.exceptions import (
    InvalidAccessTokenError,
    ExpiredAccessTokenError,
)


def test_argon2_password_hashing():
    """Verifies Argon2id password hash generation and verification."""
    password = "MySecurePassword123!"
    hashed = get_password_hash(password)

    assert hashed.startswith("$argon2id$")
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False
    assert verify_password("", hashed) is False


def test_password_strength_validation():
    """Enforces minimum length of 8 characters and maximum 128 characters."""
    validate_password_strength("validpassword123")

    with pytest.raises(ValueError, match="at least 8 characters"):
        validate_password_strength("short")

    with pytest.raises(ValueError, match="cannot exceed 128 characters"):
        validate_password_strength("a" * 129)


def test_jwt_token_creation_and_decoding():
    """Verifies access token structure, claims, and type safety."""
    user_id = "user-12345"
    token = create_access_token(user_id=user_id, role="admin", extra_claims={"org": "matrigluco"})

    payload = decode_access_token(token)
    assert payload["sub"] == user_id
    assert payload["role"] == "admin"
    assert payload["type"] == "access"
    assert payload["org"] == "matrigluco"
    assert "jti" in payload
    assert "iat" in payload
    assert "exp" in payload


def test_jwt_expired_token_rejected():
    """Expired access token is strictly rejected."""
    token = create_access_token(user_id="user-123", expires_delta=timedelta(seconds=-10))

    with pytest.raises(ExpiredAccessTokenError):
        decode_access_token(token)


def test_jwt_invalid_signature_rejected():
    """Tampered token is strictly rejected."""
    token = create_access_token(user_id="user-123")
    tampered = token[:-4] + "abcd"

    with pytest.raises(InvalidAccessTokenError):
        decode_access_token(tampered)


def test_opaque_token_generation_and_hashing():
    """Verifies high-entropy opaque token generation and SHA-256 deterministic hashing."""
    token1 = generate_opaque_token("rt_")
    token2 = generate_opaque_token("rt_")

    assert token1.startswith("rt_")
    assert token2.startswith("rt_")
    assert token1 != token2
    assert len(token1) >= 40

    hash1 = hash_token(token1)
    hash2 = hash_token(token1)
    hash3 = hash_token(token2)

    assert hash1 == hash2  # Deterministic
    assert hash1 != hash3
    assert len(hash1) == 64  # SHA-256 hex string


def test_constant_time_comparison():
    """Tests constant-time equality comparisons."""
    assert constant_time_compare("secret_token_123", "secret_token_123") is True
    assert constant_time_compare("secret_token_123", "wrong_token_456") is False
