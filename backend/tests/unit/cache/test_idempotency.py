import pytest
from app.cache.idempotency import IdempotencyService


def test_idempotency_workflow():
    """IdempotencyService protects against duplicate execution and caches completed output."""
    service = IdempotencyService()
    scope = "report_upload"
    user_id = "usr-abc"
    client_key = "req-key-12345"

    # 1. First execution acquires in-progress lock
    assert service.check_or_set_in_progress(scope, user_id, client_key, ttl_seconds=60) is True

    # 2. Duplicate concurrent request fails to acquire
    assert service.check_or_set_in_progress(scope, user_id, client_key, ttl_seconds=60) is False

    # 3. Record completion result
    result_payload = {"report_id": "rep-777", "status": "uploaded"}
    assert (
        service.record_completed(scope, user_id, client_key, result_payload, ttl_seconds=60) is True
    )

    # 4. Subsequent queries return the cached result
    saved = service.get_result(scope, user_id, client_key)
    assert saved is not None
    assert saved["status"] == "COMPLETED"
    assert saved["data"]["report_id"] == "rep-777"

    # 5. Clear
    assert service.clear(scope, user_id, client_key) is True
    assert service.get_result(scope, user_id, client_key) is None
