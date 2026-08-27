"""
Transient Request Idempotency Layer using Redis DB /0.

Guarantees:
1. User-scoped keys prevent cross-user key collision.
2. Fast in-progress locking prevents duplicate simultaneous execution.
3. Caches response payloads for idempotent retries.
"""

import json
import logging
from typing import Optional, Any, Dict
from app.cache.client import get_redis_client
from app.cache.keys import idempotency_key

logger = logging.getLogger("matrigluco.cache.idempotency")


class IdempotencyService:
    """Manages transient idempotency records in Redis DB /0."""

    def __init__(self):
        self._client = get_redis_client()

    def check_or_set_in_progress(
        self, scope: str, user_id: str, client_key: str, ttl_seconds: int = 120
    ) -> bool:
        """
        Attempts to mark an idempotency key as 'IN_PROGRESS'.
        Returns True if this is the first execution (lock acquired),
        or False if a request with this key is already in progress or completed.
        """
        key = idempotency_key(scope, user_id, client_key)
        try:
            payload = json.dumps({"status": "IN_PROGRESS"})
            return bool(self._client.set(key, payload, nx=True, ex=ttl_seconds))
        except Exception as e:
            logger.warning(f"Idempotency check failed for key '{key}': {e}")
            return True  # Fallback to proceed if Redis is unavailable

    def record_completed(
        self, scope: str, user_id: str, client_key: str, result_data: Any, ttl_seconds: int = 86400
    ) -> bool:
        """Saves completed operation output for idempotent repeat queries."""
        key = idempotency_key(scope, user_id, client_key)
        try:
            payload = json.dumps({"status": "COMPLETED", "data": result_data}, default=str)
            return bool(self._client.set(key, payload, ex=ttl_seconds))
        except Exception as e:
            logger.warning(f"Failed to record idempotency completion for key '{key}': {e}")
            return False

    def get_result(self, scope: str, user_id: str, client_key: str) -> Optional[Dict[str, Any]]:
        """Retrieves cached idempotency record if present."""
        key = idempotency_key(scope, user_id, client_key)
        try:
            val = self._client.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            logger.warning(f"Failed to get idempotency result for key '{key}': {e}")
        return None

    def clear(self, scope: str, user_id: str, client_key: str) -> bool:
        """Clears idempotency record (e.g. if operation failed and should be retryable)."""
        key = idempotency_key(scope, user_id, client_key)
        try:
            return bool(self._client.delete(key))
        except Exception as e:
            logger.warning(f"Failed to clear idempotency key '{key}': {e}")
            return False


idempotency_service = IdempotencyService()
