# MatriGluco Frontend Assessment & Inventory

> **Framework:** React 19.2 + Vite 8.0  
> **Styling & UI:** Tailwind CSS v4 + shadcn/ui + Lucide + Hugeicons  
> **State & Networking:** Axios + TanStack Query v5 + Application Auth Provider  
> **Target Architecture:** Modular Feature Architecture (`src/app/`, `src/auth/`, `src/query/`, `src/design-system/`, `src/features/`)  

---

## 1. Application Bootstrap & Routing Inventory

| File Path | Original Responsibility | Target Architecture |
| :--- | :--- | :--- |
| `src/main.jsx` | Mounts root DOM element with index CSS | `src/main.jsx` (Mounts `AppProviders` and `App`) |
| `src/App.jsx` | Monolithic state (splash, onboarding, session, routing) | Decomposed into `src/app/router.jsx`, `src/app/providers.jsx`, `src/auth/AuthProvider.jsx` |
| `src/components/Navigation.jsx` | Bottom/desktop navigation bar | `src/components/layout/Navigation.jsx` |
| `src/pages/onboarding/SplashScreen.jsx` | Splash animation | `src/features/onboarding/SplashScreen.jsx` |
| `src/pages/onboarding/Onboarding.jsx` | Onboarding tutorial carousel | `src/features/onboarding/Onboarding.jsx` |

---

## 2. Authentication & Session Management

| Domain Area | Current Pattern | Target Pattern |
| :--- | :--- | :--- |
| **Session Lifecycle** | Local token storage in `api/client.js` | Dedicated `src/auth/AuthProvider.jsx` with `useAuth` hook |
| **Token Refresh** | Single-flight 401 interceptor in Axios | Maintained centrally in `src/api/client.js` with zero page-level leakage |
| **Route Protection** | Inline `SessionGate` function in `App.jsx` | `src/auth/ProtectedRoute.jsx` & `src/auth/PublicOnlyRoute.jsx` |
| **Session Storage** | `localStorage` keys for access/refresh/user | Centralized in `src/auth/token-store.js` |

---

## 3. API Client & Server State Layer

| Feature | Current Method | Target Query / API Module |
| :--- | :--- | :--- |
| **Auth** | Direct `authApi.login/register/logout` | `src/api/modules/auth.api.js` |
| **Profile** | `profilesApi.getProfile/updateProfile` | `useQuery(queryKeys.profile.me())` |
| **Predictions** | `predictionsApi.createPrediction/getPredictions` | `useQuery(queryKeys.predictions.list())` + `useCreatePrediction` |
| **Health Telemetry** | `healthApi.getMeasurements/createMeasurement` | `useQuery(queryKeys.health.list())` + `useCreateMeasurement` |
| **Reports** | `reportsApi.uploadReport/getReports/download` | `useQuery(queryKeys.reports.list())` + `useUploadReport` |
| **Consultations** | `consultationsApi.getConsultations/create` | `useQuery(queryKeys.consultations.list())` + `useCreateConsultation` |
| **Notifications** | `notificationsApi.getNotifications/markRead` | `useQuery(queryKeys.notifications.list())` + `useMarkNotificationRead` |
| **Chatbot** | `chatbotApi.streamMessage/listConversations` | `useChatbotStream` + `useConversations` |

---

## 4. UI System & Design Tokens

- **Tailwind CSS v4 Configuration**: Seamlessly configured with `@theme` block in `src/index.css`.
- **shadcn/ui Primitives**: Installed in `src/components/ui/` (`avatar`, `badge`, `button`, `card`, `dialog`, `input`, `tabs`, etc.).
- **Common Product Composites**:
  - `RiskBadge`: High / Moderate / Low standardized indicator.
  - `MedicalDisclaimer`: Non-diagnostic research advisory.
  - `LoadingState`, `ErrorState`, `EmptyState`: Standardized feedback states.
  - `PageHeader`: Clean navigation header with back button.
- **Iconography**: Migrating product icons to `@hugeicons/react` while preserving Radix internal icons.

---

## 5. Incremental Migration Matrix

| Stage | Focus Area | Status |
| :--- | :--- | :---: |
| **Stage 1** | Application Shell & Routing (`src/app/`, `src/auth/`, `src/query/`) | **IN PROGRESS** |
| **Stage 2** | Design System & Common Composites (`src/design-system/`, `src/components/common/`) | **IN PROGRESS** |
| **Stage 3** | Authentication & Profile Feature (`src/features/auth/`, `src/features/profile/`) | Ready |
| **Stage 4** | Prediction & Clinical GDM Assessment (`src/features/prediction/`) | Ready |
| **Stage 5** | Health Tracking & Telemetry Dashboard (`src/features/tracking/`, `dashboard/`) | Ready |
| **Stage 6** | Reports & Private File Streaming (`src/features/reports/`) | Ready |
| **Stage 7** | Consultations & Notifications (`src/features/consultations/`, `notifications/`) | Ready |
| **Stage 8** | Local AI Assistant & SSE Streaming (`src/features/chatbot/`) | Ready |
