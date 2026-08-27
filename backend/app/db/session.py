import logging
from typing import Generator
from sqlalchemy.orm import sessionmaker, Session
from app.db.engine import engine
from app.db.healthcheck import check_database_connection

logger = logging.getLogger("matrigluco.db.session")

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI Request-scoped database session dependency.
    Yields active session, rolls back on uncaught exception, and safely closes.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as exc:
        logger.error(f"Database session rollback due to exception: {exc}")
        db.rollback()
        raise
    finally:
        db.close()


def check_database_health() -> bool:
    """Probes database connectivity."""
    return check_database_connection()
