import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.repositories.job_repository import JobRepository
from app.schemas.task import (
    BackgroundJobRead,
    BackgroundJobListResponse,
    BackgroundJobPaginationMeta,
)

router = APIRouter(prefix="/tasks", tags=["Background Tasks & Jobs"])


@router.get(
    "/{job_id}",
    response_model=BackgroundJobRead,
    summary="Get background job status and progress",
)
def get_task_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves sanitized execution progress and status of an asynchronous background job.
    Strictly scoped to the authenticated owner to prevent IDOR vulnerabilities.
    """
    repo = JobRepository(db)
    job = repo.get_owned_job_by_id(job_id=job_id, user_id=current_user.id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Background job '{job_id}' not found.",
        )
    return BackgroundJobRead.model_validate(job)


@router.get(
    "",
    response_model=BackgroundJobListResponse,
    summary="List patient background jobs (paginated)",
)
def list_user_tasks(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(
        None, description="Filter by status (pending, queued, running, succeeded, failed)"
    ),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves paginated history of background jobs owned strictly by current authenticated user."""
    repo = JobRepository(db)
    skip = (page - 1) * page_size
    items, total = repo.list_owned_jobs(
        user_id=current_user.id,
        skip=skip,
        limit=page_size,
        status=status,
        job_type=job_type,
    )
    pages = math.ceil(total / page_size) if total > 0 else 0

    return BackgroundJobListResponse(
        items=[BackgroundJobRead.model_validate(item) for item in items],
        pagination=BackgroundJobPaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            pages=pages,
        ),
    )
