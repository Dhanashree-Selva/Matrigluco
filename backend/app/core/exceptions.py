import logging
from typing import Any, Optional, Dict, List
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("matrigluco.core.exceptions")


# ── Domain Base Exception ─────────────────────────────────────────────────────


class ApplicationError(Exception):
    """Base domain exception for all MatriGluco application errors."""

    code: str = "INTERNAL_ERROR"
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR

    def __init__(
        self,
        message: str = "An unexpected error occurred.",
        code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status_code: Optional[int] = None,
        **kwargs: Any,
    ):
        super().__init__(message)
        self.message = message
        if code:
            self.code = code
        if status_code:
            self.status_code = status_code
        self.details = details or {}


# ── General Resource & Persistence Exceptions ─────────────────────────────────


class ResourceNotFoundError(ApplicationError):
    code = "RESOURCE_NOT_FOUND"
    status_code = status.HTTP_404_NOT_FOUND

    def __init__(
        self,
        message: Optional[str] = None,
        resource: Optional[str] = None,
        identifier: Optional[Any] = None,
        details: Optional[Dict[str, Any]] = None,
        code: Optional[str] = None,
        status_code: Optional[int] = None,
        **kwargs: Any,
    ):
        if message is None:
            if resource and identifier:
                message = f"{resource} with identifier '{identifier}' was not found."
            elif resource:
                message = f"{resource} was not found."
            else:
                message = "Requested resource was not found."
        merged_details = details or {}
        if resource:
            merged_details["resource"] = resource
        if identifier:
            merged_details["identifier"] = str(identifier)
        super().__init__(
            message=message,
            code=code or self.code,
            details=merged_details,
            status_code=status_code or self.status_code,
        )


class ConflictError(ApplicationError):
    code = "CONFLICT"
    status_code = status.HTTP_409_CONFLICT


class ValidationError(ApplicationError):
    code = "VALIDATION_ERROR"
    status_code = 422


class InfrastructureError(ApplicationError):
    code = "INFRASTRUCTURE_UNAVAILABLE"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


class DatabaseUnavailableError(InfrastructureError):
    code = "DATABASE_UNAVAILABLE"


class RedisUnavailableError(InfrastructureError):
    code = "REDIS_UNAVAILABLE"


class StorageError(ApplicationError):
    code = "STORAGE_ERROR"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR


class MLInferenceError(ApplicationError):
    code = "ML_INFERENCE_ERROR"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR


class MLModelNotFoundError(MLInferenceError):
    code = "ML_MODEL_NOT_FOUND"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


class MLArtifactLoadError(MLInferenceError):
    code = "ML_ARTIFACT_LOAD_ERROR"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


class MLArtifactChecksumError(MLInferenceError):
    code = "ML_ARTIFACT_CHECKSUM_ERROR"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR


class MLFeatureContractError(ValidationError):
    code = "ML_FEATURE_CONTRACT_ERROR"


class MLFeatureValidationError(ValidationError):
    code = "ML_FEATURE_VALIDATION_ERROR"


class MLFeatureIncompleteError(ValidationError):
    code = "ML_FEATURES_INCOMPLETE"
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY

    def __init__(
        self,
        missing_features: List[str],
        message: str = "Required clinical model inputs are missing or unmappable.",
    ):
        super().__init__(
            message=message, code=self.code, details={"missing_features": missing_features}
        )


class ModelVersionNotRegisteredError(MLInferenceError):
    code = "MODEL_VERSION_NOT_REGISTERED"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


class PredictionNotFoundError(ResourceNotFoundError):
    code = "PREDICTION_NOT_FOUND"

    def __init__(self, identifier: Optional[Any] = None):
        super().__init__(resource="RiskAssessment", identifier=identifier)


# ── Authentication & Authorization Domain Exceptions ──────────────────────────


class AuthenticationError(ApplicationError):
    code = "AUTHENTICATION_FAILED"
    status_code = status.HTTP_401_UNAUTHORIZED


class InvalidCredentialsError(AuthenticationError):
    code = "INVALID_CREDENTIALS"
    status_code = status.HTTP_401_UNAUTHORIZED

    def __init__(self, message: str = "Invalid email or password."):
        super().__init__(message=message, code=self.code, status_code=self.status_code)


class AuthenticationRequiredError(AuthenticationError):
    code = "AUTHENTICATION_REQUIRED"
    status_code = status.HTTP_401_UNAUTHORIZED

    def __init__(self, message: str = "Authentication credentials were not provided."):
        super().__init__(message=message, code=self.code, status_code=self.status_code)


class InvalidAccessTokenError(AuthenticationError):
    code = "INVALID_ACCESS_TOKEN"
    status_code = status.HTTP_401_UNAUTHORIZED


class ExpiredAccessTokenError(AuthenticationError):
    code = "EXPIRED_ACCESS_TOKEN"
    status_code = status.HTTP_401_UNAUTHORIZED


class InvalidRefreshTokenError(AuthenticationError):
    code = "INVALID_REFRESH_TOKEN"
    status_code = status.HTTP_401_UNAUTHORIZED


