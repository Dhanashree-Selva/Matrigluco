import pytest
import uuid
from datetime import datetime, timezone, timedelta
from app.repositories.health_repository import HealthRepository
from app.models.user import User


def test_health_repository_trends_and_counts(db_session, test_user_a: User):
    """HealthRepository queries trends, latest metrics, and bounded counts."""
    repo = HealthRepository(db=db_session)
    now = datetime.now(timezone.utc)

    # Insert 3 measurements over the last 5 days
    for day_offset, val in [(4, 95.0), (2, 105.0), (0, 115.0)]:
        m_time = now - timedelta(days=day_offset)
        repo.create_measurement(
            user_id=test_user_a.id,
            metric_type="glucose",
            value_primary=val,
            unit="mg/dL",
            measured_at=m_time,
        )
    db_session.commit()

    # 1. Latest metric
    latest = repo.get_latest_by_metric(user_id=test_user_a.id, metric_type="glucose")
    assert latest is not None
    assert latest.value_primary == 115.0

    # 2. 7-day count
    count_7 = repo.count_measurements(
        user_id=test_user_a.id, start_at=now - timedelta(days=7), end_at=now + timedelta(hours=1)
    )
    assert count_7 == 3

    # 3. 7-day trend list
    trend = repo.get_trend(
        user_id=test_user_a.id,
        metric_type="glucose",
        start_at=now - timedelta(days=7),
        end_at=now + timedelta(hours=1),
    )
    assert len(trend) == 3
    assert trend[0].value_primary == 95.0
    assert trend[2].value_primary == 115.0
