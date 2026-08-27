from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class FileAssetResponse(BaseModel):
    id: str
    category: str
    original_filename: Optional[str] = None
    mime_type: str
    size_bytes: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
