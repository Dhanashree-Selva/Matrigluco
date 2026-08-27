# Matrigluco Android Executive Implementation Strategy

**Status:** Canonical baseline  
**Established:** 2026-08-21  
**Applies to:** Phase 1 onward  
**Contract authority:** `mobile-api-contract.md`

## 1. Product strategy

Matrigluco Android is a native Android product, not the website reproduced screen-for-screen in Views. It preserves product language, Care Orbit identity, information architecture, medical-safety boundaries, privacy model and confirmed FastAPI semantics while adopting native interaction patterns.

A returning user should recognize Care Orbit geometry, restrained Care Pink, Matrigluco typography and concepts such as Health Horizon, Temporal Lens, Health Chronicle and Care Dialogue. The interaction model must nevertheless be Android-native: fast startup, predictable system and predictive back, one-handed navigation, system document selection, lifecycle-aware behavior, reliable offline states, process-resilient deferred work, TalkBack support, and adaptive phone/tablet layouts.

The app must never become a WebView shell, compressed desktop sidebar, browser-form port, or stock Material interface with branding applied superficially.

## 2. Fixed engineering direction

- Kotlin with XML Views, Fragments and ViewBinding; no Compose, DataBinding business expressions or product WebView.
- Single `MainActivity` with `NavHostFragment` and XML graphs for authentication, onboarding and authenticated areas.
- Feature-first multi-module architecture with meaningful modules only.
- Hilt with KSP and compile-time graph validation.
- Retrofit + OkHttp + Kotlinx Serialization using Square's converter.
- FastAPI `/api/v1` as the only mobile backend; no direct MySQL, Redis, Celery, Supabase, ML artifact or GGUF access.
- Room as a bounded user-scoped cache; DataStore for small non-sensitive state; Keystore-backed handling for session secrets.
- WorkManager only for reliable deferred work; Paging only for server-paginated, sufficiently large collections.
- Selected Hugeicons converted through a reviewed SVG-to-VectorDrawable pipeline.
- Loading, empty, offline, unavailable, error, processing and content states are explicit. No runtime dummy health data or fabricated success.
- Accessibility, security, privacy and testing are requirements in every phase.

## 3. Dependency direction

```text
Fragment / XML
    → ViewModel state and effects
    → Use case / repository interface
    → Repository implementation
    → Remote or approved local data source
    → Retrofit / Room / DataStore
```

Fragments do not call Retrofit, parse JSON, perform SQL, manage refresh tokens or contain domain rules. ViewModels do not know `View` objects. Repositories do not depend on Activities or Fragments. Network DTOs are deliberately mapped before reaching UI models.

The Views/Fragment stack is a deliberate product constraint. Because that stack is maintenance-oriented, networking, repositories, domain models, use cases, validation, session behavior, sync and paging must remain independent of View implementations so a future UI migration does not rewrite core logic.

The enforceable layer, state, authority, mutation, effect, module/source layout and test rules are defined in `android-architecture.md`, `ui-state-contract.md`, and `project-structure-contract.md`. Those documents govern implementation when this executive summary is less specific.

## 4. Platform and toolchain policy

| Area | Baseline candidate | Rule |
|---|---|---|
| Minimum SDK | 24 | Do not lower without a device/dependency/test impact review |
| Target/compile SDK | repository-verified stable platform | Upgrade deliberately and test behavior changes |
| AGP | stable 9.3.x | Current repository uses 9.3.1 |
| Gradle | 9.5.0 | Current wrapper baseline |
| JDK | 17 | Phase 1 must replace the current Java 11 compile target and document toolchain provisioning |
| Kotlin | latest stable verified compatible with selected AGP | Candidate 2.3.21; lock only after real sync/build validation |
| Fragment | 1.8.9 | Stable XML/Fragment baseline |
| Navigation | 2.9.8 | Stable graph/Fragment baseline with predictive-back fixes |
| Paging | 3.5.1 | Only for endpoints approved in `paging-decision.md` |

All versions live in `gradle/libs.versions.toml`. No dynamic versions (`+`, `latest.release`, `9.3.+`) and no alpha/beta/RC adoption merely for recency. Stable upgrades occur in tested batches. Version tables are candidates, not permanent pins.

