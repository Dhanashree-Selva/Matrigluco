import pytest
from app.workers.task_base import DatabaseTask
from app.core.exceptions import (
    DatabaseUnavailableError,
    StorageError,
    ValidationError,
    AuthorizationError,
)


def test_database_task_error_classification():
    """DatabaseTask correctly categorizes transient retryable errors vs permanent failures."""
    task = DatabaseTask()

    # Transient errors (retryable)
    assert task.is_transient_error(TimeoutError("Redis connection timed out")) is True
    assert task.is_transient_error(ConnectionError("Socket disconnected")) is True
    assert (
        task.is_transient_error(DatabaseUnavailableError("MySQL connection pool exhausted")) is True
    )
    assert task.is_transient_error(StorageError("Private storage write timeout")) is True

    # Permanent errors (non-retryable)
    assert task.is_transient_error(ValidationError(message="Invalid format")) is False
    assert task.is_transient_error(AuthorizationError("Access denied")) is False
    assert task.is_transient_error(ValueError("Bad parameter")) is False
