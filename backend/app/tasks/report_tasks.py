import logging
from typing import Optional
from app.workers.celery_app import celery_app
from app.workers.task_base import DatabaseTask
from app.repositories.job_repository import JobRepository
from app.cache.locks import distributed_lock
from app.services.report_service import ReportService

logger = logging.getLogger("matrigluco.tasks.reports")


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.tasks.report_tasks.process_medical_report_task",
    max_retries=3,
    default_retry_delay=10,
    acks_late=True,
)
def process_medical_report_task(self, report_id: str, job_id: Optional[str] = None) -> None:
    """
    Asynchronous background task processing uploaded medical report OCR & value extraction.
    Payload: Only durable IDs (report_id, job_id), never raw file bytes or secrets.
    """
    logger.info(f"Starting medical report processing for report '{report_id}' (Job: {job_id}).")
    job_repo = JobRepository(self.db)

    # 1. Update background job status to running
    if job_id:
        job_repo.mark_started(job_id, initial_message="Acquiring report for OCR extraction")
        self.db.commit()

    # 2. Concurrency protection via distributed lock
    with distributed_lock("report_processing", report_id, timeout_seconds=180) as acquired:
        if not acquired:
            logger.warning(
                f"Report '{report_id}' is already being processed concurrently. Skipping duplicate task."
            )
            return

        try:
            # 3. Thin adapter executing domain service
            service = ReportService(self.db)
            service.process_report(report_id=report_id, job_id=job_id)

            if job_id:
                job_repo.mark_succeeded(
                    job_id, completion_message="Report extracted and parsed successfully"
                )
                self.db.commit()

            logger.info(f"Successfully finished report processing for '{report_id}'.")

        except Exception as exc:
            self.db.rollback()
            logger.error(f"Error processing report '{report_id}': {exc}")

            if self.is_transient_error(exc) and self.request.retries < self.max_retries:
                if job_id:
                    job_repo.update_progress(
                        job_id,
                        progress_percent=20,
                        message=f"Temporary issue encountered. Retrying (Attempt {self.request.retries + 1}/{self.max_retries})...",
                    )
                    self.db.commit()
                countdown = 2**self.request.retries * 5
                raise self.retry(exc=exc, countdown=countdown)

            # Permanent failure or retries exhausted
            if job_id:
                job_repo.mark_failed(
                    job_id,
                    error_code="REPORT_PROCESSING_FAILED",
                    error_message=f"Failed to extract report data: {str(exc)[:200]}",
                )
                self.db.commit()
            raise exc
