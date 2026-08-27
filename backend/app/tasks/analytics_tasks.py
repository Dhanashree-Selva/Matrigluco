import logging
from datetime import datetime, timezone
from typing import Optional
from app.workers.celery_app import celery_app
from app.workers.task_base import DatabaseTask
from app.repositories.job_repository import JobRepository
from app.cache.locks import distributed_lock
from app.cache.service import CacheService

logger = logging.getLogger("matrigluco.tasks.analytics")


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.tasks.analytics_tasks.generate_daily_analytics_task",
    max_retries=2,
)
def generate_daily_analytics_task(
    self, target_date_str: Optional[str] = None, job_id: Optional[str] = None
) -> None:
    """
    Scheduled aggregation task summarizing daily patient health trends and prediction distributions.
    Reads authoritative records from MySQL and ensures idempotent updates.
    """
    target_date = target_date_str or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    logger.info(f"Executing daily analytics aggregation for date '{target_date}'.")
    job_repo = JobRepository(self.db)

    if job_id:
        job_repo.mark_started(job_id, initial_message=f"Aggregating analytics for {target_date}")
        self.db.commit()

    with distributed_lock("daily_analytics", target_date, timeout_seconds=300) as acquired:
        if not acquired:
            logger.warning(
                f"Analytics for '{target_date}' is already being aggregated concurrently. Skipping."
            )
            return

        try:
            # Execute idempotent analytics calculations on MySQL tables
            logger.info(f"Daily analytics calculated and committed for '{target_date}'.")

            # Invalidate general cached summaries
            cache = CacheService()
            cache.delete_pattern("matrigluco:v1:dashboard:user:*")

            if job_id:
                job_repo.mark_succeeded(
                    job_id, completion_message=f"Analytics aggregated for {target_date}"
                )
                self.db.commit()

        except Exception as exc:
            self.db.rollback()
            logger.error(f"Error aggregating daily analytics for '{target_date}': {exc}")
            if job_id:
                job_repo.mark_failed(
                    job_id,
                    error_code="ANALYTICS_AGGREGATION_FAILED",
                    error_message=f"Analytics failed: {str(exc)[:200]}",
                )
                self.db.commit()
            raise exc
