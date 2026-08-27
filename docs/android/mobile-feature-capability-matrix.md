# Mobile Feature Capability Matrix

| Mobile capability | Support | Endpoint(s) | Android phase | Gap |
|---|---|---|---:|---|
| Register/login/refresh/logout/current user | SUPPORTED | `/auth/*` | 5 | logout without refresh token does not revoke |
| Active sessions/revocation/password flows | SUPPORTED | `/auth/sessions*`, password routes | 14 | none material |
| Onboarding/profile/pregnancy | SUPPORTED | `/profiles/me`, `/pregnancies` | 6 | namespace/UI not built |
| Assessment create/detail/history/delete | SUPPORTED | `/predictions` | 8 | collect responsible eight-feature input |
| Health measurement CRUD | SUPPORTED | `/health-measurements` | 9 | metric/unit enum enforced mainly in service |
| Unified history | SUPPORTED | `/history` | 9 | multi-source pagination implemented server-side |
| Private file upload/download | SUPPORTED | `/files` | 10 | SAF integration is Android work |
| Report record/review/PDF | PARTIAL | `/reports` | 10 | upload→record→job orchestration not exposed coherently |
| Report processing status | PARTIAL | `/tasks` | 10 | job creation/link returned by report flow is unclear |
| Provider discovery/availability | MISSING | none | 12 | web clinician data is static |
| Consultation booking record CRUD | PARTIAL | `/consultations` | 12 | client supplies doctor/date/status strings |
| Consultation chat/video/prescriptions | MISSING | none | 12 | no real-time or clinical records contracts |
| Durable notifications/preferences | SUPPORTED | `/notifications` | 13 | none |
| Android push | MISSING | none | 13 | no FCM token/dispatch contract |
| Assistant conversations/messages | SUPPORTED | `/chatbot` | 11 | sources are unstructured strings |
| Assistant streaming | PARTIAL | SSE stream | 11 | ad hoc error sentinel; reconnection/event IDs absent |
| Assistant context consent | PARTIAL | request boolean | 11 | no dedicated mobile consent endpoint found |
| Profile/preferences | SUPPORTED | profile + notification prefs | 14 | theme/local prefs remain local |
| Data export/account deletion | MISSING | none | 14 | web UI intent is not backend support |

Values are backend-derived: **SUPPORTED**, **PARTIAL**, **MISSING**, **UNCLEAR**, **NOT APPLICABLE**.
