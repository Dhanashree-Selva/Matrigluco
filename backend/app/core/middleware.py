import re
import time
import uuid
import logging
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from app.core.config import get_settings

logger = logging.getLogger("matrigluco.core.middleware")
settings = get_settings()

# Global context variable for distributed request correlation
request_id_ctx: ContextVar[str] = ContextVar("request_id_ctx", default="")

SAFE_REQUEST_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-]{1,64}$")


def get_request_id() -> str:
    """Returns the current request ID from context."""
    return request_id_ctx.get()


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware that validates/attaches a unique X-Request-ID to every incoming HTTP request
    and tracks processing execution time in X-Process-Time header.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming_id = request.headers.get("X-Request-ID")
        if incoming_id and SAFE_REQUEST_ID_REGEX.match(incoming_id):
            req_id = incoming_id
        else:
            req_id = str(uuid.uuid4())

        token = request_id_ctx.set(req_id)
        start_time = time.perf_counter()

        try:
            response = await call_next(request)
            process_time = time.perf_counter() - start_time
            response.headers["X-Request-ID"] = req_id
            response.headers["X-Process-Time"] = f"{process_time:.4f}s"
            return response
        finally:
            request_id_ctx.reset(token)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware that enforces hardened security headers across all API responses.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        # Baseline protective headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Frame-Options"] = "DENY"

        # HSTS in production environments only
        if settings.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that emits safe structured HTTP access logs with request correlation.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.perf_counter()
        req_id = get_request_id()

        response = await call_next(request)
        latency_ms = (time.perf_counter() - start_time) * 1000

        # Omit noisy health probe logs in development
        if request.url.path not in ["/api/v1/health/live", "/health"]:
            logger.info(
                f"HTTP {request.method} {request.url.path} "
                f"[{response.status_code}] {latency_ms:.2f}ms (req_id={req_id})"
            )

        return response
