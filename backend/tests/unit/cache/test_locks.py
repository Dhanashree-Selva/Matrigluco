import pytest
from app.cache.locks import DistributedLock, distributed_lock


def test_distributed_lock_acquire_and_release():
    """DistributedLock acquires lock and safely releases it using unique token verification."""
    key = "matrigluco:test:lock:report_123"
    lock = DistributedLock(key=key, timeout_seconds=10)

    assert lock.acquire() is True
    # Attempting to acquire again with another instance must fail
    lock2 = DistributedLock(key=key, timeout_seconds=10)
    assert lock2.acquire() is False

    # Release original lock
    assert lock.release() is True

    # Now lock2 can acquire
    assert lock2.acquire() is True
    assert lock2.release() is True


def test_distributed_lock_context_manager():
    """Context manager properly acquires and releases distributed lock."""
    resource_type = "test_resource"
    resource_id = "res-999"

    with distributed_lock(resource_type, resource_id, timeout_seconds=10) as acquired:
        assert acquired is True

        # Simultaneous lock on same resource fails
        with distributed_lock(resource_type, resource_id, timeout_seconds=10) as acquired2:
            assert acquired2 is False

    # After exit, resource is unlocked
    with distributed_lock(resource_type, resource_id, timeout_seconds=10) as acquired3:
        assert acquired3 is True
