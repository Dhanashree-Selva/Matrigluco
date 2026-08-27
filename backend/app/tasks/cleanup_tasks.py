import logging
from typing import Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session
from app.workers.celery_app import celery_app
from app.workers.task_base import DatabaseTask
from app.models.auth import AuthToken, UserSession
from app.models.background_job import BackgroundJob

logger = logging.getLogger("matrigluco.tasks.cleanup")


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.tasks.cleanup_tasks.cleanup_expired_tokens_task",
)
def cleanup_expired_tokens_task(self, db: Optional[Session] = None) -> int:
    """
    Periodic task purging expired authentication tokens and revoked user sessions.
    """
    session = db or self.db
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    logger.info(f"Running periodic expired auth token cleanup at {now.isoformat()}...")

    try:
        # Delete expired auth tokens
        token_stmt = delete(AuthToken).where(AuthToken.expires_at < now)
        res_tokens = session.execute(token_stmt)

        # Delete expired user sessions
        session_stmt = delete(UserSession).where(UserSession.expires_at < now)
        res_sessions = session.execute(session_stmt)

        session.commit()
        deleted_count = (res_tokens.rowcount or 0) + (res_sessions.rowcount or 0)
        logger.info(f"Cleaned up {deleted_count} expired token/session records.")
        return deleted_count
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to cleanup expired tokens: {e}")
        return 0


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.tasks.cleanup_tasks.reconcile_stale_jobs_task",
)
def reconcile_stale_jobs_task(self, db: Optional[Session] = None) -> int:
    """
    Periodic task reconciling background jobs stuck in 'running' or 'queued' state for > 2 hours.
    """
    session = db or self.db
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    cutoff = now - timedelta(hours=2)
    logger.info(f"Running stale background job reconciliation (cutoff: {cutoff.isoformat()})...")

    try:
        stmt = (
            update(BackgroundJob)
            .where(
                BackgroundJob.status.in_(["queued", "running"]),
                BackgroundJob.created_at < cutoff,
            )
            .values(
                status="failed",
                error_code="JOB_TIMEOUT_RECONCILED",
                error_message="Job exceeded maximum execution duration and was marked failed by scheduler.",
                failed_at=now,
            )
        )
        res = session.execute(stmt)
        session.commit()
        reconciled_count = res.rowcount or 0
        if reconciled_count > 0:
            logger.warning(f"Reconciled {reconciled_count} stale background jobs.")
        return reconciled_count
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to reconcile stale jobs: {e}")
        return 0
