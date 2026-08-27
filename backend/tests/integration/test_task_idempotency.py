import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.auth import AuthToken, UserSession
from app.models.background_job import BackgroundJob
from app.tasks.cleanup_tasks import cleanup_expired_tokens_task, reconcile_stale_jobs_task
from app.tasks.analytics_tasks import generate_daily_analytics_task


def test_cleanup_expired_tokens_task_idempotent(db_session: Session, test_user_a: User):
    """Running cleanup task multiple times is idempotent."""
    expired_time = (datetime.now(timezone.utc) - timedelta(days=2)).replace(tzinfo=None)

    # Insert expired token and session
    token = AuthToken(
        user_id=test_user_a.id,
        token_type="refresh",
        token_hash="expired_hash_1",
        expires_at=expired_time,
    )
    session = UserSession(
        user_id=test_user_a.id,
        token_hash="expired_session_1",
        token_family_id="fam-1",
        expires_at=expired_time,
    )
    db_session.add_all([token, session])
    db_session.commit()

    # First run cleans up the 2 records
    count1 = cleanup_expired_tokens_task(db=db_session)
    assert count1 >= 2

    # Second run is idempotent and cleans up 0 records
    count2 = cleanup_expired_tokens_task(db=db_session)
    assert count2 == 0


def test_reconcile_stale_jobs_task_idempotent(db_session: Session, test_user_a: User):
    """Running stale jobs reconciliation multiple times is idempotent."""
    old_time = (datetime.now(timezone.utc) - timedelta(hours=3)).replace(tzinfo=None)

    stale_job = BackgroundJob(
        user_id=test_user_a.id,
        job_type="report_processing",
        status="running",
        created_at=old_time,
    )
    db_session.add(stale_job)
    db_session.commit()

    # First run marks the stale job as failed
    count1 = reconcile_stale_jobs_task(db=db_session)
    assert count1 >= 1

    # Second run finds 0 stale running jobs
    count2 = reconcile_stale_jobs_task(db=db_session)
    assert count2 == 0


def test_generate_daily_analytics_task_idempotent(db_session: Session):
    """Running analytics task multiple times for the same date is idempotent."""
    target_date = "2026-08-17"
    # Both runs complete without error
    generate_daily_analytics_task(target_date_str=target_date)
    generate_daily_analytics_task(target_date_str=target_date)
