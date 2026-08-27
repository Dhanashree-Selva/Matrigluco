from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field


class PregnancyCreate(BaseModel):
    pregnancy_week: Optional[int] = Field(None, ge=1, le=45)
    expected_due_date: Optional[str] = None
    previous_pregnancies: Optional[int] = Field(0, ge=0, le=25)
    gestational_diabetes_history: Optional[bool] = False
    notes: Optional[str] = Field(None, max_length=500)

    model_config = ConfigDict(extra="forbid")


class PregnancyUpdate(BaseModel):
    pregnancy_week: Optional[int] = Field(None, ge=1, le=45)
    expected_due_date: Optional[str] = None
    previous_pregnancies: Optional[int] = Field(None, ge=0, le=25)
    gestational_diabetes_history: Optional[bool] = None
    status: Optional[str] = Field(None, max_length=30)
    notes: Optional[str] = Field(None, max_length=500)

    model_config = ConfigDict(extra="forbid")


class PregnancyResponse(BaseModel):
    id: str
    user_id: str
    pregnancy_week: int
    expected_due_date: Optional[str] = None
    previous_pregnancies: int = 0
    gestational_diabetes_history: bool = False
    status: str = "active"
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
