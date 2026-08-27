from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    UserSignUp,
    UserSignIn,
    UserUpdate,
    ResetPasswordRequest,
    UserResponse,
    AuthResponse,
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.api.dependencies import get_auth_service, get_user_service
from app.core.security import get_current_user_id

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
def signup(data: UserSignUp, service: AuthService = Depends(get_auth_service)):
    """Legacy signup endpoint delegating to AuthService."""
    return service.register_user(data)


@router.post("/signin", response_model=AuthResponse)
def signin(data: UserSignIn, service: AuthService = Depends(get_auth_service)):
    """Legacy signin endpoint delegating to AuthService."""
    return service.authenticate_user(data)


@router.get("/me")
def get_current_user(
    user_id: str = Depends(get_current_user_id),
    user_service: UserService = Depends(get_user_service),
):
    """Legacy profile fetch endpoint delegating to UserService."""
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user = user_service.get_user_by_id(user_id)
    return {"user": user.model_dump()}


@router.put("/user")
def update_user(
    data: UserUpdate,
    user_id: str = Depends(get_current_user_id),
    user_service: UserService = Depends(get_user_service),
):
    """Legacy user update endpoint delegating to UserService."""
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    updated = user_service.update_user(user_id, data)
    return {"user": updated.model_dump(), "message": "Profile updated successfully"}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    """Legacy reset password endpoint."""
    return {"message": "Password reset instructions processed."}
