from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.audit import SecurityEvent


class SecurityEventRepository(BaseRepository[SecurityEvent]):
    """
    SQLAlchemy repository for append-only SecurityEvent persistence.
    """

    def __init__(self, db: Session):
        super().__init__(SecurityEvent, db)

    def log_security_event(
        self,
        event_type: str,
        severity: str = "warning",
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        request_id: Optional[str] = None,
        ip_hash: Optional[str] = None,
        user_agent_summary: Optional[str] = None,
        safe_metadata_json: Optional[dict] = None,
    ) -> SecurityEvent:
        """Appends a new security event record."""
        event = SecurityEvent(
            user_id=user_id,
            event_type=event_type,
            severity=severity,
            resource_type=resource_type,
            resource_id=resource_id,
            request_id=request_id,
            ip_hash=ip_hash,
            user_agent_summary=user_agent_summary,
            safe_metadata_json=safe_metadata_json,
        )
        return self.create(event)

    def list_by_event_type(
        self, event_type: str, skip: int = 0, limit: int = 50
    ) -> List[SecurityEvent]:
        """Fetches security events by event type."""
        stmt = (
            select(SecurityEvent)
            .where(SecurityEvent.event_type == event_type)
            .order_by(SecurityEvent.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
