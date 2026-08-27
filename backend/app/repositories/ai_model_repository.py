from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.ai_model import AIModel


class AIModelRepository(BaseRepository[AIModel]):
    def __init__(self, db: Session):
        super().__init__(AIModel, db)

    def get_by_key(self, model_key: str) -> Optional[AIModel]:
        stmt = select(AIModel).where(AIModel.model_key == model_key)
        return self.db.scalars(stmt).first()

    def get_default_model(self) -> Optional[AIModel]:
        stmt = select(AIModel).where(AIModel.is_default.is_(True), AIModel.is_active.is_(True))
        return self.db.scalars(stmt).first()
