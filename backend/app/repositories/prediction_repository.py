from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.risk_assessment import Prediction


class PredictionRepository(BaseRepository[Prediction]):
    """
    SQLAlchemy repository for clinical diabetes risk prediction records.
    Provides explicit ownership-scoped queries for patient medical privacy.
    """

    def __init__(self, db: Session):
        super().__init__(Prediction, db)

    def get_owned(self, prediction_id: str, owner_user_id: str) -> Optional[Prediction]:
        """Fetch single prediction ensuring patient ownership constraint directly in SQL."""
        stmt = select(Prediction).where(
            Prediction.id == prediction_id,
            Prediction.user_id == owner_user_id,
        )
        return self.db.scalars(stmt).first()

    def list_owned(self, owner_user_id: str, skip: int = 0, limit: int = 50) -> List[Prediction]:
        """Fetch historical predictions scoped to authorized patient owner."""
        stmt = (
            select(Prediction)
            .where(Prediction.user_id == owner_user_id)
            .order_by(Prediction.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_by_user(self, user_id: str, skip: int = 0, limit: int = 50) -> List[Prediction]:
        """Alias for list_owned."""
        return self.list_owned(user_id, skip=skip, limit=limit)