## 5. Library baseline

- UI: XML resources, ViewBinding, AppCompat/Fragment/Navigation, styled through Care Orbit Native.
- DI/code generation: Hilt and KSP versions verified together with the chosen Kotlin/AGP toolchain.
- Network: Retrofit 3.x, compatible OkHttp 5.x, Kotlinx Serialization JSON and Square converter-kotlinx-serialization.
- Images: Coil 3.x for `ImageView` only where remote/local imagery is justified.
- Persistence: compatible stable Room and DataStore versions, scoped by the Phase 0 decisions.
- Background: stable WorkManager.
- Tests: JUnit, coroutine test, Turbine, MockWebServer, Robolectric, AndroidX Test and Espresso.
- Performance: Macrobenchmark and Baseline Profiles during hardening, not as prototype decoration.
- AndroidX Credentials: optional only after backend support for passkeys or federated credentials exists.

## 6. Android-native translation

| Web intent | Native translation |
|---|---|
| Care Rail | phone bottom navigation; compact tablet navigation rail |
| Popover/HoverCard | explicit info action, dialog, bottom sheet or inline explanation |
| Context rail | tablet secondary pane or phone bottom sheet |
| File input | Activity Result system document picker |
| Temporary toast system | Snackbar when transient feedback is appropriate |
| Desktop panels | resource-qualified adaptive phone/tablet composition |

The authenticated phone destinations are Home, Track, Assess, Assistant and More. Tablet layouts use a compact navigation rail. A giant drawer is not the primary experience. Navigation Component owns normal back-stack behavior; only genuinely destructive or unsaved workflows intercept back.

## 7. State, storage and background rules

Offline means cached previously loaded data with a clear staleness signal, safe navigation, or explicitly queued idempotent work. It never means local prediction inference, invented current health state, a pretend upload, or an assumed successful mutation.

Room stores only approved structured cache and sync metadata. DataStore stores theme and small non-sensitive preferences. Keystore-backed mechanisms protect refresh/session material. Every sensitive cache defines owner, source timestamp, expiry/refresh and logout clearing. FastAPI/MySQL remains authoritative.

WorkManager is appropriate for authorized upload retry, bounded sync, cache cleanup and notification preparation. It is not appropriate for live Assistant streaming, video, presence or second-by-second polling.

## 8. Care Orbit Native and accessibility

Android components may be used underneath but must be expressed through the Care Orbit token/component system: premium, maternal, calm, clinical, warm, modern, high-contrast and restrained in its use of Care Pink. Default Material blue and generic dashboard styling are not acceptable final presentation.

Every component and phase accounts for TalkBack semantics, scalable text, at least 48dp touch targets, deterministic focus, non-color-only status, keyboard access where relevant, reduced motion, light/dark contrast, predictive back, and adaptive tablet accessibility.

## 9. Privacy and truthful behavior

Never log passwords, tokens, authorization headers, medical bodies, assessment vectors, OCR content or Assistant conversations. Never store tokens in plain SharedPreferences or backend secrets in the APK. Never persist medical data merely because a DTO exists.

The Android UI exposes only capabilities confirmed in `mobile-feature-capability-matrix.md`. Missing API support remains unavailable; it is never replaced by fake doctors, reports, predictions, notifications, Assistant answers or consultation behavior.

## 10. Testing and release philosophy

Tests accompany each layer: DTO serialization tests with network contracts, repository tests with repositories, ViewModel state/effect tests with state holders, validation tests with forms, navigation tests with graph changes, and Paging/load-state tests with paged features.

Success is not merely an APK. The release baseline is a reproducible clean build, documented local/staging/release configuration, safe secret handling, tested architecture, installable artifacts and no one-machine-only assumptions.

## 11. Definition of done

All subsequent phases treat the following as fixed unless the user explicitly changes them: native Kotlin; XML Views; ViewBinding; single Activity; Fragments and Navigation; Care Orbit Native; FastAPI-only access; Retrofit/OkHttp/Kotlinx Serialization; Hilt/KSP; bounded Room/DataStore/WorkManager/Paging; selected Hugeicons vectors; phone bottom navigation; tablet navigation rail; truthful states; and accessibility/privacy/security-first architecture.
