# Web to Android Feature Parity

| Web concept | Android-native translation | Contract reality |
|---|---|---|
| Sidebar/top navigation | phone bottom nav; tablet rail/panes | Phase 3 |
| Dashboard cards | adaptive summaries and truthful states | dashboard API supported |
| Assessment studio | step flow with saved state | supported eight-feature API |
| Tracking charts | RecyclerView/charts with offline cache | supported |
| Document upload | system document picker + WorkManager | private upload supported; orchestration gap |
| Assistant | conversation list + POST/SSE | supported with protocol caveats |
| Clinician directory/availability | omit until backend exists | web uses static clinician data |
| Video/chat/prescriptions | omit | UI-only web concepts, no API |
| Notification center | native list; push only after FCM | durable inbox supported, push missing |
| Account/privacy | native settings/detail screens | deletion/export missing |

Web CSS/layout and browser storage are not copied. Product language and hierarchy may be reused after backend verification.
