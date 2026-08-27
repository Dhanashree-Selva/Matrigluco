from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query

from app.schemas.history import HistoryListResponse
from app.services.history_service import HistoryService
from app.api.dependencies import get_history_service, get_current_user
from app.models.user import User

router = APIRouter(prefix="/history", tags=["History"])


@router.get(
    "",
    response_model=HistoryListResponse,
    summary="Get unified longitudinal health history",
)
def get_user_history(
    types: Optional[str] = Query(
        None,
        description="Comma-separated event types: assessment,measurement,report,consultation",
    ),
    date_from: Optional[datetime] = Query(None, description="Start date bounds in ISO format"),
    date_to: Optional[datetime] = Query(None, description="End date bounds in ISO format"),
    month: Optional[str] = Query(None, description="Month scope filter e.g. 2026-08"),
    page: int = Query(1, ge=1, description="1-indexed page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    service: HistoryService = Depends(get_history_service),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves the authenticated user's chronological care chronicle,
    including risk assessments, health telemetry readings, medical reports,
    and doctor consultations.
    """
    type_list = [t.strip() for t in types.split(",")] if types else None
    return service.get_history(
        user_id=str(current_user.id),
        types=type_list,
        date_from=date_from,
        date_to=date_to,
        month=month,
        page=page,
        page_size=page_size,
    )
