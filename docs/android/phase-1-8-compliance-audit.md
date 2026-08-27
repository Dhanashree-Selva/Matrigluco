# Android Phases 1–8 Compliance Audit

Audit date: 2026-08-21. Scope: `frontend/` plus the canonical Android documents in `docs/android/`.

| Phase | Status | Evidence | Deliberate boundary |
|---|---|---|---|
| 1 — repository/API baseline | Implemented | `current-mobile-readiness-audit.md`, `mobile-api-contract.md`, capability, auth, measurement, storage, risk and roadmap documents | Contracts must be refreshed whenever FastAPI routes change. |
| 2 — implementation baseline | Implemented | Kotlin/XML policy, minSdk 24, native interaction, offline, testing and release rules in `executive-implementation-strategy.md` | Dependency upgrades remain stability-gated. |
| 3 — architecture contract | Implemented | `android-architecture.md`, `ui-state-contract.md`, feature-first modules, DTO/domain/entity separation and repository boundaries | Only implemented screens have runtime state classes; future features must add their own states. |
| 4 — project structure | Implemented | `:app`, shared core modules, `:feature:startup`, `:feature:auth`, convention build logic and `project-structure-contract.md` | Empty future feature modules are intentionally not generated. |
| 5 — Gradle/build conventions | Implemented | Version catalog, application/library/Hilt conventions, debug/staging/release environments, centralized API URLs and release URL guard | Room uses the documented stable 2.8.4 fallback. |
| 6 — Care Orbit design system | Implemented | Semantic light/dark tokens and Orbit components including button, top bar, input, metric surface, status chip, timeline, empty state, bottom sheet, icon button and skeleton | Device screenshot/font-scale/RTL QA still requires emulator or hardware. |
| 7 — Hugeicons | Implemented | Controlled VectorDrawables in `:core:designsystem`, semantic `OrbitIcon`, conversion/validation scripts and `icon-map.md` | Launcher and notification small icons remain separate platform assets by design. |
| 8 — navigation/application shell | Implemented | One `MainActivity`, XML `NavHostFragment`, separated startup/auth/onboarding/protected graphs, compact bottom navigation, medium/expanded rail, destination chrome registry and session-aware routing | Unsupported product features show truthful unavailable states; deep links are not registered until their ownership contracts exist. |

## Corrections made during this audit

- Removed remaining `com.example.myapplication` production/test package paths.
- Added `OrbitSkeleton` with reduced-motion behavior.
- Replaced the platform list selector in primary navigation with Care Orbit resources.
- Added configuration-change re-rendering for bottom-bar/rail adaptation.
- Added a pure shell visibility policy and compact/medium/expanded unit tests.
- Added Notifications to the phone More destination.
- Moved login validation strings out of the ViewModel and removed its Android framework email dependency.
- Replaced generated Android launcher artwork with Matrigluco Care Orbit vector/adaptive artwork.
- Renamed the application theme to `Theme.Matrigluco.App`.

## Truthful remaining constraints

- Registration, password recovery, onboarding completion, and secondary health feature screens are not fabricated where complete backend/product UI contracts have not yet been implemented.
- Multi-device visual, TalkBack, predictive-back gesture, RTL, and large-font checks require an emulator/device test pass.
- No protected deep link is exposed until resource ownership and pending-destination behavior are implemented end to end.
- Top-level navigation uses Navigation Component save/restore state; feature-specific nested stacks will be exercised when those feature graphs become real.
