"""
Distributed Lock Implementation using Redis DB /0.

Guarantees:
1. Unique token per lock acquisition preventing accidental release of expired locks.
2. Mandatory timeout preventing permanent deadlocks.
3. Safe atomic Lua release script.
"""

import uuid
import time
import logging
from contextlib import contextmanager
from typing import Generator, Optional
from app.cache.client import get_redis_client
from app.cache.keys import distributed_lock_key

logger = logging.getLogger("matrigluco.cache.locks")

# Atomic release script ensuring only the token holder can release the lock
LUA_RELEASE_SCRIPT = """
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
"""


class DistributedLock:
    """Distributed lock handle using token verification for safe release."""

    def __init__(self, key: str, timeout_seconds: int = 30):
        self.key = key
        self.timeout_seconds = timeout_seconds
        self.token = str(uuid.uuid4())
        self._client = get_redis_client()
        self._acquired = False

    def acquire(self, blocking: bool = False, wait_timeout: float = 5.0) -> bool:
        """
        Attempts to acquire the lock.
        If blocking=True, retries until wait_timeout expires.
        """
        start_time = time.time()
        while True:
            try:
                # SET key token NX EX timeout_seconds
                acquired = self._client.set(
                    self.key,
                    self.token,
                    nx=True,
                    ex=self.timeout_seconds,
                )
                if acquired:
                    self._acquired = True
                    return True
            except Exception as e:
                logger.warning(f"Error acquiring distributed lock for '{self.key}': {e}")
                return False

            if not blocking or (time.time() - start_time) >= wait_timeout:
                return False
            time.sleep(0.1)

    def release(self) -> bool:
        """Releases the lock atomically only if token matches."""
        if not self._acquired:
            return False
        try:
            res = self._client.eval(LUA_RELEASE_SCRIPT, 1, self.key, self.token)
            self._acquired = False
            return bool(res)
        except Exception as e:
            logger.warning(f"Error releasing distributed lock for '{self.key}': {e}")
            return False


@contextmanager
def distributed_lock(
    resource_type: str,
    resource_id: str,
    timeout_seconds: int = 30,
    blocking: bool = False,
    wait_timeout: float = 5.0,
) -> Generator[bool, None, None]:
    """
    Context manager for distributed resource locking.

    Usage:
        with distributed_lock("report", report_id, timeout_seconds=60) as acquired:
            if not acquired:
                raise ConflictError("Report is currently being processed by another worker.")
            # Execute protected work...
    """
    key = distributed_lock_key(resource_type, resource_id)
    lock = DistributedLock(key=key, timeout_seconds=timeout_seconds)
    acquired = lock.acquire(blocking=blocking, wait_timeout=wait_timeout)
    try:
        yield acquired
    finally:
        if acquired:
            lock.release()
