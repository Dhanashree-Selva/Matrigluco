# Android Implementation Roadmap

All phases are governed by `executive-implementation-strategy.md`, `android-architecture.md`, `ui-state-contract.md`, and `project-structure-contract.md`. The Phase 0 API, security, storage, paging and risk documents remain binding where they are more specific.

0. Repository audit and mobile contracts — this documentation set.
1. Foundation/build logic — namespace, JDK 17/Kotlin compatibility validation, convention plugins, modules, Hilt/KSP, variants, quality gates.
2. Care Orbit Native design system and selected Hugeicons.
3. App shell, Navigation and adaptive layouts.
4. Network, serialization and normalized errors.
5. Authentication and session restoration.
6. Onboarding/profile/pregnancy context.
7. Dashboard.
8. Assessment and result.
9. Tracking and unified history.
10. Reports/document intelligence (blocked on workflow contract).
11. Assistant.
12. Consultations (restricted to supported records until backend expansion).
13. Notifications (in-app first; push blocked).
14. Account/security/preferences.
15. Offline cache/sync/WorkManager.
16. Accessibility, performance and security hardening.
17. Testing, release build and APK delivery.

Phase 1 may start after product chooses the durable namespace/application ID and environment naming. It must not implement feature screens.
