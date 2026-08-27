from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.api.dependencies import get_current_user, get_db
from app.schemas.health_measurement import (
    HealthMeasurementCreate,
    HealthMeasurementUpdate,
    HealthMeasurementResponse,
    HealthMeasurementListResponse,
)
from app.services.health_service import HealthService

router = APIRouter(prefix="/health-measurements", tags=["Health Measurements"])


@router.post(
    "",
    response_model=HealthMeasurementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record health measurement",
)
def create_health_measurement(
    payload: HealthMeasurementCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Records a new metabolic/clinical measurement for the authenticated user."""
    service = HealthService(db=db)
    return service.create_measurement(user_id=user.id, payload=payload, source="manual")


@router.get(
    "",
    response_model=HealthMeasurementListResponse,
    summary="List patient health measurements",
)
def list_health_measurements(
    metric_type: Optional[str] = Query(None, description="Filter by metric type"),
    date_from: Optional[datetime] = Query(
        None, description="Filter by measurement timestamp start"
    ),
    date_to: Optional[datetime] = Query(None, description="Filter by measurement timestamp end"),
    pregnancy_profile_id: Optional[str] = Query(None, description="Filter by pregnancy profile"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves paginated health measurement history for current patient."""
    service = HealthService(db=db)
    return service.list_measurements(
        user_id=user.id,
        metric_type=metric_type,
        date_from=date_from,
        date_to=date_to,
        pregnancy_profile_id=pregnancy_profile_id,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{measurement_id}",
    response_model=HealthMeasurementResponse,
    summary="Get health measurement detail",
)
def get_health_measurement_detail(
    measurement_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves an owned health measurement by ID."""
    service = HealthService(db=db)
    return service.get_measurement(user_id=user.id, measurement_id=measurement_id)


@router.patch(
    "/{measurement_id}",
    response_model=HealthMeasurementResponse,
    summary="Update owned health measurement",
)
def update_health_measurement(
    measurement_id: str,
    payload: HealthMeasurementUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates mutable fields on an owned health measurement."""
    service = HealthService(db=db)
    return service.update_measurement(
        user_id=user.id, measurement_id=measurement_id, payload=payload
    )


@router.delete(
    "/{measurement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete owned health measurement",
)
def delete_health_measurement(
    measurement_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Archives an owned health measurement record."""
    service = HealthService(db=db)
    service.delete_measurement(user_id=user.id, measurement_id=measurement_id)
