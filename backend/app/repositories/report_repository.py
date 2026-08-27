from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.medical_report import Report


class ReportRepository(BaseRepository[Report]):
    """
    SQLAlchemy repository for patient medical reports.
    Provides explicit ownership-scoped queries for patient medical privacy.
    """

    def __init__(self, db: Session):
        super().__init__(Report, db)

    def get_owned(self, report_id: str, owner_user_id: str) -> Optional[Report]:
        """Fetch single report with SQL ownership constraint."""
        stmt = select(Report).where(
            Report.id == report_id,
            Report.user_id == owner_user_id,
        )
        return self.db.scalars(stmt).first()

    def find_by_user_and_filename(self, user_id: str, file_name: str) -> Optional[Report]:
        """Fetch report with matching user_id and file_name for deduplication and reprocessing."""
        stmt = (
            select(Report)
            .where(Report.user_id == user_id, Report.file_name == file_name)
            .order_by(Report.created_at.desc())
        )
        return self.db.scalars(stmt).first()

    def list_owned(self, owner_user_id: str, skip: int = 0, limit: int = 50) -> List[Report]:
        """Fetch uploaded reports scoped strictly to authorized patient."""
        stmt = (
            select(Report)
            .where(Report.user_id == owner_user_id)
            .order_by(Report.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_by_user(self, user_id: str, skip: int = 0, limit: int = 50) -> List[Report]:
        """Alias for list_owned."""
        return self.list_owned(user_id, skip=skip, limit=limit)
