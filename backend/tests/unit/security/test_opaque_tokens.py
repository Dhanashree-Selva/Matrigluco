import pytest
from app.core.security import generate_opaque_token, hash_opaque_token, constant_time_compare


def test_opaque_token_generation_and_hashing():
    """Generates high-entropy opaque random strings and verifiable SHA-256 hashes."""
    token_1 = generate_opaque_token()
    token_2 = generate_opaque_token()

    assert len(token_1) >= 32
    assert len(token_2) >= 32
    assert token_1 != token_2  # High entropy

    hash_1 = hash_opaque_token(token_1)
    hash_2 = hash_opaque_token(token_2)

    assert len(hash_1) == 64  # SHA-256 hex length
    assert len(hash_2) == 64
    assert hash_1 != hash_2
    assert hash_opaque_token(token_1) == hash_1  # Deterministic hash


def test_constant_time_comparison():
    """Validates constant-time string comparison for token checks."""
    assert constant_time_compare("secret_token_123", "secret_token_123") is True
    assert constant_time_compare("secret_token_123", "secret_token_456") is False
    assert constant_time_compare("secret_token_123", "") is False
