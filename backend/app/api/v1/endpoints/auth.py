from typing import Optional
from fastapi import APIRouter, Depends, Request, status, Response, Body
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenPairResponse,
    RefreshRequest,
    LogoutRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    SessionListResponse,
)
from app.schemas.user import UserResponse
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService
from app.models.user import User
from app.api.dependencies import get_auth_service, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Sessions"])


# ─── Registration & Login ─────────────────────────────────────────────────────


@router.post(
    "/register",
    response_model=TokenPairResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(
    payload: RegisterRequest,
    request: Request,
    service: AuthService = Depends(get_auth_service),
):
    """Registers a new user account with Argon2id password hash and returns initial tokens."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return service.register_user(payload, ip_address=client_ip, user_agent=user_agent)


@router.post(
    "/signup",
    response_model=TokenPairResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account (legacy alias)",
)
def signup_alias(
    payload: RegisterRequest,
    request: Request,
    service: AuthService = Depends(get_auth_service),
):
    """Legacy alias for /register endpoint."""
    return register(payload=payload, request=request, service=service)


@router.post(
    "/login",
    response_model=TokenPairResponse,
    summary="Authenticate user credentials",
)
def login(
    payload: LoginRequest,
    request: Request,
    service: AuthService = Depends(get_auth_service),
):
    """Authenticates email and password, issuing access JWT and opaque refresh token."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return service.authenticate_user(payload, ip_address=client_ip, user_agent=user_agent)


@router.post(
    "/refresh",
    response_model=TokenPairResponse,
    summary="Rotate refresh token and obtain new access JWT",
)
def refresh(
    payload: RefreshRequest,
    request: Request,
    service: AuthService = Depends(get_auth_service),
):
    """Rotates refresh token atomically with token-family reuse detection."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return service.refresh_tokens(
        payload.refresh_token, ip_address=client_ip, user_agent=user_agent
    )


# ─── Identity & Profile ───────────────────────────────────────────────────────


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user identity",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile and identity information for the verified Bearer token principal."""
    return UserResponse.model_validate(current_user)


# ─── Session Management ───────────────────────────────────────────────────────


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke current refresh session",
)
def logout(
    payload: Optional[LogoutRequest] = None,
    service: AuthService = Depends(get_auth_service),
):
    """Revokes the presented refresh token session server-side if provided."""
    if payload and payload.refresh_token:
        service.logout(payload.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/logout-all",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke all active sessions for current user",
)
def logout_all(
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    """Revokes all active refresh sessions across all devices for the authenticated user."""
    service.logout_all(current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/sessions",
    response_model=SessionListResponse,
    summary="List active sessions for current user",
)
def list_sessions(
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    """Lists all active login sessions belonging strictly to the authenticated user."""
    return service.list_user_sessions(current_user.id)


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke a specific session owned by current user",
)
def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    """Revokes a specific session by public UUID under strict user ownership enforcement."""
    service.revoke_user_session(user_id=current_user.id, session_public_id=session_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─── Password Management ──────────────────────────────────────────────────────


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change account password",
)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    """Changes password for authenticated user and invalidates all existing refresh sessions."""
    service.change_password(user_id=current_user.id, payload=payload)
    return MessageResponse(
        message="Password changed successfully. Please log in with your new password."
    )


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Request password reset link (non-enumerating)",
)
def forgot_password(
    payload: ForgotPasswordRequest,
    service: AuthService = Depends(get_auth_service),
):
    """Initiates password reset instructions without disclosing account existence."""
    service.forgot_password(payload)
    return MessageResponse(
        message="If an account matches that email address, password reset instructions will be sent."
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password using one-time opaque token",
)
def reset_password(
    payload: ResetPasswordRequest,
    service: AuthService = Depends(get_auth_service),
):
    """Resets password using single-use hashed token and revokes all active sessions."""
    service.reset_password(payload)
    return MessageResponse(
        message="Password has been reset successfully. Please log in with your new password."
    )


# ─── Email Verification ───────────────────────────────────────────────────────


@router.post(
    "/verify-email",
    response_model=MessageResponse,
    summary="Verify email address with one-time token",
)
def verify_email(
    payload: VerifyEmailRequest,
    service: AuthService = Depends(get_auth_service),
):
    """Marks email address as verified using one-time token."""
    service.verify_email(payload.token)
    return MessageResponse(message="Email address verified successfully.")


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    summary="Resend email verification token (non-enumerating)",
)
def resend_verification(
    payload: ResendVerificationRequest,
    service: AuthService = Depends(get_auth_service),
):
    """Resends verification email instructions without disclosing account existence."""
    service.resend_verification(payload.email)
    return MessageResponse(
        message="If an unverified account matches that email address, a new verification link will be sent."
    )
