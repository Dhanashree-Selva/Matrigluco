# ADR 001: MatriGluco Frontend Technology Platform & Governance

- **Status:** Accepted
- **Deciders:** Architecture Team, Frontend Platform Team, Healthcare Security Team
- **Date:** 2026-08-17

---

## 1. Context and Problem Statement
The legacy MatriGluco application relied on direct client-side Supabase authentication, database queries, and storage CDN URLs mixed directly within monolithic page components. To modernize the application safely without breaking active clinical features, we required a single, coherent, type-safe frontend platform with strict dependency governance.

---

## 2. Decision Drivers
- **Clinical & ML Safety:** Eliminate hidden zero defaults and strictly enforce canonical ML prediction contracts.
- **Single Responsibility:** Prevent overlapping libraries (e.g. no SWR + React Query, no Formik + RHF).
- **Incremental TypeScript Adoption:** Support coexistence of `.ts`/`.tsx` with existing `.jsx` throughout feature migration.
- **Owned Accessible UI:** Use shadcn/ui primitives composed into MatriGluco product cards and feedback states.
- **Standardized Iconography:** Standardize new UI on Hugeicons (`@hugeicons/react`).

---

## 3. Considered Options
1. **Full Rewrite (Next.js / Remix):** Rejected due to high risk of feature regression and unnecessary framework churn.
2. **Current Monolithic React + Supabase:** Rejected due to lack of type safety, direct DB coupling, and architectural drift.
3. **Incremental Modular React 19 + TypeScript + Vite 8 + TanStack Query + FastAPI (Selected):** Preserves working application runtime while providing enterprise quality gates.

---

## 4. Consequences
- **Positive:**
  - Strict type checking via `tsc --noEmit` and Vitest unit testing.
  - Zero client-controlled ownership IDs; JWT actor claims derive identity.
  - Clean feature isolation (`src/features/*`).
- **Negative / Trade-offs:**
  - Temporary coexistence of `.jsx` and `.tsx` until all legacy pages are migrated feature by feature.
