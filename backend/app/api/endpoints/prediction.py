from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.ml.inference.predictor import MLInferenceService
from app.ml.inference.feature_contract import DiabetesRiskFeatures

router = APIRouter()

# Single shared ML inference service instance
_ml_service = MLInferenceService()


class PredictionRequest(BaseModel):
    pregnancies: int = 0
    glucose: float
    blood_pressure: float = 0.0
    skin_thickness: float = 0.0
    insulin: float = 0.0
    bmi: float
    diabetes_pedigree: float = 0.0
    age: int = 0


class PredictionResponse(BaseModel):
    prediction_result: str
    risk_level: str
    probability_score: float


@router.post("/", response_model=PredictionResponse)
def predict_diabetes_risk(data: PredictionRequest):
    """
    Legacy prediction endpoint routing through canonical MLInferenceService.
    """
    features = DiabetesRiskFeatures(
        pregnancies=float(data.pregnancies),
        glucose=float(data.glucose),
        blood_pressure=float(data.blood_pressure),
        skin_thickness=float(data.skin_thickness),
        insulin=float(data.insulin),
        bmi=float(data.bmi),
        diabetes_pedigree_function=float(data.diabetes_pedigree),
        age=float(data.age),
    )

    result = _ml_service.predict_diabetes_risk(features)

    return PredictionResponse(
        prediction_result=result["prediction_result"],
        risk_level=result["risk_level"],
        probability_score=result["probability_score"],
    )
