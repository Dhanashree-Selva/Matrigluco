"""
Transforms Supabase JSON exports to MySQL relational tabular schema.
"""

from pathlib import Path


def transform_data():
    in_dir = Path("storage/migration_export")
    out_dir = Path("storage/migration_transformed")
    out_dir.mkdir(parents=True, exist_ok=True)
    print("Transform pipeline configured. Ready to transform data from", in_dir, "to", out_dir)


if __name__ == "__main__":
    transform_data()
