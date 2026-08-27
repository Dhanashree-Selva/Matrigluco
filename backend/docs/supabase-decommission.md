# Supabase Decommission & Rollback Policy

> **Authoritative Persistence:** MySQL 8.0+ / MariaDB 10.5+  
> **Private Storage:** `storage/private/` Local / S3 Encrypted Volume  
> **Decommission Status:** Runtime Cutover Complete — Supabase Removed  

---

## 1. Decommission Checklist

- [x] **Audit Runtime Imports**: Verified 0 occurrences of `@supabase/supabase-js` or `supabaseClient.js` in `web/src/`.
- [x] **Package Elimination**: Uninstalled `@supabase/supabase-js` and updated `package-lock.json`.
- [x] **Environment Variable Purge**: Removed `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `web/.env.example`, `web/.env`, and `web/.env.production`.
- [x] **Client-Side Ownership ID Elimination**: Removed all `user_id` request body fields; identity is derived exclusively from JWT actor claims.
- [x] **Private Storage Cutover**: Eliminated all public Supabase storage CDN URLs; files are streamed exclusively via authenticated backend endpoints.

---

## 2. Controlled Rollback Runbook

### Rollback Triggers
- Severe database migration failure affecting core authentication or medical records.
- Critical unrecoverable contract mismatch preventing access to historical predictions.

### Rollback Procedure
1. Re-deploy previous frontend release bundle containing legacy adapter.
2. Restore MySQL snapshot to pre-migration baseline.
3. Switch DNS / environment endpoints to legacy endpoints.

> [!NOTE]
> **Post-Cutover Write Notice**: Any new users, health measurements, or predictions created in MySQL after cutover must be exported prior to any disaster-recovery restore.
