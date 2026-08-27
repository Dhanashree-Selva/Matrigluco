import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.consent_repository import ConsentRepository
from app.models.consent import ConsentRecord
from app.services.audit_service import AuditService

logger = logging.getLogger("matrigluco.services.consent")


class ConsentService:
    """
    Application service managing patient consent recording, verification, and auditability.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = ConsentRepository(db)
        self.audit_service = AuditService(db)

    def has_active_consent(
        self,
        user_id: str,
        consent_type: str,
        required_version: Optional[str] = None,
    ) -> bool:
        """
        Verifies whether patient has an active (unwithdrawn) consent record matching required version.
        """
        record = self.repo.get_active_consent(user_id=user_id, consent_type=consent_type)
        if not record:
            return False
        if required_version and record.consent_version != required_version:
            return False
        return True

    def record_consent(
        self,
        user_id: str,
        consent_type: str,
        consent_version: str,
    ) -> ConsentRecord:
        """Records new consent acceptance and writes audit log."""
        record = self.repo.record_consent(
            user_id=user_id,
            consent_type=consent_type,
            consent_version=consent_version,
        )
        self.audit_service.record_event(
            event_type="CONSENT_ACCEPTED",
            actor_user_id=user_id,
            resource_type="consent",
            resource_id=record.public_id,
            safe_metadata={"consent_type": consent_type, "consent_version": consent_version},
        )
        return record

    def withdraw_consent(
        self,
        user_id: str,
        consent_type: str,
    ) -> Optional[ConsentRecord]:
        """Withdraws consent and writes audit log."""
        record = self.repo.withdraw_consent(user_id=user_id, consent_type=consent_type)
        if record:
            self.audit_service.record_event(
                event_type="CONSENT_WITHDRAWN",
                actor_user_id=user_id,
                resource_type="consent",
                resource_id=record.public_id,
                safe_metadata={
                    "consent_type": consent_type,
                    "consent_version": record.consent_version,
                },
            )
        return record
