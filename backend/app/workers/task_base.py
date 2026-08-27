import logging
from celery import Task
from typing import Optional, Any
from app.db.session import SessionLocal
from app.core.exceptions import (
    ApplicationError,
    DatabaseUnavailableError,
    StorageError,
    OCRProcessingError,
)

logger = logging.getLogger("matrigluco.workers.task_base")

# Exceptions considered transient and eligible for bounded automated retries
TRANSIENT_EXCEPTIONS = (
    ConnectionError,
    TimeoutError,
    DatabaseUnavailableError,
    StorageError,
    OCRProcessingError,
)


class DatabaseTask(Task):
    """
    Base Celery Task class managing task-scoped database sessions, structured logging,
    and automatic failure categorization (transient retry vs permanent fail).
    """

    _db: Optional[Any] = None

    @property
    def db(self):
        if self._db is None:
            self._db = SessionLocal()
        return self._db

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        """Ensures task-scoped database session is cleanly closed on task exit."""
        if self._db is not None:
            try:
                self._db.close()
            except Exception as e:
                logger.warning(f"Failed to close task DB session cleanly: {e}")
            finally:
                self._db = None

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Logs sanitized structured failure details."""
        logger.error(f"Celery Task '{self.name}' [{task_id}] failed: {type(exc).__name__}: {exc}")

    def is_transient_error(self, exc: Exception) -> bool:
        """Determines if an error is transient and eligible for retry."""
        return isinstance(exc, TRANSIENT_EXCEPTIONS)
