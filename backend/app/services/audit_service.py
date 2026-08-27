import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.audit_repository import AuditRepository
from app.models.audit import AuditLog
from app.core.middleware import get_request_id

logger = logging.getLogger("matrigluco.services.audit")


class AuditService:
    """
    Application service managing append-only business audit event logging.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = AuditRepository(db)

    def record_event(
        self,
        event_type: str,
        actor_user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        outcome: str = "success",
        request_id: Optional[str] = None,
        safe_metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[AuditLog]:
        """
        Records a business event. Catches exceptions to avoid breaking main transaction
        unless caller explicitly handles rollback.
        """
        req_id = request_id or get_request_id() or None
        try:
            record = self.repo.log_event(
                event_type=event_type,
                actor_user_id=actor_user_id,
                resource_type=resource_type,
                resource_id=resource_id,
                outcome=outcome,
                request_id=req_id,
                safe_metadata_json=safe_metadata,
            )
            logger.info(f"Audit event '{event_type}' recorded for actor '{actor_user_id}'.")
            return record
        except Exception as e:
            logger.error(f"Failed to record audit event '{event_type}': {e}")
            return None
