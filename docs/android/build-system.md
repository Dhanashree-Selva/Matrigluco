# Android Build System

**Implemented:** 2026-08-21  
**Android root:** `frontend/`

## Toolchain decision

| Component | Selected | Evidence/decision |
|---|---|---|
| AGP | 9.3.1 | existing stable project baseline |
| Gradle wrapper | 9.5.0 | required AGP 9.3 baseline |
| Runtime JDK | minimum 17; verified with Android Studio JBR 21 | Android compilation targets Java 17 |
| Kotlin | AGP built-in Kotlin 2.3.20 | `org.jetbrains.kotlin.android` is intentionally absent |
| Kotlin serialization plugin | 2.3.20 | aligned to built-in compiler line and verified by build |
| KSP | 2.3.10 (KSP2) | stable, AGP 9/Kotlin 2.3 compatible, verified by Hilt generation |
| Hilt | 2.60.1 | 2.57.1 failed on AGP 9 legacy BaseExtension; 2.60.1 supports AGP 9 and builds |

Kotlin 2.4.10 decision: **NOT USED — incompatible/unverified with AGP 9.3.x**. No compatibility warnings were suppressed.

## Version catalog and conventions

`frontend/gradle/libs.versions.toml` centralizes plugins and libraries. Dynamic versions are forbidden. The included `build-logic` build provides:

- `matrigluco.android.application`: application plugin, SDK 36.1/target 36/min 24, Java 17, ViewBinding and test defaults.
- `matrigluco.android.library`: library equivalent without application-only identity/versioning.
- `matrigluco.android.hilt`: AGP-9-compatible Hilt plugin, KSP2 and compiler dependencies.

Feature/testing/Room conventions are deliberately deferred until repeated configuration or a real Room feature exists. This avoids convention-plugin theater.

## Variants and configuration

The app implements debug, staging and release build types. API URL precedence is Gradle property → same-named environment variable → a safe variant-specific default. Debug defaults to Android emulator loopback. Staging defaults to a non-routable `.invalid` value. Release has no fallback and `preReleaseBuild` validates presence, HTTPS and trailing slash.

Generated fields are non-secret `BuildConfig.APP_ENV`, `BuildConfig.API_BASE_URL`, and normal `BuildConfig.DEBUG`. `AppConfigModule` maps them to the `core:common` `AppConfig` contract so feature modules never import app BuildConfig.

Debug alone overrides cleartext traffic for local development. Main/staging/release deny cleartext through the manifest and network security configuration.

## Security, logging and signing

BuildConfig never contains backend credentials or signing secrets. Keystores/signing property files and local configuration are ignored. Release signing remains externally supplied and is not fabricated in this phase. Network logging behavior belongs in `core:network`; any later interceptor must redact Authorization/Cookie/Set-Cookie, avoid medical bodies, use BASIC/HEADERS at most in debug, and be disabled in release.

## Dependency policy

The JSON stack is Kotlinx Serialization with Square `converter-kotlinx-serialization`; Gson and deprecated Jake Wharton converters are absent. Compose and DataBinding are absent. KSP is used; kapt is absent. Repositories are restricted to Google, Maven Central and the plugin portal where plugin resolution needs it.

## Release behavior

Release optimization remains disabled until Retrofit, serialization, Hilt, Navigation and future Room keep behavior is verified. Release API validation is intentionally allowed to fail early when production configuration is absent. A successful signed release additionally requires external signing configuration, which remains future release work.
