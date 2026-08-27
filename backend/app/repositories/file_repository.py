from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from app.models.file_asset import FileAsset


class FileRepository:
    """Repository managing durable metadata for private file assets."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, file_asset: FileAsset) -> FileAsset:
        self.db.add(file_asset)
        self.db.flush()
        return file_asset

    def get(self, file_id: str) -> Optional[FileAsset]:
        return self.db.query(FileAsset).filter(FileAsset.id == file_id).first()

    def get_owned_file(
        self, user_id: str, file_id: str, include_deleted: bool = False
    ) -> Optional[FileAsset]:
        stmt = select(FileAsset).where(
            and_(
                FileAsset.id == file_id,
                FileAsset.user_id == user_id,
            )
        )
        if not include_deleted:
            stmt = stmt.where(FileAsset.deleted_at.is_(None))
        return self.db.execute(stmt).scalar_one_or_none()

    def mark_deleted(self, file_id: str, user_id: Optional[str] = None) -> bool:
        stmt = select(FileAsset).where(FileAsset.id == file_id)
        if user_id:
            stmt = stmt.where(FileAsset.user_id == user_id)
        asset = self.db.execute(stmt).scalar_one_or_none()
        if not asset:
            return False
        asset.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
        self.db.flush()
        return True

    def list_cleanup_candidates(self, older_than: datetime, limit: int = 100) -> List[FileAsset]:
        stmt = (
            select(FileAsset)
            .where(
                and_(
                    FileAsset.deleted_at.is_not(None),
                    FileAsset.deleted_at <= older_than,
                )
            )
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())
