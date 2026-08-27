import pytest
from app.cache.rate_limits import RateLimitService


def test_rate_limiter_allows_and_blocks():
    """RateLimitService correctly tracks request counts and blocks when limit is exceeded."""
    service = RateLimitService()
    scope = "test_login"
    identifier = "patient_user@example.com"

    service.reset(scope, identifier)

    # 1. Requests under limit (max 3 allowed in 60s)
    limited1, count1, retry1 = service.check_rate_limit(
        scope, identifier, max_requests=3, window_seconds=60
    )
    assert limited1 is False
    assert count1 == 1
    assert retry1 == 0

    limited2, count2, retry2 = service.check_rate_limit(
        scope, identifier, max_requests=3, window_seconds=60
    )
    assert limited2 is False
    assert count2 == 2

    limited3, count3, retry3 = service.check_rate_limit(
        scope, identifier, max_requests=3, window_seconds=60
    )
    assert limited3 is False
    assert count3 == 3

    # 2. 4th request exceeds limit -> is_limited is True with positive retry_after
    limited4, count4, retry4 = service.check_rate_limit(
        scope, identifier, max_requests=3, window_seconds=60
    )
    assert limited4 is True
    assert count4 == 4
    assert retry4 > 0

    # 3. Reset
    assert service.reset(scope, identifier) is True
    limited_after_reset, count_after_reset, _ = service.check_rate_limit(
        scope, identifier, max_requests=3, window_seconds=60
    )
    assert limited_after_reset is False
    assert count_after_reset == 1
