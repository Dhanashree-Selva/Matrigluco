import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.risk_assessment import RiskAssessment
from app.schemas.prediction import PredictionCreateRequest
from app.services.prediction_service import PredictionService
from app.ml.inference.predictor import MLInferenceService
from app.ml.inference.feature_contract import DiabetesRiskFeatures


def test_historical_prediction_exact_reproducibility(db_session: Session, test_user_a: User):
    """
    Governance Invariant #55 & #56:
    A persisted assessment must be 100% reproducible:
    Loading the stored input_snapshot_json and passing it through the registered model artifact
    yields the exact original probability score within floating-point tolerance.
    """
    service = PredictionService(db_session)

    payload = PredictionCreateRequest(
        pregnancies=3,
        glucose=152.0,
        blood_pressure=84.0,
        skin_thickness=30.0,
        insulin=160.0,
        bmi=32.4,
        diabetes_pedigree_function=0.65,
        age=36.0,
    )

    created = service.create_assessment(payload=payload, actor=test_user_a)
    original_probability = created.probability

    # 1. Reload raw RiskAssessment record from MySQL database
    assessment = (
        db_session.query(RiskAssessment).filter(RiskAssessment.public_id == created.id).first()
    )
    assert assessment is not None
    assert assessment.input_snapshot_json is not None

    # 2. Extract immutable normalized snapshot
    snapshot: dict = assessment.input_snapshot_json
    assert len(snapshot) == 8

    # 3. Instantiate independent MLInferenceService and execute inference on the snapshot
    reproduction_engine = MLInferenceService()
    reproduced_prediction = reproduction_engine.evaluate(
        raw_features=snapshot,
        version=assessment.model_version.version,
    )

    # 4. Assert exact mathematical equivalence
    assert reproduced_prediction.probability == pytest.approx(original_probability, abs=1e-7)
    assert reproduced_prediction.risk_band == assessment.risk_band
    assert reproduced_prediction.prediction_result == assessment.prediction_result
