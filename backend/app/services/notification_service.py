import logging
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.notification import Notification, NotificationPreference
from app.repositories.notification_repository import (
    NotificationRepository,
    NotificationPreferenceRepository,
)

logger = logging.getLogger("matrigluco.services.notification")


class NotificationService:
    """
    Centralized application service for in-app notifications and preference evaluation.
    Guarantees:
    1. In-app notification inbox is durable in MySQL before optional external email dispatch.
    2. Deterministic deduplication keys prevent duplicate reminders and notifications.
    3. User notification preferences are evaluated and enforced before dispatch.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = NotificationRepository(db)
        self.pref_repo = NotificationPreferenceRepository(db)

    def _is_category_enabled(self, prefs: NotificationPreference, notification_type: str) -> bool:
        if notification_type == "consultation_reminder":
            return bool(prefs.consultation_reminders_enabled)
        elif notification_type == "risk_update":
            return bool(prefs.risk_notifications_enabled)
        elif notification_type == "daily_summary":
            return bool(prefs.daily_summary_notifications_enabled)
        # System notifications are mandatory
        return True

    def create_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "system",
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        dedupe_key: Optional[str] = None,
        bypass_preference: bool = False,
    ) -> Optional[Notification]:
        """
        Creates a durable notification in MySQL if preferences permit and dedupe key is unique.
        """
        prefs = self.pref_repo.get_or_create_default(user_id)
        if not bypass_preference and not self._is_category_enabled(prefs, notification_type):
            logger.info(
                f"Notification of type '{notification_type}' skipped for user '{user_id}' due to user preferences."
            )
            return None

        # Check existing dedupe key
        if dedupe_key:
            existing = self.repo.get_by_dedupe_key(dedupe_key)
            if existing:
                logger.info(
                    f"Notification with dedupe key '{dedupe_key}' already exists. Skipping duplicate."
                )
                return existing

        email_status = (
            "pending"
            if (prefs.email_notifications_enabled and notification_type != "system")
            else "not_requested"
        )

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            resource_type=resource_type,
            resource_id=resource_id,
            dedupe_key=dedupe_key,
            is_read=False,
            email_status=email_status,
        )

        try:
            saved = self.repo.create(notification)
            logger.info(
                f"Notification '{saved.id}' created for user '{user_id}' [type={notification_type}]."
            )
            return saved
        except IntegrityError:
            self.db.rollback()
            if dedupe_key:
                existing = self.repo.get_by_dedupe_key(dedupe_key)
                if existing:
                    return existing
            logger.warning(f"IntegrityError creating notification for user '{user_id}'.")
            return None

    def list_user_notifications(
        self,
        user_id: str,
        is_read: Optional[bool] = None,
        notification_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Notification], int]:
        return self.repo.list_owned(
            user_id=user_id,
            is_read=is_read,
            notification_type=notification_type,
            skip=skip,
            limit=limit,
        )

    def mark_notification_read(self, user_id: str, notification_id: str) -> bool:
        return self.repo.mark_read(user_id=user_id, notification_id=notification_id)

    def mark_all_read(self, user_id: str) -> int:
        return self.repo.mark_all_read(user_id=user_id)

    def get_unread_count(self, user_id: str) -> int:
        return self.repo.get_unread_count(user_id=user_id)

    def get_preferences(self, user_id: str) -> NotificationPreference:
        return self.pref_repo.get_or_create_default(user_id)

    def update_preferences(
        self,
        user_id: str,
        consultation_reminders_enabled: Optional[bool] = None,
        risk_notifications_enabled: Optional[bool] = None,
        daily_summary_notifications_enabled: Optional[bool] = None,
        email_notifications_enabled: Optional[bool] = None,
    ) -> NotificationPreference:
        return self.pref_repo.update_preferences(
            user_id=user_id,
            consultation_reminders_enabled=consultation_reminders_enabled,
            risk_notifications_enabled=risk_notifications_enabled,
            daily_summary_notifications_enabled=daily_summary_notifications_enabled,
            email_notifications_enabled=email_notifications_enabled,
        )
