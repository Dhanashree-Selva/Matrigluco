from fastapi import APIRouter, Depends
from app.models.user import User
from app.api.dependencies import get_current_user, get_dashboard_service
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
) -> DashboardSummaryResponse:
    """Provides consolidated patient maternal dashboard summary via DashboardService."""
    return service.get_dashboard_summary(user_id=user.id)
