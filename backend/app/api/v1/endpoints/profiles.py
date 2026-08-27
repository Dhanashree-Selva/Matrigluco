from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.models.user import User
from app.services.user_service import UserService
from app.api.dependencies import get_current_user, get_user_service, get_db
from app.cache.service import CacheService
from app.cache.keys import user_dashboard_key, user_summary_key

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/me", response_model=ProfileResponse, summary="Get current user profile")
@router.get("/current", response_model=ProfileResponse, include_in_schema=False)
def get_current_profile(user: User = Depends(get_current_user)):
    """Retrieves authenticated patient profile."""
    return ProfileResponse.model_validate(user)


@router.patch(
    "/me", response_model=ProfileResponse, summary="Partially update current user profile"
)
@router.put("/current", response_model=ProfileResponse, include_in_schema=False)
def update_current_profile(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Partially updates mutable profile fields for the authenticated patient."""
    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(user, field, val)

    db.add(user)
    db.commit()
    db.refresh(user)

    # Invalidate dashboard cache
    cache = CacheService()
    cache.delete(user_dashboard_key(user.id))
    cache.delete(user_summary_key(user.id))

    return ProfileResponse.model_validate(user)
