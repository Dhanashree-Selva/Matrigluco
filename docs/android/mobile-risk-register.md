# Mobile Risk Register

| Severity | Risk | Impact / evidence | Mitigation | Owner phase |
|---|---|---|---|---:|
| BLOCKER | Report workflow contract fragmented | `/files/upload`, `/reports`, service jobs exist but no confirmed atomic initiation response | backend contract returning report + job IDs and states | 10 |
| BLOCKER | Consultation product exceeds API | static web clinicians and UI room; backend only appointment strings/CRUD | omit unsupported UI; design provider/availability/communications API | 12 |
| HIGH | Placeholder Android identity | `com.example.myapplication` | choose durable namespace/application ID before modules | 1 |
| HIGH | Android compile target is Java 11 | Phase 1 baseline requires a reproducible JDK 17 toolchain | set Gradle Java/Kotlin toolchains to 17 and verify CI/local clean builds | 1 |
| HIGH | Kotlin version is not explicitly locked | AGP built-in Kotlin/toolchain compatibility must be verified, not assumed | validate stable candidate during Phase 1 sync/build and centralize it | 1 |
| HIGH | Consultation date/time has no timezone | separate date/time strings | add backend timezone/instant contract before reliable scheduling | 12 |
| HIGH | No FCM contract | no token registration/push dispatch found | backend push architecture; label inbox-only | 13 |
| HIGH | Missing export/deletion | no endpoints found | backend privacy lifecycle contracts | 14 |
| HIGH | SSE protocol is ad hoc | raw token events and text error sentinel | version structured SSE events/error/end semantics | 11 |
| HIGH | Sensitive local cache | maternal/health/report data | bounded Room policy, encryption decision, logout purge | 15/16 |
| MEDIUM | Pagination envelopes inconsistent | three page shapes plus limited arrays | DTO-specific remote keys/adapters | 4/9 |
| MEDIUM | Legacy public uploads mount | `/uploads` mounted in `main.py` | Android uses only authorized `/files/{id}/download`; audit deployment | 10/16 |
| MEDIUM | External OCR disclosure/consent | default `ocr_space`; service requires consent | expose real consent and processing state; never upload silently | 10 |
| MEDIUM | AI availability semantics | backend can fall back when GGUF missing | define capability/health response; show truthful runtime label | 11 |

No cookie-auth blocker exists: canonical refresh transport is JSON body. No unified-history blocker exists: `/history` is implemented.