class RefreshTokenExpiredError(AuthenticationError):
    code = "REFRESH_TOKEN_EXPIRED"
    status_code = status.HTTP_401_UNAUTHORIZED


class RefreshTokenReuseDetectedError(AuthenticationError):
    code = "REFRESH_TOKEN_REUSE_DETECTED"
    status_code = status.HTTP_401_UNAUTHORIZED


class AuthorizationError(ApplicationError):
    code = "PERMISSION_DENIED"
    status_code = status.HTTP_403_FORBIDDEN


NotFoundError = ResourceNotFoundError
PermissionDeniedError = AuthorizationError


class AccountDisabledError(AuthorizationError):
    code = "ACCOUNT_DISABLED"
    status_code = status.HTTP_403_FORBIDDEN

    def __init__(
        self, message: str = "This user account has been disabled. Please contact support."
    ):
        super().__init__(message=message, code=self.code, status_code=self.status_code)


class EmailNotVerifiedError(AuthorizationError):
    code = "EMAIL_NOT_VERIFIED"
    status_code = status.HTTP_403_FORBIDDEN

    def __init__(
        self, message: str = "Email verification is required before accessing this resource."
    ):
        super().__init__(message=message, code=self.code, status_code=self.status_code)


class InvalidAuthTokenError(ApplicationError):
    code = "INVALID_AUTH_TOKEN"
    status_code = status.HTTP_400_BAD_REQUEST


class ExpiredAuthTokenError(ApplicationError):
    code = "EXPIRED_AUTH_TOKEN"
    status_code = status.HTTP_400_BAD_REQUEST


class ConsumedAuthTokenError(ApplicationError):
    code = "CONSUMED_AUTH_TOKEN"
    status_code = status.HTTP_400_BAD_REQUEST


class InvalidCurrentPasswordError(ApplicationError):
    code = "INVALID_CURRENT_PASSWORD"
    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, message: str = "Current password provided does not match our records."):
        super().__init__(message=message, code=self.code, status_code=self.status_code)


class SessionNotFoundError(ResourceNotFoundError):
    code = "SESSION_NOT_FOUND"

    def __init__(self, message: str = "Specified user session was not found or is inaccessible."):
        super().__init__(message=message, code=self.code, status_code=self.status_code)


class PasswordPolicyError(ValidationError):
    code = "PASSWORD_POLICY_VIOLATION"


# ── Report & OCR Domain Exceptions ────────────────────────────────────────────


class ReportProcessingError(ApplicationError):
    code = "REPORT_PROCESSING_ERROR"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR


class OCRProcessingError(ReportProcessingError):
    code = "OCR_PROCESSING_ERROR"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR


class ReportNotReadyError(ApplicationError):
    code = "REPORT_NOT_READY"
    status_code = status.HTTP_409_CONFLICT


class RateLimitError(ApplicationError):
    code = "RATE_LIMIT_EXCEEDED"
    status_code = status.HTTP_429_TOO_MANY_REQUESTS


# ── Centralized Exception Handlers ────────────────────────────────────────────


def register_exception_handlers(app: FastAPI) -> None:
    """Registers standard exception handlers on the FastAPI application."""
    from app.core.middleware import get_request_id

    @app.exception_handler(ApplicationError)
    async def application_error_handler(request: Request, exc: ApplicationError):
        logger.warning(
            f"Domain application error [{exc.code}] at {request.method} {request.url.path}: {exc.message}"
        )
        error_dict: Dict[str, Any] = {
            "code": exc.code,
            "message": exc.message,
        }
        if exc.details:
            error_dict["details"] = exc.details

        response_payload: Dict[str, Any] = {
            "error": error_dict,
            "meta": {"request_id": get_request_id() or None},
        }
        return JSONResponse(status_code=exc.status_code, content=response_payload)

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        status_to_code = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            405: "METHOD_NOT_ALLOWED",
            409: "CONFLICT",
            422: "UNPROCESSABLE_ENTITY",
            500: "INTERNAL_SERVER_ERROR",
            502: "BAD_GATEWAY",
            503: "SERVICE_UNAVAILABLE",
        }
        error_code = status_to_code.get(exc.status_code, "HTTP_ERROR")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": error_code,
                    "message": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
                },
                "meta": {"request_id": get_request_id() or None},
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.debug(
            f"Request validation failure at {request.method} {request.url.path}: {exc.errors()}"
        )
        formatted_errors = []
        for err in exc.errors():
            loc = " -> ".join(str(part) for part in err.get("loc", []))
            msg = err.get("msg", "Invalid value")
            formatted_errors.append({"location": loc, "message": msg})

        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "REQUEST_VALIDATION_ERROR",
                    "message": "Input validation failed for request payload.",
                    "details": formatted_errors,
                },
                "meta": {"request_id": get_request_id() or None},
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled exception at {request.method} {request.url.path}: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected internal server error occurred. Please contact system support.",
                },
                "meta": {"request_id": get_request_id() or None},
            },
        )
