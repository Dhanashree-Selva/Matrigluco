from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class BackgroundJobRead(BaseModel):
    """Sanitized, user-facing representation of an asynchronous background job."""

    id: str = Field(..., validation_alias="public_id")
    job_type: str
    status: str
    progress_percent: int
    progress_message: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    queued_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class BackgroundJobPaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    pages: int


class BackgroundJobListResponse(BaseModel):
    """Paginated collection of user-owned background jobs."""

    items: List[BackgroundJobRead]
    pagination: BackgroundJobPaginationMeta
