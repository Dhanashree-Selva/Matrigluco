import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.prediction import PredictionCreateRequest
from app.services.prediction_service import PredictionService
from app.core.exceptions import PredictionNotFoundError


def test_prediction_service_create_and_get_detail(db_session: Session, test_user_a: User):
    """PredictionService creates assessment and retrieves detail with feature snapshot."""
    service = PredictionService(db_session)

    payload = PredictionCreateRequest(
        pregnancies=2,
        glucose=128.0,
        blood_pressure=76.0,
        skin_thickness=22.0,
        insulin=85.0,
        bmi=25.5,
        diabetes_pedigree_function=0.38,
        age=29.0,
    )

    created = service.create_assessment(payload=payload, actor=test_user_a)
    assert created.id is not None
    assert created.probability_score > 0.0

    retrieved = service.get_assessment_detail(created.id, actor=test_user_a)
    assert retrieved.id == created.id
    assert retrieved.features_snapshot["glucose"] == 128.0
    assert retrieved.features_snapshot["bmi"] == 25.5


def test_prediction_service_list_user_assessments(db_session: Session, test_user_a: User):
    """PredictionService lists paginated assessments owned by actor."""
    service = PredictionService(db_session)

    payload = PredictionCreateRequest(
        pregnancies=1,
        glucose=110.0,
        blood_pressure=70.0,
        skin_thickness=20.0,
        insulin=65.0,
        bmi=23.0,
        diabetes_pedigree_function=0.25,
        age=25.0,
    )
    service.create_assessment(payload=payload, actor=test_user_a)

    resp = service.list_user_assessments(actor=test_user_a, page=1, page_size=10)
    assert resp.pagination.total >= 1
    assert len(resp.items) >= 1
    assert resp.items[0].model_version == "1.0.0"


def test_prediction_service_delete_assessment(db_session: Session, test_user_a: User):
    """PredictionService soft-deletes assessment."""
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
    created = service.create_assessment(payload=payload, actor=test_user_a)

    service.delete_assessment(created.id, actor=test_user_a)

    with pytest.raises(PredictionNotFoundError):
        service.get_assessment_detail(created.id, actor=test_user_a)
