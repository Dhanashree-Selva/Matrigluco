import pytest
from app.core.security import get_password_hash, verify_password, validate_password_strength
from app.core.exceptions import ValidationError


def test_argon2_hashing_and_verification():
    """Argon2id produces verifiable, non-identical salted hashes for identical passwords."""
    raw_pw = "SuperSecurePassword123!"
    hash_1 = get_password_hash(raw_pw)
    hash_2 = get_password_hash(raw_pw)

    assert hash_1.startswith("$argon2")
    assert hash_2.startswith("$argon2")
    assert hash_1 != hash_2  # Salt difference
    assert verify_password(raw_pw, hash_1) is True
    assert verify_password(raw_pw, hash_2) is True


def test_invalid_password_verification():
    """Incorrect passwords fail verification cleanly."""
    raw_pw = "CorrectPassword123!"
    hash_val = get_password_hash(raw_pw)

    assert verify_password("WrongPassword123!", hash_val) is False
    assert verify_password("", hash_val) is False
    assert verify_password(raw_pw, "") is False


def test_password_policy_validation():
    """Enforces minimum length requirements."""
    # Valid passwords
    validate_password_strength("ValidPass123!")
    validate_password_strength("AnotherStrongPassword2026#")

    # Short password rejected
    with pytest.raises((ValueError, ValidationError)):
        validate_password_strength("Short1!")
