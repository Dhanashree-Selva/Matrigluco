import hashlib
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.security_event_repository import SecurityEventRepository
from app.models.audit import SecurityEvent
from app.core.middleware import get_request_id

logger = logging.getLogger("matrigluco.services.security_events")


class SecurityEventService:
    """
    Application service managing security anomalies and abuse event logging.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = SecurityEventRepository(db)

    def record_security_event(
        self,
        event_type: str,
        severity: str = "warning",
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        raw_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
        safe_metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[SecurityEvent]:
        """
        Records an abuse or security anomaly event with hashed IP representation.
        """
        req_id = request_id or get_request_id() or None
        ip_hash = hashlib.sha256(raw_ip.encode("utf-8")).hexdigest()[:32] if raw_ip else None
        ua_summary = user_agent[:250] if user_agent else None

        try:
            event = self.repo.log_security_event(
                event_type=event_type,
                severity=severity,
                user_id=user_id,
                resource_type=resource_type,
                resource_id=resource_id,
                request_id=req_id,
                ip_hash=ip_hash,
                user_agent_summary=ua_summary,
                safe_metadata_json=safe_metadata,
            )
            logger.warning(
                f"Security event [{severity.upper()}] '{event_type}' recorded (User: {user_id})."
            )
            return event
        except Exception as e:
            logger.error(f"Failed to record security event '{event_type}': {e}")
            return None
