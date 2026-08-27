from typing import Dict, Any, Optional
from fastapi import APIRouter, status, Response
from pydantic import BaseModel
from app.core.config import get_settings
from app.observability.health import get_system_readiness_status

router = APIRouter(tags=["Health"])
settings = get_settings()


class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str
    version: str = "1.0.0"


class ReadinessResponse(BaseModel):
    status: str
    dependencies: Dict[str, Any]
    database: Dict[str, Any]
    redis: Dict[str, Any]


@router.get("", response_model=HealthResponse, summary="Service Liveness Probe")
@router.get("/", response_model=HealthResponse, include_in_schema=False)
@router.get("/live", response_model=HealthResponse, summary="Service Liveness Probe")
def liveness_check():
    """
    Liveness probe: verifies that the FastAPI application process is alive and accepting requests.
    Fast lightweight ping without expensive dependency queries.
    """
    return HealthResponse(
        status="ok",
        service=settings.APP_NAME,
        environment=settings.APP_ENV,
        version="1.0.0",
    )


@router.get("/ready", response_model=ReadinessResponse, summary="Service Readiness Probe")
def readiness_check(response: Response):
    """
    Readiness probe: checks whether critical infrastructure dependencies
    (MySQL database, private storage, Redis, ML runtime, AI runtime) are operational.
    """
    readiness = get_system_readiness_status()

    # If critical dependencies are down, return 503
    if readiness["status"] != "ready":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    deps = readiness["dependencies"]

    return ReadinessResponse(
        status=readiness["status"],
        dependencies=deps,
        database=deps.get("database", {}),
        redis=deps.get("redis", {}),
    )
