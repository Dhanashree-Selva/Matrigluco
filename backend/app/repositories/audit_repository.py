import hashlib
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.audit import AuditLog


class AuditRepository(BaseRepository[AuditLog]):
    """
    SQLAlchemy repository for append-only AuditLog persistence.
    """

    def __init__(self, db: Session):
        super().__init__(AuditLog, db)

    def log_event(
        self,
        event_type: str,
        actor_user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        outcome: str = "success",
        request_id: Optional[str] = None,
        safe_metadata_json: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        """Appends a new audit record to the log."""
        record = AuditLog(
            actor_user_id=actor_user_id,
            event_type=event_type,
            resource_type=resource_type,
            resource_id=resource_id,
            outcome=outcome,
            request_id=request_id,
            safe_metadata_json=safe_metadata_json,
        )
        return self.create(record)

    def record_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        actor_user_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        outcome: str = "success",
        request_id: Optional[str] = None,
    ) -> AuditLog:
        """Flexible record_event adapter for service callers."""
        target_actor = actor_user_id or user_id
        meta = dict(details or {})
        if ip_address:
            meta["ip_hash"] = hashlib.sha256(ip_address.encode("utf-8")).hexdigest()[:16]
        if user_agent:
            meta["user_agent"] = user_agent[:150]

        return self.log_event(
            event_type=event_type,
            actor_user_id=target_actor,
            resource_type=resource_type,
            resource_id=resource_id,
            outcome=outcome,
            request_id=request_id,
            safe_metadata_json=meta if meta else None,
        )

    def list_by_actor(self, actor_user_id: str, skip: int = 0, limit: int = 50) -> List[AuditLog]:
        """Fetches audit history for a specific actor."""
        stmt = (
            select(AuditLog)
            .where(AuditLog.actor_user_id == actor_user_id)
            .order_by(AuditLog.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
