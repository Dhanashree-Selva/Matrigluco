from datetime import datetime, date, timezone
from typing import Optional


def utc_now() -> datetime:
    """Returns current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def calculate_gestational_weeks(due_date: date, current_date: Optional[date] = None) -> int:
    """
    Calculates estimated gestational week assuming 40-week term from expected delivery date.
    """
    ref_date = current_date or date.today()
    days_remaining = (due_date - ref_date).days
    total_term_days = 280  # 40 weeks
    elapsed_days = max(0, total_term_days - days_remaining)
    return min(42, max(0, elapsed_days // 7))
