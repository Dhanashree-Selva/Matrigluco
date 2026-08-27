import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.risk_assessment import RiskAssessment, RiskAssessmentFeature
from app.schemas.prediction import PredictionCreateRequest
from app.services.prediction_service import PredictionService
from app.ml.inference.predictor import MLInferenceService
from app.ml.inference.feature_contract import MODEL_FEATURE_ORDER


def test_full_prediction_reconstruction_from_feature_rows(db_session: Session, test_user_a: User):
    """
    Mandatory Acceptance Test:
    Reconstructs the canonical feature vector strictly from the 8 persisted
    RiskAssessmentFeature rows in the database, re-runs inference through the
    registered model bundle, and verifies that the reproduced probability and risk
    band match the persisted values within floating-point tolerance.
    """
    service = PredictionService(db_session)

    payload = PredictionCreateRequest(
        pregnancies=2,
        glucose=140.0,
        blood_pressure=80.0,
        skin_thickness=25.0,
        insulin=105.0,
        bmi=27.5,
        diabetes_pedigree_function=0.42,
        age=29.0,
    )

    created = service.create_assessment(payload=payload, actor=test_user_a)
    persisted_probability = created.probability
    persisted_risk_band = created.risk_band

    # 1. Query database for RiskAssessment
    assessment = (
        db_session.query(RiskAssessment).filter(RiskAssessment.public_id == created.id).first()
    )
    assert assessment is not None

    # 2. Query database for all 8 RiskAssessmentFeature rows ordered by feature_order
    feature_rows = (
        db_session.query(RiskAssessmentFeature)
        .filter(RiskAssessmentFeature.risk_assessment_id == assessment.id)
        .order_by(RiskAssessmentFeature.feature_order.asc())
        .all()
    )
    assert len(feature_rows) == 8

    # 3. Reconstruct canonical dictionary
    reconstructed_vector = {row.feature_name: row.feature_value for row in feature_rows}
    assert list(reconstructed_vector.keys()) == list(MODEL_FEATURE_ORDER)

    # 4. Run inference through the exact model version
    inference_service = MLInferenceService()
    recomputed = inference_service.evaluate(
        raw_features=reconstructed_vector,
        version=assessment.model_version.version,
    )

    # 5. Assert exact reproduction
    assert recomputed.probability == pytest.approx(persisted_probability, abs=1e-7)
    assert recomputed.risk_band == persisted_risk_band
