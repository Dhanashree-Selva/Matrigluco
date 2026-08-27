from typing import Generic, TypeVar, Type, Optional, List, Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic Repository base providing standard persistence operations
    using SQLAlchemy 2.0 select and scalar execution.
    Supports both instance-bound Session (`self.db`) and method-injected Session (`db`).
    """

    def __init__(self, model: Type[ModelType], db: Optional[Session] = None):
        self.model = model
        self.db = db

    def _resolve_db(self, db: Optional[Session]) -> Session:
        session = db or self.db
        if session is None:
            raise ValueError("No active database session provided to repository operation.")
        return session

    def get_by_id(self, id: Any, db: Optional[Session] = None) -> Optional[ModelType]:
        """Fetch a single record by primary key."""
        session = self._resolve_db(db)
        return session.get(self.model, id)

    def get_all(
        self, skip: int = 0, limit: int = 100, db: Optional[Session] = None
    ) -> List[ModelType]:
        """Fetch all records with offset pagination."""
        session = self._resolve_db(db)
        stmt = select(self.model).offset(skip).limit(limit)
        return list(session.scalars(stmt).all())

    def get_multi(
        self, db: Optional[Session] = None, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """Fetch multiple records with offset pagination (alias)."""
        return self.get_all(skip=skip, limit=limit, db=db)

    def create(self, obj_in: ModelType, db: Optional[Session] = None) -> ModelType:
        """Persist a new entity instance."""
        session = self._resolve_db(db)
        session.add(obj_in)
        session.commit()
        session.refresh(obj_in)
        return obj_in

    def update(
        self, db_obj: ModelType, obj_in: Dict[str, Any], db: Optional[Session] = None
    ) -> ModelType:
        """Updates attributes of existing entity instance."""
        session = self._resolve_db(db)
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def delete(self, id: Any, db: Optional[Session] = None) -> Optional[ModelType]:
        """Delete an entity by primary key."""
        session = self._resolve_db(db)
        obj = session.get(self.model, id)
        if obj:
            session.delete(obj)
            session.commit()
        return obj
