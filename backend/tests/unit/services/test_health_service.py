import pytest
import uuid
from datetime import datetime, timezone, timedelta
from app.services.health_service import HealthService
from app.schemas.health_measurement import (
    HealthMeasurementCreate,
    HealthMeasurementUpdate,
)
from app.models.user import User
from app.core.exceptions import ValidationError, NotFoundError


def test_health_service_create_and_get(db_session, test_user_a: User):
    """HealthService creates measurement and retrieves it for the owning user."""
    service = HealthService(db=db_session)

    payload = HealthMeasurementCreate(
        metric_type="glucose",
        value_primary=105.0,
        unit="mg/dL",
        notes="Morning fasting",
    )

    created = service.create_measurement(user_id=test_user_a.id, payload=payload)
    assert created.id is not None
    assert created.value_primary == 105.0
    assert created.unit == "mg/dL"

    fetched = service.get_measurement(user_id=test_user_a.id, measurement_id=created.id)
    assert fetched.id == created.id
    assert fetched.value_primary == 105.0


def test_health_service_cross_user_access_denied(db_session, test_user_a: User, test_user_b: User):
    """Attempting to access User B's measurement as User A raises NotFoundError."""
    service = HealthService(db=db_session)

    payload = HealthMeasurementCreate(
        metric_type="weight",
        value_primary=68.0,
        unit="kg",
    )
    b_measurement = service.create_measurement(user_id=test_user_b.id, payload=payload)

    with pytest.raises(NotFoundError):
        service.get_measurement(user_id=test_user_a.id, measurement_id=b_measurement.id)


def test_health_service_date_range_validation(db_session, test_user_a: User):
    """Filtering with date_from > date_to raises ValidationError."""
    service = HealthService(db=db_session)
    now = datetime.now(timezone.utc)

    with pytest.raises(ValidationError):
        service.list_measurements(
            user_id=test_user_a.id,
            date_from=now,
            date_to=now - timedelta(days=5),
        )
