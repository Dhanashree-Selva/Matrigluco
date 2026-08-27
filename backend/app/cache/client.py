import logging
from typing import Optional
import redis
from app.core.config import get_settings

logger = logging.getLogger("matrigluco.cache.client")
settings = get_settings()


class RedisManager:
    """
    Manages Redis connection pool lifecycle for transient caching, session context, and locks.
    Note: Redis is transient infrastructure; MySQL is the durable source of truth.
    """

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or settings.REDIS_URL
        self._pool: Optional[redis.ConnectionPool] = None
        self._client: Optional[redis.Redis] = None

    def get_client(self) -> redis.Redis:
        """Retrieves or initializes Redis client using the shared connection pool."""
        if self._client is None:
            try:
                self._pool = redis.ConnectionPool.from_url(
                    self.redis_url,
                    max_connections=settings.REDIS_MAX_CONNECTIONS,
                    socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                    decode_responses=True,
                )
                self._client = redis.Redis(connection_pool=self._pool)
            except Exception as e:
                logger.warning(f"Failed to initialize pooled Redis client: {e}")
                self._client = redis.from_url(
                    self.redis_url,
                    socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                    decode_responses=True,
                )
        return self._client

    def ping(self) -> bool:
        """Probes Redis server responsiveness."""
        try:
            client = self.get_client()
            return bool(client.ping())
        except Exception as e:
            logger.debug(f"Redis ping probe failed (transient cache offline): {e}")
            return False

    def close(self) -> None:
        """Closes all active pooled Redis connections."""
        if self._pool is not None:
            try:
                self._pool.disconnect()
                logger.info("Redis connection pool disconnected.")
            except Exception as e:
                logger.error(f"Error disconnecting Redis pool: {e}")
        self._client = None
        self._pool = None


# Global singleton instance
redis_manager = RedisManager()


def get_redis_client() -> redis.Redis:
    """Returns shared Redis client instance."""
    return redis_manager.get_client()


def check_redis_health() -> bool:
    """Probes Redis health."""
    return redis_manager.ping()
