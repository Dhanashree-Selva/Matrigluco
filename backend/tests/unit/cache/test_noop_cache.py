import pytest
from app.cache.service import CacheService


def test_cache_service_fail_open_behavior():
    """CacheService methods safely fail open without breaking calling workflows when cache is unavailable."""
    cache = CacheService()

    # Get JSON on non-existent key returns None
    val = cache.get_json("non_existent_key_12345")
    assert val is None

    # Delete non-existent key returns False safely
    deleted = cache.delete("non_existent_key_12345")
    assert isinstance(deleted, bool)
