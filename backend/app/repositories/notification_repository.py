from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from app.models.notification import Notification, NotificationPreference


class NotificationRepository:
    """Repository managing durable in-app notifications and preferences in MySQL."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, notification: Notification) -> Notification:
        self.db.add(notification)
        self.db.flush()
        return notification

    def get_owned(self, user_id: str, notification_id: str) -> Optional[Notification]:
        stmt = select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_dedupe_key(self, dedupe_key: str) -> Optional[Notification]:
        stmt = select(Notification).where(Notification.dedupe_key == dedupe_key)
        return self.db.execute(stmt).scalar_one_or_none()

    def list_owned(
        self,
        user_id: str,
        is_read: Optional[bool] = None,
        notification_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Notification], int]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        count_stmt = select(func.count(Notification.id)).where(Notification.user_id == user_id)

        if is_read is not None:
            stmt = stmt.where(Notification.is_read == is_read)
            count_stmt = count_stmt.where(Notification.is_read == is_read)

        if notification_type is not None:
            stmt = stmt.where(Notification.notification_type == notification_type)
            count_stmt = count_stmt.where(Notification.notification_type == notification_type)

        total = self.db.execute(count_stmt).scalar() or 0
        items = list(
            self.db.execute(
                stmt.order_by(Notification.created_at.desc(), Notification.id.desc())
                .offset(skip)
                .limit(limit)
            )
            .scalars()
            .all()
        )
        return items, total

    def mark_read(self, user_id: str, notification_id: str) -> bool:
        stmt = select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
        )
        notif = self.db.execute(stmt).scalar_one_or_none()
        if not notif:
            return False
        if not notif.is_read:
            notif.is_read = True
            notif.read_at = datetime.now(timezone.utc).replace(tzinfo=None)
            self.db.flush()
        return True

    def mark_all_read(self, user_id: str) -> int:
        stmt = select(Notification).where(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
        )
        unread_items = list(self.db.execute(stmt).scalars().all())
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        for item in unread_items:
            item.is_read = True
            item.read_at = now
        self.db.flush()
        return len(unread_items)

    def get_unread_count(self, user_id: str) -> int:
        stmt = select(func.count(Notification.id)).where(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
        )
        return self.db.execute(stmt).scalar() or 0


class NotificationPreferenceRepository:
    """Repository managing user notification preferences in MySQL."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: str) -> Optional[NotificationPreference]:
        stmt = select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_or_create_default(self, user_id: str) -> NotificationPreference:
        pref = self.get_by_user_id(user_id)
        if not pref:
            pref = NotificationPreference(
                user_id=user_id,
                consultation_reminders_enabled=True,
                risk_notifications_enabled=True,
                daily_summary_notifications_enabled=True,
                email_notifications_enabled=True,
            )
            self.db.add(pref)
            self.db.flush()
        return pref

    def update_preferences(
        self,
        user_id: str,
        consultation_reminders_enabled: Optional[bool] = None,
        risk_notifications_enabled: Optional[bool] = None,
        daily_summary_notifications_enabled: Optional[bool] = None,
        email_notifications_enabled: Optional[bool] = None,
    ) -> NotificationPreference:
        pref = self.get_or_create_default(user_id)
        if consultation_reminders_enabled is not None:
            pref.consultation_reminders_enabled = consultation_reminders_enabled
        if risk_notifications_enabled is not None:
            pref.risk_notifications_enabled = risk_notifications_enabled
        if daily_summary_notifications_enabled is not None:
            pref.daily_summary_notifications_enabled = daily_summary_notifications_enabled
        if email_notifications_enabled is not None:
            pref.email_notifications_enabled = email_notifications_enabled
        pref.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        self.db.flush()
        return pref
