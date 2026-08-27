from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ProfileUpdate(BaseModel):
    """Mutable profile fields for self-service updates."""

    full_name: Optional[str] = Field(None, max_length=150)
    age: Optional[int] = Field(None, ge=12, le=120)
    blood_group: Optional[str] = Field(None, max_length=10)
    phone: Optional[str] = Field(None, max_length=30)
    emergency_contact: Optional[str] = Field(None, max_length=150)

    model_config = ConfigDict(extra="forbid")


class ProfileResponse(BaseModel):
    """Sanitized patient profile representation."""

    id: str = Field(..., validation_alias="public_id")
    email: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    role: str
    status: str
    email_verified: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
