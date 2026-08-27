from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request, status, Response
from app.schemas.prediction import (
    PredictionCreateRequest,
    PredictionDetailResponse,
    PredictionListResponse,
    PredictionModelInfoResponse,
    PredictionRequest,
    PredictionResponse,
    PredictionSaveRequest,
    PredictionRead,
)
from app.services.prediction_service import PredictionService
from app.api.dependencies import (
    get_prediction_service,
    get_current_user,
    get_optional_current_user,
)
from app.models.user import User

router = APIRouter(prefix="/predictions", tags=["Predictions & Risk Assessment"])


# ─── Production Clinical Prediction CRUD ──────────────────────────────────────


@router.post(
    "",
    response_model=PredictionDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create educational diabetes risk estimation",
)
def create_prediction(
    payload: PredictionCreateRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    service: PredictionService = Depends(get_prediction_service),
):
    """
    Executes calibrated ML model evaluation and transactionally persists the assessment
    with an immutable normalized input snapshot and exactly eight canonical feature provenance rows.
    Operates as an educational/research risk estimation prototype.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return service.create_assessment(
        payload=payload,
        actor=current_user,
        source="manual",
        ip_address=client_ip,
        user_agent=user_agent,
    )


@router.get(
    "",
    response_model=PredictionListResponse,
    summary="List patient risk evaluations (paginated)",
)
def list_predictions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    risk_band: Optional[str] = Query(None, description="Filter by risk band (low, moderate, high)"),
    source: Optional[str] = Query(None, description="Filter by assessment source"),
    current_user: User = Depends(get_current_user),
    service: PredictionService = Depends(get_prediction_service),
):
    """Retrieves paginated history of clinical risk evaluations strictly owned by the authenticated user."""
    return service.list_user_assessments(
        actor=current_user,
        page=page,
        page_size=page_size,
        risk_band=risk_band,
        source=source,
    )


# ─── Static Governance & Compatibility Routes (Declared Before Path Params) ───


@router.get(
    "/model-info",
    response_model=PredictionModelInfoResponse,
    summary="Get active ML model card and governance metadata",
)
def get_model_info(
    service: PredictionService = Depends(get_prediction_service),
):
    """Retrieves educational Model Card, verified evaluation metrics, and imputation governance policy."""
    return service.get_model_info(model_key="diabetes-risk", version="1.0.0")


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Legacy ephemeral risk evaluation",
    include_in_schema=True,
)
def predict_risk_legacy(
    payload: PredictionRequest,
    service: PredictionService = Depends(get_prediction_service),
):
    """Executes pure calibrated ML risk evaluation without state persistence."""
    return service.run_prediction(payload)


@router.post(
    "/save",
    response_model=PredictionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Legacy save prediction endpoint",
    include_in_schema=True,
)
def save_prediction_legacy(
    payload: PredictionSaveRequest,
    service: PredictionService = Depends(get_prediction_service),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Legacy save prediction adapter."""
    return service.save_prediction(payload, actor=current_user)


@router.get(
    "/history",
    response_model=List[PredictionRead],
    summary="Legacy prediction history endpoint",
    include_in_schema=True,
)
def get_prediction_history_legacy(
    user_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    service: PredictionService = Depends(get_prediction_service),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Legacy prediction history adapter."""
    target_user_id = user_id or (current_user.id if current_user else None)
    if not target_user_id:
        return []
    return service.get_user_history(user_id=target_user_id, actor=current_user, limit=limit)


# ─── Dynamic Path Parameter Endpoints ─────────────────────────────────────────


@router.get(
    "/{prediction_id}",
    response_model=PredictionDetailResponse,
    summary="Get risk assessment details and feature snapshot",
)
def get_prediction_detail(
    prediction_id: str,
    current_user: User = Depends(get_current_user),
    service: PredictionService = Depends(get_prediction_service),
):
    """Retrieves detailed risk assessment record with 8 canonical features, strictly scoped to owner."""
    return service.get_assessment_detail(assessment_id=prediction_id, actor=current_user)


@router.delete(
    "/{prediction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Soft-delete / archive risk assessment",
)
def delete_prediction(
    prediction_id: str,
    current_user: User = Depends(get_current_user),
    service: PredictionService = Depends(get_prediction_service),
):
    """Archives risk assessment record while maintaining historical clinical audit trail."""
    service.delete_assessment(assessment_id=prediction_id, actor=current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
