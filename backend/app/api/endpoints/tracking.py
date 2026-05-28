from fastapi import APIRouter
from pydantic import BaseModel
from app.supabase_client import supabase

router = APIRouter()


from typing import Optional
from pydantic import BaseModel


class PredictionRequest(BaseModel):
    user_id: Optional[str] = None
    glucose: float
    bmi: float
    prediction_result: str
    risk_level: str
    probability_score: float


@router.post("/")
async def save_prediction(
    data: PredictionRequest
):
    response = supabase.table(
        "predictions"
    ).insert({
        "user_id":
        data.user_id,

        "glucose":
        data.glucose,

        "bmi":
        data.bmi,

        "prediction_result":
        data.prediction_result,

        "risk_level":
        data.risk_level,

        "prediction_score":
data.probability_score
    }).execute()

    return {
        "message":
        "Prediction saved successfully",
        "data":
        response.data
    }