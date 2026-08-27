import os
import sys
import uuid

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import inspect, text
from app.db.session import engine
from app.db.base import Base
import app.models  # load all models

def sync_schema():
    insp = inspect(engine)
    existing_tables = insp.get_table_names()

    with engine.begin() as conn:
        for table_name, table in Base.metadata.tables.items():
            if table_name in existing_tables:
                existing_cols = {c['name']: c for c in insp.get_columns(table_name)}
                model_col_names = {col.name for col in table.columns}

                # 1. Add any missing columns declared in models
                for col in table.columns:
                    if col.name not in existing_cols:
                        col_type = col.type.compile(engine.dialect)
                        type_str = str(col_type).upper()
                        nullable_clause = "NULL"
                        if not col.nullable:
                            if any(t in type_str for t in ["INT", "BIGINT", "SMALLINT", "TINYINT", "BOOL"]):
                                nullable_clause = "NOT NULL DEFAULT 0"
                            elif any(t in type_str for t in ["FLOAT", "DOUBLE", "DECIMAL", "NUMERIC"]):
                                nullable_clause = "NOT NULL DEFAULT 0.0"
                            elif "DATETIME" in type_str or "TIMESTAMP" in type_str:
                                nullable_clause = "NOT NULL DEFAULT CURRENT_TIMESTAMP"
                            else:
                                nullable_clause = "NOT NULL DEFAULT ''"

                        sql = f"ALTER TABLE `{table_name}` ADD COLUMN `{col.name}` {col_type} {nullable_clause}"
                        print(f"Adding missing column: {sql}")
                        conn.execute(text(sql))

                        # Populate unique uuid if public_id was just added
                        if col.name == "public_id":
                            rows = conn.execute(text(f"SELECT id FROM `{table_name}`")).fetchall()
                            for r in rows:
                                uid = r[0]
                                new_pub = str(uuid.uuid4())
                                conn.execute(
                                    text(f"UPDATE `{table_name}` SET public_id = :pub WHERE id = :id"),
                                    {"pub": new_pub, "id": uid}
                                )

                        # Populate normalized email if added
                        if col.name == "email_normalized":
                            conn.execute(text(f"UPDATE `{table_name}` SET email_normalized = LOWER(TRIM(email)) WHERE email IS NOT NULL"))

                # 2. Relax legacy NOT NULL / UNIQUE columns that are no longer in active models
                for col_name, col_meta in existing_cols.items():
                    if col_name not in model_col_names and not col_meta.get("nullable", True) and col_name != "id":
                        try:
                            # Drop any unique index on this legacy column
                            for idx in insp.get_indexes(table_name):
                                if col_name in idx.get("column_names", []) and idx.get("unique"):
                                    conn.execute(text(f"ALTER TABLE `{table_name}` DROP INDEX `{idx['name']}`"))
                                    print(f"Dropped legacy unique index {idx['name']} on `{table_name}`.`{col_name}`")
                            # Make the column nullable
                            conn.execute(text(f"ALTER TABLE `{table_name}` MODIFY `{col_name}` {col_meta['type']} NULL"))
                            print(f"Made legacy column `{table_name}`.`{col_name}` NULLABLE")
                        except Exception as ex:
                            print(f"Notice on relaxing `{table_name}`.`{col_name}`: {ex}")

    print("All tables and columns successfully synchronized with SQLAlchemy models!")

if __name__ == "__main__":
    sync_schema()
