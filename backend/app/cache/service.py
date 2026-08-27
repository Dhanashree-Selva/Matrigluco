import json
import logging
from typing import Any, Optional, List, Sequence, Protocol
from app.cache.client import get_redis_client
from app.cache.keys import user_dashboard_key, user_summary_key
from app.core.config import get_settings

logger = logging.getLogger("matrigluco.cache.service")


class CacheProtocol(Protocol):
    def get_json(self, key: str) -> Optional[Any]: ...
    def set_json(self, key: str, value: Any, expire_seconds: int = 300) -> bool: ...
    def get(self, key: str) -> Optional[str]: ...
    def set(self, key: str, value: str, expire_seconds: int = 300) -> bool: ...
    def delete(self, key: str) -> bool: ...
    def delete_many(self, keys: Sequence[str]) -> int: ...
    def delete_pattern(self, pattern: str) -> int: ...
    def exists(self, key: str) -> bool: ...


class NoOpCacheService:
    """No-op cache implementation used when CACHE_ENABLED=False or in test doubles."""

    def get_json(self, key: str) -> Optional[Any]:
        return None

    def set_json(self, key: str, value: Any, expire_seconds: int = 300) -> bool:
        return True

    def get(self, key: str) -> Optional[str]:
        return None

    def set(self, key: str, value: str, expire_seconds: int = 300) -> bool:
        return True

    def delete(self, key: str) -> bool:
        return True

    def delete_many(self, keys: Sequence[str]) -> int:
        return len(keys)

    def delete_pattern(self, pattern: str) -> int:
        return 0

    def exists(self, key: str) -> bool:
        return False


class RedisCacheService:
    """
    High-level JSON-aware caching service operating on Redis DB /0.
    Fails safely if Redis is offline without breaking primary database workflows.
    """

    def __init__(self):
        self._client = get_redis_client()

    def get_json(self, key: str) -> Optional[Any]:
        """Retrieves and deserializes JSON from cache. Returns None on cache miss or error."""
        try:
            val = self._client.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            logger.debug(f"Cache get failed for key '{key}': {e}")
        return None

    def set_json(self, key: str, value: Any, expire_seconds: int = 300) -> bool:
        """Serializes and saves value to cache with expiration."""
        try:
            payload = json.dumps(value, default=str)
            return bool(self._client.set(key, payload, ex=expire_seconds))
        except Exception as e:
            logger.debug(f"Cache set failed for key '{key}': {e}")
            return False

    def get(self, key: str) -> Optional[str]:
        """Retrieves raw string value from cache."""
        try:
            val = self._client.get(key)
            return str(val) if val is not None else None
        except Exception as e:
            logger.debug(f"Cache raw get failed for key '{key}': {e}")
            return None

    def set(self, key: str, value: str, expire_seconds: int = 300) -> bool:
        """Saves raw string value to cache with expiration."""
        try:
            return bool(self._client.set(key, value, ex=expire_seconds))
        except Exception as e:
            logger.debug(f"Cache raw set failed for key '{key}': {e}")
            return False

    def delete(self, key: str) -> bool:
        """Deletes a specific key from cache."""
        try:
            return bool(self._client.delete(key))
        except Exception as e:
            logger.debug(f"Cache delete failed for key '{key}': {e}")
            return False

    def delete_many(self, keys: Sequence[str]) -> int:
        """Deletes multiple keys from cache atomically."""
        if not keys:
            return 0
        try:
            return int(self._client.delete(*keys))
        except Exception as e:
            logger.debug(f"Cache delete_many failed: {e}")
            return 0

    def delete_pattern(self, pattern: str) -> int:
        """Deletes all keys matching a namespace pattern using SCAN."""
        deleted_count = 0
        try:
            cursor = "0"
            while cursor != 0:
                cursor, keys = self._client.scan(cursor=cursor, match=pattern, count=100)
                if keys:
                    deleted_count += self._client.delete(*keys)
        except Exception as e:
            logger.debug(f"Cache delete_pattern failed for '{pattern}': {e}")
        return deleted_count

    def exists(self, key: str) -> bool:
        """Checks whether a key exists in cache."""
        try:
            return bool(self._client.exists(key))
        except Exception as e:
            logger.debug(f"Cache exists check failed for key '{key}': {e}")
            return False


class CacheService:
    """
    Main cache service facade delegating to RedisCacheService or NoOpCacheService
    based on application configuration.
    """

    def __init__(self, override_backend: Optional[CacheProtocol] = None):
        settings = get_settings()
        if override_backend is not None:
            self._backend: CacheProtocol = override_backend
        elif settings.CACHE_ENABLED:
            self._backend = RedisCacheService()
        else:
            self._backend = NoOpCacheService()

    def get_json(self, key: str) -> Optional[Any]:
        return self._backend.get_json(key)

    def set_json(self, key: str, value: Any, expire_seconds: int = 300) -> bool:
        return self._backend.set_json(key, value, expire_seconds=expire_seconds)

    def get(self, key: str) -> Optional[str]:
        return self._backend.get(key)

    def set(self, key: str, value: str, expire_seconds: int = 300) -> bool:
        return self._backend.set(key, value, expire_seconds=expire_seconds)

    def delete(self, key: str) -> bool:
        return self._backend.delete(key)

    def delete_many(self, keys: Sequence[str]) -> int:
        return self._backend.delete_many(keys)

    def delete_pattern(self, pattern: str) -> int:
        if hasattr(self._backend, "delete_pattern"):
            return self._backend.delete_pattern(pattern)  # type: ignore[no-any-return]
        return 0

    def exists(self, key: str) -> bool:
        return self._backend.exists(key)


class DashboardCacheInvalidator:
    """Coordinates post-commit cache invalidation for user dashboard summaries."""

    def __init__(self, cache: Optional[CacheService] = None):
        self.cache = cache or CacheService()

    def after_health_change(self, user_id: str) -> None:
        self.cache.delete(user_dashboard_key(user_id))

    def after_prediction_created(self, user_id: str) -> None:
        self.cache.delete(user_dashboard_key(user_id))

    def after_consultation_change(self, user_id: str) -> None:
        self.cache.delete(user_dashboard_key(user_id))

    def after_report_processed(self, user_id: str) -> None:
        self.cache.delete(user_dashboard_key(user_id))
