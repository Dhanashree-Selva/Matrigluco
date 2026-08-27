import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.consent_service import ConsentService


def test_consent_lifecycle(db_session: Session, test_user_a: User):
    """ConsentService manages recording, active check, and withdrawal of consent."""
    service = ConsentService(db_session)

    # 1. Initially no consent
    assert not service.has_active_consent(
        user_id=test_user_a.id,
        consent_type="third_party_ocr_processing",
        required_version="ocr-third-party-v1",
    )

    # 2. Record consent
    record = service.record_consent(
        user_id=test_user_a.id,
        consent_type="third_party_ocr_processing",
        consent_version="ocr-third-party-v1",
    )
    assert record.id is not None
    assert record.withdrawn_at is None

    # 3. Active consent now verified
    assert service.has_active_consent(
        user_id=test_user_a.id,
        consent_type="third_party_ocr_processing",
        required_version="ocr-third-party-v1",
    )

    # Different version fails
    assert not service.has_active_consent(
        user_id=test_user_a.id,
        consent_type="third_party_ocr_processing",
        required_version="ocr-third-party-v2",
    )

    # 4. Withdraw consent
    withdrawn = service.withdraw_consent(
        user_id=test_user_a.id,
        consent_type="third_party_ocr_processing",
    )
    assert withdrawn is not None
    assert withdrawn.withdrawn_at is not None

    # 5. Consent no longer active
    assert not service.has_active_consent(
        user_id=test_user_a.id,
        consent_type="third_party_ocr_processing",
        required_version="ocr-third-party-v1",
    )
