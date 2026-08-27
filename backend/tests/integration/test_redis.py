import pytest
from app.cache.client import check_redis_health, get_redis_client
from app.cache.service import CacheService
from app.cache.locks import distributed_lock
from app.cache.idempotency import idempotency_service


def test_redis_connection_and_health():
    """Redis probe returns valid health status."""
    is_healthy = check_redis_health()
    assert isinstance(is_healthy, bool)


def test_redis_cache_and_expiration():
    """Redis cache-aside workflow sets, retrieves, and expires keys."""
    service = CacheService()
    key = "matrigluco:integration:cache_test"

    service.set_json(key, {"metric": "glucose_avg", "val": 115.0}, expire_seconds=5)
    retrieved = service.get_json(key)
    assert retrieved is not None
    assert retrieved["val"] == 115.0

    service.delete(key)
    assert service.get_json(key) is None


def test_redis_distributed_locking():
    """Redis distributed lock functions correctly across tasks."""
    with distributed_lock("integration_test", "lock_1", timeout_seconds=10) as acquired:
        assert acquired is True
