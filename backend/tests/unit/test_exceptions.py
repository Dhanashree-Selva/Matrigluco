from app.core.exceptions import (
    ApplicationError,
    ResourceNotFoundError,
    ConflictError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    DatabaseUnavailableError,
    StorageError,
    MLInferenceError,
)


def test_exception_defaults():
    err = ResourceNotFoundError("User not found")
    assert err.code == "RESOURCE_NOT_FOUND"
    assert err.status_code == 404
    assert err.message == "User not found"


def test_conflict_error():
    err = ConflictError("Email already registered")
    assert err.code == "CONFLICT"
    assert err.status_code == 409


def test_database_unavailable_error():
    err = DatabaseUnavailableError("MySQL connection timed out")
    assert err.code == "DATABASE_UNAVAILABLE"
    assert err.status_code == 503


def test_custom_details_payload():
    err = ValidationError("Validation failed", details={"field": "email", "issue": "invalid"})
    assert err.code == "VALIDATION_ERROR"
    assert err.status_code == 422
    assert err.details["field"] == "email"
