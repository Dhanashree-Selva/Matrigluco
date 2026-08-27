from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class AIModelRegisterRequest(BaseModel):
    model_key: str
    display_name: str
    version: str
    artifact_path: str
    context_length: int = 4096
    quantization: str = "Q4_K_M"
    is_default: bool = False


class AIModelResponse(BaseModel):
    id: str
    model_key: str
    display_name: str
    version: str
    provider: str
    format: str
    context_length: int
    quantization: Optional[str]
    is_default: bool
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
