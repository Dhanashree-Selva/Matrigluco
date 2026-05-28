from fastapi import APIRouter
from pydantic import BaseModel
import pickle
import os
import numpy as np

router = APIRouter()

# Load model and scaler
model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml', 'diabetes_model.pkl')
scaler_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml', 'scaler.pkl')

try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
except FileNotFoundError:
    model = None
    scaler = None

class PredictionRequest(BaseModel):
    pregnancies: int
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: int
    
class PredictionResponse(BaseModel):
    prediction_result: str
    risk_level: str
    probability_score: float

@router.post("/", response_model=PredictionResponse)
def predict_diabetes_risk(data: PredictionRequest):
    if not model or not scaler:
        # Fallback if model not loaded
        return PredictionResponse(
            prediction_result="Error",
            risk_level="Unknown",
            probability_score=0.0
        )
        
    # Prepare input data for prediction (must match the scaler/model training layout:
    # Pregnancies	Glucose	BloodPressure	SkinThickness	Insulin	BMI	DiabetesPedigreeFunction	Age)
    input_features = np.array([[
        data.pregnancies,
        data.glucose,
        data.blood_pressure,
        data.skin_thickness,
        data.insulin,
        data.bmi,
        data.diabetes_pedigree,
        data.age
    ]])
    
    input_scaled = scaler.transform(input_features)
    prediction = model.predict(input_scaled)[0]
    probability = model.predict_proba(input_scaled)[0][1]
    
    risk_level = "Low Risk"
    if probability > 0.33 and probability <= 0.66:
        risk_level = "Moderate Risk"
    elif probability > 0.66:
        risk_level = "High Risk"
        
    return PredictionResponse(
        prediction_result="Diabetic" if prediction == 1 else "Non-Diabetic",
        risk_level=risk_level,
        probability_score=round(probability * 100, 2)
    )
