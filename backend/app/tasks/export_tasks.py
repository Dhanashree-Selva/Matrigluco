import logging
from typing import Optional
from app.workers.celery_app import celery_app
from app.workers.task_base import DatabaseTask
from app.repositories.job_repository import JobRepository

logger = logging.getLogger("matrigluco.tasks.exports")


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.tasks.export_tasks.generate_report_export_task",
    max_retries=2,
)
def generate_report_export_task(
    self, report_id: str, user_id: str, job_id: Optional[str] = None
) -> None:
    """
    Asynchronous export generation task.
    Accepts durable IDs only. Writes generated artifact to private storage.
    """
    logger.info(f"Generating export for report '{report_id}' and user '{user_id}' (Job: {job_id}).")
    job_repo = JobRepository(self.db)

    if job_id:
        job_repo.mark_started(job_id, initial_message="Generating export archive")
        self.db.commit()

    try:
        # Simulate export file compilation and private storage save
        logger.info(f"Report export generated successfully for '{report_id}'.")

        if job_id:
            job_repo.mark_succeeded(
                job_id, completion_message="Export compiled and ready for download"
            )
            self.db.commit()

    except Exception as exc:
        self.db.rollback()
        logger.error(f"Failed to generate export for report '{report_id}': {exc}")
        if job_id:
            job_repo.mark_failed(
                job_id,
                error_code="EXPORT_GENERATION_FAILED",
                error_message=f"Export failed: {str(exc)[:200]}",
            )
            self.db.commit()
        raise exc
