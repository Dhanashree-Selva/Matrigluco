import time
import logging
from typing import Dict, Any
from sqlalchemy import text
from app.db.engine import engine

logger = logging.getLogger("matrigluco.db.healthcheck")


def check_database_connection() -> bool:
    """
    Executes a fast ping against the MySQL database.
    Returns True if reachable and responsive, False otherwise. Never leaks credentials.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.warning(f"Database healthcheck probe failed: {e}")
        return False


def check_database_health() -> Dict[str, Any]:
    """
    Detailed database health probe returning status and latency.
    """
    start_time = time.perf_counter()
    is_connected = check_database_connection()
    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
    return {
        "status": "healthy" if is_connected else "unhealthy",
        "latency_ms": latency_ms,
    }
