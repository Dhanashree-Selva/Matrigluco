from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.api.dependencies import get_current_user, get_db
from app.schemas.pregnancy import (
    PregnancyCreate,
    PregnancyUpdate,
    PregnancyResponse,
)
from app.utils.datetime import calculate_gestational_weeks
from app.cache.service import CacheService
from app.cache.keys import user_dashboard_key

router = APIRouter(prefix="/pregnancies", tags=["Pregnancies"])


def _build_pregnancy_response(user: User) -> PregnancyResponse:
    current_week = user.pregnancy_week or 0
    if not current_week and user.expected_due_date:
        try:
            due_d = datetime.strptime(user.expected_due_date, "%Y-%m-%d").date()
            current_week = calculate_gestational_weeks(due_d)
        except Exception:
            pass

    return PregnancyResponse(
        id=user.public_id,
        user_id=user.id,
        pregnancy_week=current_week,
        expected_due_date=user.expected_due_date,
        previous_pregnancies=user.previous_pregnancies or 0,
        gestational_diabetes_history=False,
        status="active",
        notes=None,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get("", response_model=List[PregnancyResponse], summary="List patient pregnancy contexts")
def list_pregnancies(user: User = Depends(get_current_user)):
    """Retrieves current user's pregnancy contexts."""
    return [_build_pregnancy_response(user)]


@router.post(
    "",
    response_model=PregnancyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create pregnancy context",
)
def create_pregnancy(
    payload: PregnancyCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sets/creates active pregnancy context for current user."""
    if payload.pregnancy_week is not None:
        user.pregnancy_week = payload.pregnancy_week
    if payload.expected_due_date is not None:
        user.expected_due_date = payload.expected_due_date
    if payload.previous_pregnancies is not None:
        user.previous_pregnancies = payload.previous_pregnancies

    db.add(user)
    db.commit()
    db.refresh(user)

    cache = CacheService()
    cache.delete(user_dashboard_key(user.id))

    return _build_pregnancy_response(user)


@router.get(
    "/{pregnancy_id}", response_model=PregnancyResponse, summary="Get single pregnancy context"
)
def get_pregnancy_detail(
    pregnancy_id: str,
    user: User = Depends(get_current_user),
):
    """Retrieves single owned pregnancy context by ID."""
    if pregnancy_id not in [user.id, user.public_id]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pregnancy context '{pregnancy_id}' not found.",
        )
    return _build_pregnancy_response(user)


@router.patch(
    "/{pregnancy_id}", response_model=PregnancyResponse, summary="Update owned pregnancy context"
)
def update_pregnancy(
    pregnancy_id: str,
    payload: PregnancyUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates mutable fields of owned pregnancy context."""
    if pregnancy_id not in [user.id, user.public_id]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pregnancy context '{pregnancy_id}' not found.",
        )

    if payload.pregnancy_week is not None:
        user.pregnancy_week = payload.pregnancy_week
    if payload.expected_due_date is not None:
        user.expected_due_date = payload.expected_due_date
    if payload.previous_pregnancies is not None:
        user.previous_pregnancies = payload.previous_pregnancies

    db.add(user)
    db.commit()
    db.refresh(user)

    cache = CacheService()
    cache.delete(user_dashboard_key(user.id))

    return _build_pregnancy_response(user)


@router.delete(
    "/{pregnancy_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Archive pregnancy context"
)
def delete_pregnancy(
    pregnancy_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Archives active pregnancy context."""
    if pregnancy_id not in [user.id, user.public_id]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pregnancy context '{pregnancy_id}' not found.",
        )
    user.pregnancy_week = 0
    user.expected_due_date = None
    db.add(user)
    db.commit()


@router.get("/status", include_in_schema=False)
def get_pregnancy_status_legacy(user: User = Depends(get_current_user)):
    """Legacy alias for backward compatibility."""
    return _build_pregnancy_response(user)
