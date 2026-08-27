"""
Backward-compatibility adapter module for app.core.database.
Delegates to modular app.db.session and app.db.base.
"""

from app.db.base import Base
from app.db.session import engine, SessionLocal, get_db, check_database_health
from app.core.config import get_settings
from sqlalchemy import create_engine, text

settings = get_settings()


def init_database() -> None:
    """Ensure database exists on MySQL server."""
    try:
        server_url = (
            f"mysql+pymysql://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}@"
            f"{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/?charset=utf8mb4"
        )
        temp_engine = create_engine(server_url, isolation_level="AUTOCOMMIT")
        with temp_engine.connect() as conn:
            conn.execute(
                text(
                    f"CREATE DATABASE IF NOT EXISTS `{settings.MYSQL_DB}` "
                    f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
                )
            )
        temp_engine.dispose()
    except Exception:
        # Gracefully handle when MySQL is not currently up or using different host
        pass
