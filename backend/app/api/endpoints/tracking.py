from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schemas import PredictionSaveRequest
from app.services.prediction_service import PredictionService
from app.api.dependencies import get_prediction_service
from app.core.security import get_current_user_id

router = APIRouter()


@router.post("/")
async def save_prediction(
    data: PredictionSaveRequest,
    current_user_id: Optional[str] = Depends(get_current_user_id),
    service: PredictionService = Depends(get_prediction_service),
):
    """
    Legacy tracking save endpoint delegating to PredictionService.
    """
    if current_user_id and not data.user_id:
        data.user_id = current_user_id

    saved = service.save_prediction(data)

    return {
        "message": "Prediction saved successfully",
        "data": {
            "id": saved.id,
            "user_id": saved.user_id,
            "glucose": saved.glucose,
            "bmi": saved.bmi,
            "prediction_result": saved.prediction_result,
            "risk_level": saved.risk_level,
            "probability_score": saved.probability_score,
            "created_at": saved.created_at.isoformat() if saved.created_at else None,
        },
    }


@router.get("/")
def get_predictions(
    user_id: Optional[str] = None,
    current_user_id: Optional[str] = Depends(get_current_user_id),
    service: PredictionService = Depends(get_prediction_service),
):
    """
    Legacy tracking history endpoint delegating to PredictionService.
    """
    target_user_id = user_id or current_user_id
    if not target_user_id:
        return []

    records = service.get_user_history(user_id=target_user_id)
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "glucose": r.glucose,
            "bmi": r.bmi,
            "pregnancies": r.pregnancies,
            "blood_pressure": r.blood_pressure,
            "skin_thickness": r.skin_thickness,
            "insulin": r.insulin,
            "diabetes_pedigree": r.diabetes_pedigree,
            "age": r.age,
            "prediction_result": r.prediction_result,
            "risk_level": r.risk_level,
            "probability_score": r.probability_score,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]
