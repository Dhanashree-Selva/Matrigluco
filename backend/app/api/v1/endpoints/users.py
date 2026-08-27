from fastapi import APIRouter, Depends
from app.schemas.user import UserResponse, UserUpdate
from app.models.user import User
from app.services.user_service import UserService
from app.api.dependencies import get_current_user, get_user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Retrieves authenticated user profile."""
    return UserResponse.model_validate(user)


@router.patch("/me", response_model=UserResponse)
def update_current_user_profile(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    """Updates authenticated user profile."""
    return service.update_user(user.id, payload)
