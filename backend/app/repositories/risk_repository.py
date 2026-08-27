import logging
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Any
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, joinedload

from app.repositories.base import BaseRepository
from app.models.risk_assessment import RiskAssessment, RiskAssessmentFeature

logger = logging.getLogger("matrigluco.repositories.risk")


class RiskRepository(BaseRepository[RiskAssessment]):
    """
    Data access repository for clinical RiskAssessment and RiskAssessmentFeature entities.
    Enforces strict user ownership scoping on all queries.
    """

    def __init__(self, db: Session):
        super().__init__(RiskAssessment, db)

    def create_assessment_with_features(
        self,
        assessment: RiskAssessment,
        features: List[RiskAssessmentFeature],
    ) -> RiskAssessment:
        """
        Atomically persists the parent RiskAssessment and its associated canonical feature rows.
        """
        self.db.add(assessment)
        self.db.flush()  # Flush to ensure assessment.id is generated for foreign keys

        for feat in features:
            feat.risk_assessment_id = assessment.id
            self.db.add(feat)

        self.db.flush()
        return assessment

    def get_owned_assessment_by_id(
        self,
        assessment_id: str,
        user_id: str,
        include_archived: bool = False,
    ) -> Optional[RiskAssessment]:
        """
        Fetches an assessment scoped strictly to user ownership, eagerly loading feature rows and model version.
        Supports lookup by either public_id or internal primary key.
        """
        stmt = (
            select(RiskAssessment)
            .options(
                joinedload(RiskAssessment.features),
                joinedload(RiskAssessment.model_version),
            )
            .where(
                or_(
                    RiskAssessment.public_id == str(assessment_id),
                    RiskAssessment.id == str(assessment_id),
                ),
                RiskAssessment.user_id == str(user_id),
            )
        )

        if not include_archived:
            stmt = stmt.where(RiskAssessment.archived_at.is_(None))

        return self.db.scalars(stmt).first()

    def list_owned_assessments(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
        risk_band: Optional[str] = None,
        source: Optional[str] = None,
        include_archived: bool = False,
    ) -> Tuple[List[RiskAssessment], int]:
        """
        Returns paginated risk assessments and total count belonging strictly to the user.
        """
        base_stmt = select(RiskAssessment).where(RiskAssessment.user_id == str(user_id))

        if not include_archived:
            base_stmt = base_stmt.where(RiskAssessment.archived_at.is_(None))

        if risk_band:
            base_stmt = base_stmt.where(RiskAssessment.risk_band == str(risk_band).lower())

        if source:
            base_stmt = base_stmt.where(RiskAssessment.source == str(source).lower())

        # Count total query
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        # Paginated items query
        items_stmt = (
            base_stmt.options(
                joinedload(RiskAssessment.model_version),
            )
            .order_by(RiskAssessment.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(self.db.scalars(items_stmt).all())

        return items, total

    def soft_delete_assessment(self, assessment: RiskAssessment) -> None:
        """
        Marks risk assessment as archived to preserve medical audit records.
        """
        assessment.archived_at = datetime.now(timezone.utc)
        assessment.assessment_status = "archived"
        self.db.add(assessment)

    def get_latest_for_user(self, user_id: str) -> Optional[RiskAssessment]:
        """Fetches the latest completed risk assessment for a given user."""
        stmt = (
            select(RiskAssessment)
            .where(
                RiskAssessment.user_id == str(user_id),
                RiskAssessment.archived_at.is_(None),
            )
            .order_by(RiskAssessment.created_at.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()
