import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.middleware import (
    RequestIDMiddleware,
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware,
)
from app.core.exception_handlers import setup_exception_handlers
from app.lifespan import application_lifespan
from app.api.v1.router import api_router as api_v1_router
from app.api.v1.endpoints.health import router as health_router
from app.api import router as legacy_api_router

settings = get_settings()
logger = logging.getLogger("matrigluco.main")


def create_app() -> FastAPI:
    """
    Application Factory for MatriGluco Modular Monolith Backend.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        description="Production API for MatriGluco — Clinical Maternal Health, Diabetes Risk Prediction & Offline AI Assistant.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=application_lifespan,
    )

    # 1. Request ID and Correlation Middleware (Outermost)
    app.add_middleware(RequestIDMiddleware)

    # 2. Security Headers Middleware
    app.add_middleware(SecurityHeadersMiddleware)

    # 3. Structured Request Logging Middleware
    app.add_middleware(RequestLoggingMiddleware)

    # 4. CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 5. Centralized Domain Exception Handlers
    setup_exception_handlers(app)

    # 6. Mount Legacy Static uploads folder for backward compatibility
    legacy_upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
    os.makedirs(legacy_upload_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=legacy_upload_dir), name="uploads")

    # ── Routing Structure ─────────────────────────────────────────────────────
    # Root Health probes
    app.include_router(health_router, prefix="/health", tags=["Health"])

    # Canonical versioned API router (/api/v1)
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    # Legacy /api compatibility layer (retains existing React frontend functionality)
    app.include_router(legacy_api_router.api_router, prefix="/api")

    @app.get("/", tags=["Root"])
    def root():
        """Root API landing endpoint."""
        return {
            "service": settings.APP_NAME,
            "version": "1.0.0",
            "environment": settings.APP_ENV,
            "status": "online",
            "docs": "/docs",
            "api_v1": settings.API_V1_PREFIX,
        }

    return app


# Expose standard ASGI application instance
app = create_app()
