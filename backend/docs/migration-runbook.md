# MatriGluco Supabase to MySQL Migration Runbook

## Migration Workflow
1. **Export Legacy Supabase Data**:
   ```bash
   python scripts/migration/export_supabase.py
   ```
2. **Transform Schemas**:
   ```bash
   python scripts/migration/transform_export.py
   ```
3. **Apply Database Migrations on MySQL**:
   ```bash
   alembic upgrade head
   ```
4. **Import Records to MySQL**:
   ```bash
   python scripts/migration/import_mysql.py
   ```
5. **Migrate Uploaded Storage Files**:
   ```bash
   python scripts/migration/migrate_storage.py
   ```
6. **Verify Record Parity**:
   ```bash
   python scripts/migration/verify_migration.py
   ```
