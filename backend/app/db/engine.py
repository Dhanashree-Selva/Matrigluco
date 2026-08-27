import logging
from sqlalchemy import create_engine, Engine
from app.core.config import get_settings

logger = logging.getLogger("matrigluco.db.engine")
settings = get_settings()


def _validate_db_user_least_privilege(url_str: str, env: str) -> None:
    """Verifies that the application does not execute with root database privileges in production."""
    # Check if database user in URL is 'root'
    is_root = "://root:" in url_str or "://root@" in url_str
    if is_root:
        if env == "production":
            raise RuntimeError(
                "Security Policy Violation: MatriGluco cannot run with MySQL 'root' user in production. "
                "Configure a least-privilege 'matrigluco_app' user account."
            )
        else:
            logger.warning(
                "Security Notice: Database is configured with 'root' user. "
                "Use a dedicated least-privilege 'matrigluco_app' account for non-development deployments."
            )


_validate_db_user_least_privilege(settings.sync_database_url, settings.APP_ENV)

engine: Engine = create_engine(
    settings.sync_database_url,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    future=True,
)


def dispose_engine() -> None:
    """Safely disposes all active database connections upon shutdown."""
    try:
        engine.dispose()
        logger.info("Database connection engine disposed cleanly.")
    except Exception as e:
        logger.error(f"Error disposing database engine: {e}")
