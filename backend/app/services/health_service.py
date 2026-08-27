import logging
import uuid
from typing import Optional, List, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.health import HealthMeasurement
from app.models.user import User
from app.repositories.health_repository import HealthRepository
from app.schemas.health_measurement import (
    HealthMeasurementCreate,
    HealthMeasurementUpdate,
    HealthMeasurementResponse,
    HealthMeasurementListResponse,
)
from app.core.exceptions import (
    NotFoundError,
    ValidationError,
    PermissionDeniedError,
)
from app.cache.service import CacheService
from app.cache.keys import user_dashboard_key

logger = logging.getLogger("matrigluco.services.health")


class HealthService:
    """
    Application service managing patient health telemetry, metric semantic validation,
    pregnancy context authorization, atomic transactions, and dashboard cache invalidation.
    """

    def __init__(self, db: Session, cache: Optional[CacheService] = None):
        self.db = db
        self.health_repo = HealthRepository(db)
        self.cache = cache or CacheService()

    def create_measurement(
        self,
        user_id: str,
        payload: HealthMeasurementCreate,
        source: str = "manual",
    ) -> HealthMeasurementResponse:
        measured_time = payload.measured_at or datetime.now(timezone.utc)
        if measured_time.tzinfo is None:
            measured_time = measured_time.replace(tzinfo=timezone.utc)

        measurement = self.health_repo.create_measurement(
            user_id=user_id,
            metric_type=payload.metric_type,
            value_primary=payload.value_primary,  # type: ignore[arg-type]
            value_secondary=payload.value_secondary,
            unit=payload.unit,
            measured_at=measured_time,
            pregnancy_profile_id=payload.pregnancy_profile_id,
            source=source,
            notes=payload.notes,
        )
        self.db.commit()
        self.db.refresh(measurement)

        # Post-commit cache invalidation
        try:
            self.cache.delete(user_dashboard_key(user_id))
        except Exception as e:
            logger.debug(f"Cache invalidation failed: {e}")

        return HealthMeasurementResponse.model_validate(measurement)

    def get_measurement(self, user_id: str, measurement_id: str) -> HealthMeasurementResponse:
        measurement = self.health_repo.get_owned_by_id(
            user_id=user_id, measurement_id=measurement_id
        )
        if not measurement:
            raise NotFoundError(message=f"Health measurement '{measurement_id}' not found.")
        return HealthMeasurementResponse.model_validate(measurement)

    def list_measurements(
        self,
        user_id: str,
        metric_type: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        pregnancy_profile_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> HealthMeasurementListResponse:
        if date_from and date_to and date_from > date_to:
            raise ValidationError(message="date_from cannot be later than date_to.")

        items, total = self.health_repo.list_owned(
            user_id=user_id,
            metric_type=metric_type,
            date_from=date_from,
            date_to=date_to,
            pregnancy_profile_id=pregnancy_profile_id,
            page=page,
            page_size=page_size,
        )
        total_pages = max(1, (total + page_size - 1) // page_size)
        return HealthMeasurementListResponse(
            items=[HealthMeasurementResponse.model_validate(m) for m in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def update_measurement(
        self,
        user_id: str,
        measurement_id: str,
        payload: HealthMeasurementUpdate,
    ) -> HealthMeasurementResponse:
        measurement = self.health_repo.get_owned_by_id(
            user_id=user_id, measurement_id=measurement_id
        )
        if not measurement:
            raise NotFoundError(message=f"Health measurement '{measurement_id}' not found.")

        # Re-validate blood pressure consistency on update
        new_primary = (
            payload.value_primary
            if payload.value_primary is not None
            else (
                payload.value
                if payload.value is not None
                else (
                    payload.systolic if payload.systolic is not None else measurement.value_primary
                )
            )
        )
        new_secondary = (
            payload.value_secondary
            if payload.value_secondary is not None
            else (
                payload.diastolic if payload.diastolic is not None else measurement.value_secondary
            )
        )

        if measurement.metric_type == "blood_pressure":
            if new_secondary is None:
                raise ValidationError(
                    message="Blood pressure requires both systolic and diastolic values."
                )
            if new_primary <= 0 or new_secondary <= 0:
                raise ValidationError(message="Blood pressure values must be strictly positive.")
            if new_primary < new_secondary:
                raise ValidationError(
                    message="Systolic blood pressure cannot be lower than diastolic blood pressure."
                )

        updated = self.health_repo.update_measurement(
            measurement=measurement,
            value_primary=new_primary,
            value_secondary=new_secondary,
            unit=payload.unit,
            measured_at=payload.measured_at,
            pregnancy_profile_id=payload.pregnancy_profile_id,
            notes=payload.notes,
        )
        self.db.commit()
        self.db.refresh(updated)

        # Post-commit cache invalidation
        try:
            self.cache.delete(user_dashboard_key(user_id))
        except Exception as e:
            logger.debug(f"Cache invalidation failed: {e}")

        return HealthMeasurementResponse.model_validate(updated)

    def delete_measurement(self, user_id: str, measurement_id: str) -> None:
        measurement = self.health_repo.get_owned_by_id(
            user_id=user_id, measurement_id=measurement_id
        )
        if not measurement:
            raise NotFoundError(message=f"Health measurement '{measurement_id}' not found.")

        self.health_repo.archive_measurement(measurement)
        self.db.commit()

        # Post-commit cache invalidation
        try:
            self.cache.delete(user_dashboard_key(user_id))
        except Exception as e:
            logger.debug(f"Cache invalidation failed: {e}")
