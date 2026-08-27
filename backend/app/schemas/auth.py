from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = None
    expected_due_date: Optional[str] = None
    phone: Optional[str] = None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class TokenPairResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # in seconds
    refresh_token: Optional[str] = None
    user: Dict[str, Any]


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None



class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class SessionResponse(BaseModel):
    id: str  # public_id
    created_at: datetime
    last_used_at: datetime
    expires_at: datetime
    user_agent: Optional[str] = None
    status: str
    is_current: bool = False

    model_config = ConfigDict(from_attributes=True)


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
    total: int


# ─── Backward Compatibility Schema Aliases ───────────────────────────────────

UserSignUp = RegisterRequest
UserSignIn = LoginRequest
AuthResponse = TokenPairResponse
RefreshTokenRequest = RefreshRequest
