import pytest
import uuid
from app.cache.keys import user_dashboard_key, user_summary_key, idempotency_key


def test_user_dashboard_key_isolation():
    """Different user IDs generate strictly isolated dashboard cache keys."""
    user_a_id = str(uuid.uuid4())
    user_b_id = str(uuid.uuid4())

    key_a = user_dashboard_key(user_a_id)
    key_b = user_dashboard_key(user_b_id)

    assert key_a != key_b
    assert user_a_id in key_a
    assert user_b_id in key_b
    assert key_a.startswith("matrigluco:v1:dashboard:")


def test_user_dashboard_key_contains_no_sensitive_values():
    """Dashboard cache keys do not embed health measurements or medical payload values."""
    user_id = str(uuid.uuid4())
    key = user_dashboard_key(user_id)

    assert "glucose" not in key
    assert "blood_pressure" not in key
    assert "insulin" not in key
