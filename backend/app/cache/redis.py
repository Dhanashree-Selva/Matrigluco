"""
Backward-compatibility adapter for app.cache.redis.
Re-exports from app.cache.client.
"""

from app.cache.client import (
    RedisManager,
    redis_manager,
    get_redis_client,
    check_redis_health,
)
