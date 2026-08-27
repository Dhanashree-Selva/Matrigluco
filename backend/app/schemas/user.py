from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    expected_due_date: Optional[str] = None
    pregnancy_week: Optional[int] = None
    previous_pregnancies: Optional[int] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    public_id: Optional[str] = None
    email: str
    full_name: Optional[str] = None
    role: str = "user"
    status: str = "active"
    expected_due_date: Optional[str] = None
    pregnancy_week: Optional[int] = 0
    previous_pregnancies: Optional[int] = 0
    phone: Optional[str] = None
    age: Optional[int] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    email_verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    user_metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
