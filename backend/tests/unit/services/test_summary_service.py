import pytest
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.health import HealthMeasurement
from app.services.summary_service import DailySummaryService


def test_daily_summary_calculation_and_idempotency(db_session: Session, test_user_a: User):
    """DailySummaryService aggregates daily health records and regenerates idempotently."""
    service = DailySummaryService(db_session)
    summary_date = "2026-08-17"

    # 1. Add health measurements for user on that date
    m1 = HealthMeasurement(
        user_id=test_user_a.id,
        metric_type="glucose",
        value_primary=110.0,
        unit="mg/dL",
        measured_at=datetime(2026, 8, 17, 8, 30, 0),
    )
    m2 = HealthMeasurement(
        user_id=test_user_a.id,
        metric_type="glucose",
        value_primary=130.0,
        unit="mg/dL",
        measured_at=datetime(2026, 8, 17, 14, 0, 0),
    )
    m3 = HealthMeasurement(
        user_id=test_user_a.id,
        metric_type="blood_pressure",
        value_primary=120.0,
        value_secondary=80.0,
        unit="mmHg",
        measured_at=datetime(2026, 8, 17, 9, 0, 0),
    )
    db_session.add_all([m1, m2, m3])
    db_session.commit()

    # 2. Generate summary
    summary = service.generate_daily_summary(
        user_id=test_user_a.id,
        summary_date=summary_date,
        timezone_name="Asia/Kolkata",
        send_notification=True,
    )
    db_session.commit()

    assert summary.measurement_count == 3
    assert summary.summary_payload["counts"]["glucose"] == 2
    assert summary.summary_payload["counts"]["blood_pressure"] == 1
    assert summary.summary_payload["averages"]["glucose"] == 120.0
    assert summary.summary_payload["averages"]["blood_pressure"]["systolic"] == 120.0
    assert summary.summary_payload["averages"]["blood_pressure"]["diastolic"] == 80.0

    # 3. Regenerate (idempotent update)
    summary2 = service.generate_daily_summary(
        user_id=test_user_a.id,
        summary_date=summary_date,
        timezone_name="Asia/Kolkata",
        send_notification=False,
    )
    assert summary2.id == summary.id
    assert summary2.measurement_count == 3
