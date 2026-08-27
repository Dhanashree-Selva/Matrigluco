import pytest
from app.cache.service import CacheService


def test_cache_service_json_serialization():
    """CacheService correctly serializes and deserializes arbitrary JSON structures."""
    service = CacheService()
    key = "matrigluco:test:json_data"
    data = {
        "user_id": "usr-12345",
        "scores": [0.1, 0.45, 0.89],
        "active": True,
        "nested": {"band": "high"},
    }

    # Set JSON
    assert service.set_json(key, data, expire_seconds=60) is True

    # Get JSON
    retrieved = service.get_json(key)
    assert retrieved == data
    assert retrieved["user_id"] == "usr-12345"
    assert retrieved["scores"] == [0.1, 0.45, 0.89]

    # Delete
    service.delete(key)
    assert service.get_json(key) is None


def test_cache_service_exists_and_delete_pattern():
    """CacheService supports existence checks and wildcard pattern deletion."""
    service = CacheService()
    prefix = "matrigluco:test:pattern:"
    service.set(f"{prefix}1", "val1", expire_seconds=60)
    service.set(f"{prefix}2", "val2", expire_seconds=60)
    service.set(f"{prefix}3", "val3", expire_seconds=60)

    assert service.exists(f"{prefix}1") is True
    assert service.exists(f"{prefix}2") is True

    # Delete pattern
    deleted = service.delete_pattern(f"{prefix}*")
    assert deleted >= 3

    assert service.exists(f"{prefix}1") is False
    assert service.exists(f"{prefix}2") is False
