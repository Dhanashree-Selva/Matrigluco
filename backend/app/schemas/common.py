"""
Centralized Generic Response Envelopes and Pagination Metadata for MatriGluco API.
"""

from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ResponseMeta(BaseModel):
    """Correlation and trace metadata returned with all responses."""

    request_id: Optional[str] = None


class PaginationMeta(BaseModel):
    """Standardized collection pagination metadata."""

    page: int
    page_size: int
    total: int
    total_pages: int
    has_next: bool
    has_previous: bool


class ApiResponse(BaseModel, Generic[T]):
    """Standard single-object success envelope."""

    data: T
    meta: Optional[ResponseMeta] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated collection response."""

    items: List[T]
    pagination: PaginationMeta
    meta: Optional[ResponseMeta] = None

    model_config = ConfigDict(from_attributes=True)


class ApiErrorBody(BaseModel):
    """Standard controlled machine-readable error body."""

    code: str
    message: str
    details: Optional[Any] = None


class ApiErrorResponse(BaseModel):
    """Standard error response envelope."""

    error: ApiErrorBody
    meta: Optional[ResponseMeta] = None


class MessageResponse(BaseModel):
    """Simple confirmation message."""

    message: str
    code: Optional[str] = None
