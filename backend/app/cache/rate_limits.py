"""
Privacy-Preserving Rate Limiting Service using Redis DB /0.

Uses SHA-256 hashed identities to avoid storing raw emails or IP addresses in Redis key names.
"""

import logging
from typing import Tuple
from app.cache.client import get_redis_client
from app.cache.keys import rate_limit_key

logger = logging.getLogger("matrigluco.cache.rate_limits")


class RateLimitService:
    """Fixed-window rate limiter using atomic Redis increment and expiry."""

    def __init__(self):
        self._client = get_redis_client()

    def check_rate_limit(
        self,
        scope: str,
        identifier: str,
        max_requests: int,
        window_seconds: int,
    ) -> Tuple[bool, int, int]:
        """
        Evaluates whether an identifier has exceeded the allowed request limit for a given scope.

        Returns:
            Tuple of (is_limited: bool, current_count: int, retry_after_seconds: int)
        """
        key = rate_limit_key(scope, identifier)
        try:
            # Atomic pipeline increment
            pipe = self._client.pipeline()
            pipe.incr(key)
            pipe.ttl(key)
            results = pipe.execute()

            current_count = int(results[0])
            ttl = int(results[1])

            # If newly created key (ttl == -1), set the expiration window
            if ttl == -1:
                self._client.expire(key, window_seconds)
                ttl = window_seconds

            is_limited = current_count > max_requests
            retry_after = max(ttl, 1) if is_limited else 0

            return is_limited, current_count, retry_after
        except Exception as e:
            logger.warning(f"Rate limit check failed for key '{key}': {e}")
            return False, 0, 0  # Fail open if Redis is temporarily offline

    def reset(self, scope: str, identifier: str) -> bool:
        """Resets rate limit counter (e.g. after successful login)."""
        key = rate_limit_key(scope, identifier)
        try:
            return bool(self._client.delete(key))
        except Exception as e:
            logger.warning(f"Failed to reset rate limit for key '{key}': {e}")
            return False


rate_limit_service = RateLimitService()
