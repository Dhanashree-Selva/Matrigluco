from typing import List, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.consent import ConsentRecord


class ConsentRepository(BaseRepository[ConsentRecord]):
    """
    SQLAlchemy repository for patient consent records.
    """

    def __init__(self, db: Session):
        super().__init__(ConsentRecord, db)

    def get_active_consent(self, user_id: str, consent_type: str) -> Optional[ConsentRecord]:
        """Fetches active (non-withdrawn) consent record."""
        stmt = (
            select(ConsentRecord)
            .where(
                ConsentRecord.user_id == user_id,
                ConsentRecord.consent_type == consent_type,
                ConsentRecord.withdrawn_at.is_(None),
            )
            .order_by(ConsentRecord.accepted_at.desc())
        )
        return self.db.scalars(stmt).first()

    def record_consent(
        self, user_id: str, consent_type: str, consent_version: str
    ) -> ConsentRecord:
        """Records new consent acceptance."""
        record = ConsentRecord(
            user_id=user_id,
            consent_type=consent_type,
            consent_version=consent_version,
            accepted_at=datetime.utcnow(),
            withdrawn_at=None,
        )
        return self.create(record)

    def withdraw_consent(self, user_id: str, consent_type: str) -> Optional[ConsentRecord]:
        """Marks active consent as withdrawn."""
        active = self.get_active_consent(user_id=user_id, consent_type=consent_type)
        if active:
            active.withdrawn_at = datetime.utcnow()
            self.db.add(active)
            self.db.commit()
            self.db.refresh(active)
        return active
