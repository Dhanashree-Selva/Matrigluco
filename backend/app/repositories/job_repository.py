import logging
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.repositories.base import BaseRepository
from app.models.background_job import BackgroundJob

logger = logging.getLogger("matrigluco.repositories.job")


class JobRepository(BaseRepository[BackgroundJob]):
    """
    Data access repository for durable background job lifecycle and status tracking in MySQL.
    Strictly enforces user ownership scoping.
    """

    def __init__(self, db: Session):
        super().__init__(BackgroundJob, db)

    def create_job(
        self,
        user_id: str,
        job_type: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
    ) -> BackgroundJob:
        """Creates a pending background job record."""
        job = BackgroundJob(
            user_id=str(user_id),
            job_type=job_type,
            status="pending",
            progress_percent=0,
            progress_message="Job created, awaiting dispatch",
            resource_type=resource_type,
            resource_id=resource_id,
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(job)
        self.db.flush()
        return job

    def get_owned_job_by_id(self, job_id: str, user_id: str) -> Optional[BackgroundJob]:
        """Fetches background job strictly scoped to owning user by public UUID or primary key."""
        stmt = select(BackgroundJob).where(
            or_(
                BackgroundJob.public_id == str(job_id),
                BackgroundJob.id == str(job_id),
            ),
            BackgroundJob.user_id == str(user_id),
        )
        return self.db.scalars(stmt).first()

    def get_by_id_internal(self, job_id: str) -> Optional[BackgroundJob]:
        """Internal worker lookup by primary key or public UUID."""
        stmt = select(BackgroundJob).where(
            or_(
                BackgroundJob.public_id == str(job_id),
                BackgroundJob.id == str(job_id),
            )
        )
        return self.db.scalars(stmt).first()

    def list_owned_jobs(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        job_type: Optional[str] = None,
    ) -> Tuple[List[BackgroundJob], int]:
        """Lists paginated background jobs owned strictly by the authenticated user."""
        base_stmt = select(BackgroundJob).where(BackgroundJob.user_id == str(user_id))

        if status:
            base_stmt = base_stmt.where(BackgroundJob.status == str(status).lower())
        if job_type:
            base_stmt = base_stmt.where(BackgroundJob.job_type == str(job_type).lower())

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        items_stmt = base_stmt.order_by(BackgroundJob.created_at.desc()).offset(skip).limit(limit)
        items = list(self.db.scalars(items_stmt).all())

        return items, total

    def mark_queued(self, job_id: str, celery_task_id: Optional[str] = None) -> None:
        """Transitions job to 'queued' state."""
        job = self.get_by_id_internal(job_id)
        if job:
            job.status = "queued"
            job.queued_at = datetime.now(timezone.utc)
            if celery_task_id:
                job.celery_task_id = celery_task_id
            job.progress_message = "Task queued for processing"
            self.db.add(job)

    def mark_started(self, job_id: str, initial_message: str = "Processing started") -> None:
        """Transitions job to 'running' state."""
        job = self.get_by_id_internal(job_id)
        if job:
            job.status = "running"
            job.started_at = datetime.now(timezone.utc)
            job.progress_message = initial_message
            self.db.add(job)

    def update_progress(self, job_id: str, progress_percent: int, message: str) -> None:
        """Updates sanitized progress percentage and stage message."""
        job = self.get_by_id_internal(job_id)
        if job:
            job.progress_percent = min(max(progress_percent, 0), 100)
            job.progress_message = message
            self.db.add(job)

    def mark_succeeded(
        self, job_id: str, completion_message: str = "Completed successfully"
    ) -> None:
        """Transitions job to 'succeeded' state with 100% progress."""
        job = self.get_by_id_internal(job_id)
        if job:
            job.status = "succeeded"
            job.progress_percent = 100
            job.progress_message = completion_message
            job.completed_at = datetime.now(timezone.utc)
            self.db.add(job)

    def mark_failed(self, job_id: str, error_code: str, error_message: str) -> None:
        """Transitions job to 'failed' state with sanitized diagnostic message."""
        job = self.get_by_id_internal(job_id)
        if job:
            job.status = "failed"
            job.error_code = error_code
            job.error_message = error_message
            job.failed_at = datetime.now(timezone.utc)
            self.db.add(job)
