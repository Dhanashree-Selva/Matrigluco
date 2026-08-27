from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, field_serializer


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str = "system"
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    is_read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at", "read_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    page: int
    page_size: int
    unread_count: int


class NotificationPreferencesResponse(BaseModel):
    user_id: str
    consultation_reminders_enabled: bool
    risk_notifications_enabled: bool
    daily_summary_notifications_enabled: bool
    email_notifications_enabled: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("updated_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")


class NotificationPreferencesUpdate(BaseModel):
    consultation_reminders_enabled: Optional[bool] = None
    risk_notifications_enabled: Optional[bool] = None
    daily_summary_notifications_enabled: Optional[bool] = None
    email_notifications_enabled: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")
