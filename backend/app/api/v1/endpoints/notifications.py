from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.notification_service import NotificationService
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
)
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=NotificationListResponse,
    summary="List patient notifications (paginated)",
)
def list_user_notifications(
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    notification_type: Optional[str] = Query(None, description="Filter by notification type"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves current patient's clinical notifications and alerts."""
    service = NotificationService(db)
    skip = (page - 1) * page_size
    items, total = service.list_user_notifications(
        user_id=current_user.id,
        is_read=is_read,
        notification_type=notification_type,
        skip=skip,
        limit=page_size,
    )
    unread = service.get_unread_count(user_id=current_user.id)

    return NotificationListResponse(
        items=[NotificationResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        unread_count=unread,
    )


@router.get(
    "/preferences",
    response_model=NotificationPreferencesResponse,
    summary="Get user notification preferences",
)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves current authenticated patient's notification preferences."""
    service = NotificationService(db)
    prefs = service.get_preferences(user_id=current_user.id)
    return NotificationPreferencesResponse.model_validate(prefs)


@router.patch(
    "/preferences",
    response_model=NotificationPreferencesResponse,
    summary="Update user notification preferences",
)
def update_preferences(
    payload: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates current authenticated patient's notification preferences."""
    service = NotificationService(db)
    updated = service.update_preferences(
        user_id=current_user.id,
        consultation_reminders_enabled=payload.consultation_reminders_enabled,
        risk_notifications_enabled=payload.risk_notifications_enabled,
        daily_summary_notifications_enabled=payload.daily_summary_notifications_enabled,
        email_notifications_enabled=payload.email_notifications_enabled,
    )
    db.commit()
    return NotificationPreferencesResponse.model_validate(updated)


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
    summary="Get single notification detail",
)
def get_notification_detail(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves a single owned notification by ID."""
    service = NotificationService(db)
    notif = service.repo.get_owned(user_id=current_user.id, notification_id=notification_id)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification '{notification_id}' not found.",
        )
    return NotificationResponse.model_validate(notif)


@router.patch(
    "/{notification_id}/read",
    response_model=MessageResponse,
    summary="Mark notification as read",
)
def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marks an owned notification as read."""
    service = NotificationService(db)
    marked = service.mark_notification_read(
        user_id=current_user.id, notification_id=notification_id
    )
    if not marked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification '{notification_id}' not found.",
        )
    db.commit()
    return MessageResponse(message="Notification marked as read.")


@router.patch(
    "/read-all",
    response_model=MessageResponse,
    summary="Mark all inbox notifications as read",
)
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marks all unread notifications in patient inbox as read."""
    service = NotificationService(db)
    count = service.mark_all_read(user_id=current_user.id)
    db.commit()
    return MessageResponse(message=f"{count} notifications marked as read.")
