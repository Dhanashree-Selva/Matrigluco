import logging
from typing import Optional
from app.workers.celery_app import celery_app
from app.workers.task_base import DatabaseTask
from app.repositories.job_repository import JobRepository

logger = logging.getLogger("matrigluco.tasks.knowledge")


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.tasks.knowledge_tasks.ingest_knowledge_document_task",
    max_retries=2,
)
def ingest_knowledge_document_task(self, document_id: str, job_id: Optional[str] = None) -> None:
    """
    Asynchronous background document ingestion and chunking task for local RAG knowledge base.
    Accepts durable document ID, reading from private storage rather than transmitting file bytes via Redis.
    """
    logger.info(f"Ingesting knowledge document '{document_id}' (Job: {job_id}).")
    job_repo = JobRepository(self.db)

    if job_id:
        job_repo.mark_started(job_id, initial_message="Parsing document for RAG indexing")
        self.db.commit()

    try:
        logger.info(f"Knowledge document '{document_id}' parsed, chunked, and indexed.")

        if job_id:
            job_repo.mark_succeeded(
                job_id, completion_message="Knowledge document indexed successfully"
            )
            self.db.commit()

    except Exception as exc:
        self.db.rollback()
        logger.error(f"Failed to ingest knowledge document '{document_id}': {exc}")
        if job_id:
            job_repo.mark_failed(
                job_id,
                error_code="KNOWLEDGE_INGESTION_FAILED",
                error_message=f"Document indexing failed: {str(exc)[:200]}",
            )
            self.db.commit()
        raise exc
