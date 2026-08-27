import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.risk_assessment import RiskAssessment, RiskAssessmentFeature
from app.models.model_version import ModelVersion
from app.schemas.prediction import PredictionCreateRequest
from app.services.prediction_service import PredictionService
from app.ml.inference.feature_contract import MODEL_FEATURE_ORDER


def test_prediction_persistence_creates_assessment_and_eight_features(
    db_session: Session, test_user_a: User
):
    """
    Persisting a prediction creates exactly 1 RiskAssessment row,
    exactly 8 RiskAssessmentFeature rows, and 1 ModelVersion row in the database.
    """
    service = PredictionService(db_session)

    payload = PredictionCreateRequest(
        pregnancies=2,
        glucose=135.0,
        blood_pressure=82.0,
        skin_thickness=26.0,
        insulin=110.0,
        bmi=28.4,
        diabetes_pedigree_function=0.45,
        age=31.0,
    )

    response = service.create_assessment(payload=payload, actor=test_user_a, source="manual")

    assert response.id is not None
    assert response.probability > 0.0
    assert response.risk_band in ["low", "moderate", "high"]

    # Verify RiskAssessment in database
    assessment = (
        db_session.query(RiskAssessment).filter(RiskAssessment.public_id == response.id).first()
    )
    assert assessment is not None
    assert assessment.user_id == test_user_a.id
    assert assessment.source == "manual"
    assert assessment.assessment_status == "completed"

    # Verify ModelVersion in database
    model_ver = (
        db_session.query(ModelVersion)
        .filter(ModelVersion.id == assessment.model_version_id)
        .first()
    )
    assert model_ver is not None
    assert model_ver.model_key == "diabetes-risk"
    assert model_ver.version == "1.0.0"

    # Verify exactly 8 Feature rows in database
    features = (
        db_session.query(RiskAssessmentFeature)
        .filter(RiskAssessmentFeature.risk_assessment_id == assessment.id)
        .order_by(RiskAssessmentFeature.feature_order.asc())
        .all()
    )
    assert len(features) == 8

    # Verify feature names and ordering match canonical contract
    for idx, feature_row in enumerate(features):
        assert feature_row.feature_order == idx
        assert feature_row.feature_name == MODEL_FEATURE_ORDER[idx]
        assert feature_row.feature_value > 0.0
        assert feature_row.source_type in ["manual", "provided"]


def test_historical_prediction_stability_on_new_model_version(
    db_session: Session, test_user_a: User
):
    """
    Historical assessment retains its original model version, probability, and features
    even after a new model version is registered.
    """
    service = PredictionService(db_session)

    payload = PredictionCreateRequest(
        pregnancies=1,
        glucose=115.0,
        blood_pressure=72.0,
        skin_thickness=20.0,
        insulin=70.0,
        bmi=24.0,
        diabetes_pedigree_function=0.30,
        age=27.0,
    )

    original_resp = service.create_assessment(payload=payload, actor=test_user_a)
    original_prob = original_resp.probability
    original_band = original_resp.risk_band

    # Simulate registration of a newer model version 1.1.0 in registry
    new_version = ModelVersion(
        model_key="diabetes-risk",
        version="1.1.0",
        framework="scikit-learn",
        feature_contract_version="1.0",
        artifact_path="app/ml/artifacts/diabetes-risk/1.1.0",
        metadata_path="app/ml/artifacts/diabetes-risk/1.1.0/metadata.json",
        is_active=True,
    )
    db_session.add(new_version)
    db_session.commit()

    # Retrieve old assessment
    retrieved = service.get_assessment_detail(original_resp.id, actor=test_user_a)
    assert retrieved.id == original_resp.id
    assert retrieved.model.version == "1.0.0"
    assert retrieved.probability == original_prob
    assert retrieved.risk_band == original_band
