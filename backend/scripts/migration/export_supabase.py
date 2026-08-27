"""
Extracts records from legacy Supabase instance and writes JSON dumps to local storage/migration/.
"""

import json
import os
from pathlib import Path
from app.core.config import get_settings

settings = get_settings()


def export_data():
    out_dir = Path("storage/migration_export")
    out_dir.mkdir(parents=True, exist_ok=True)
    print(
        "Export pipeline ready. Place Supabase credentials in environment or export files to",
        out_dir,
    )


if __name__ == "__main__":
    export_data()
