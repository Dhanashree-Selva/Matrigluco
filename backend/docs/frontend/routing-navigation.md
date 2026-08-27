# MatriGluco Routing & Navigation Model Governance

> **Platform Standard:** React Router + Care Orbit Navigation Language  
> **Route Protection:** Public (Guest-Only), Onboarding Gate, and Protected Session Shell  
> **Desktop Pattern:** Compact Care Rail (~190–210px)  
> **Mobile Pattern:** 5-Pillar Bottom Navigation + More Sheet  

---

## 1. Core Routing Principles & State Flow

```text
                    /
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
      Marketing              Auth
      (Public)             /login
                           /register
                           /forgot-password
                               │
                               ▼
                         Authenticated?
                          │          │
                         no         yes
                          │          │
                        Auth     Onboarding?
                                     │
                              ┌──────┴──────┐
                              ▼             ▼
                         incomplete       complete
                              │             │
                              ▼             ▼
                        /onboarding       /app
                                             │
                  ┌──────────────────────────┼───────────────┐
                  ▼                          ▼               ▼
             Dashboard                  Tracking         Assessment
                  │                          │               │
                  ├── History               ├── Reports     ├── result
                  ├── Assistant             └── ...         └── ...
                  ├── Consultations
                  ├── Notifications
                  └── Account
```

---

## 2. Route Contract Table

| Route | Surface | Access Requirement | Guard Component | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Marketing | Public | None | Product landing & educational trust strip |
| `/login` | Authentication | Guest only | `PublicRoute` | Patient authentication |
| `/register` | Authentication | Guest only | `PublicRoute` | Maternal registration |
| `/forgot-password` | Authentication | Guest only | `PublicRoute` | Password recovery trigger |
| `/onboarding` | Onboarding | Authenticated + Incomplete | `OnboardingRoute` | Profile setup & clinical consent |
| `/app` | Redirect | Protected | `ProtectedRoute` | Automatic redirect to `/app/dashboard` |
| `/app/dashboard` | Care Orbit | Protected | `ProtectedRoute` | Health Horizon overview |
| `/app/assessment` | Clinical AI | Protected | `ProtectedRoute` | 8-feature GDM risk assessment form |
| `/app/assessment/:id` | Clinical AI | Protected | `ProtectedRoute` | Persisted risk prediction result & factors |
| `/app/tracking` | Telemetry | Protected | `ProtectedRoute` | Glucose, BP, weight daily logs |
| `/app/history` | Telemetry | Protected | `ProtectedRoute` | Longitudinal timeline & chart trends |
| `/app/reports` | Documents | Protected | `ProtectedRoute` | Private OCR report repository |
| `/app/reports/:id` | Documents | Protected | `ProtectedRoute` | Authenticated report detail & extraction |
| `/app/assistant` | AI Assistant | Protected | `ProtectedRoute` | Local LLM clinical education chat |
| `/app/consultations` | Telehealth | Protected | `ProtectedRoute` | Obstetric appointment management |
| `/app/notifications`| Notifications| Protected | `ProtectedRoute` | Notification center & preferences |
| `/app/account/profile` | Settings | Protected | `ProtectedRoute` | Patient personal details |
| `/app/account/security`| Settings | Protected | `ProtectedRoute` | Passwords, sessions & security |
| `/app/account/preferences` | Settings | Protected | `ProtectedRoute` | Notification & theme settings |

---

## 3. Desktop Navigation — Care Rail

- **Width**: Compact ~190–210px desktop rail (no oversized enterprise dashboard sidebar).
- **Surface**: Soft pink selected surface (`var(--accent-soft)`), charcoal ink text, pink icon (`var(--primary)`).
- **Semantics**: Built using semantic `<nav>`, `<NavLink>`, and `aria-current="page"`.
- **Iconography**: Standardized via `@hugeicons/core-free-icons`.

---

## 4. Mobile Navigation Model

- **Core Destinations (5 Max)**: `Home`, `Track`, `Assess`, `Assistant`, `More`.
- **More Sheet**: Slide-out Care Orbit drawer exposing `History`, `Reports`, `Consultations`, `Notifications`, `Profile`, `Security`, and `Preferences`.
- **Touch Targets**: Minimum 44px interactive area with safe area padding (`pb-safe`).

---

## 5. Security & Redirect Governance

1. **Open Redirect Prevention**: `getSafeRedirectPath` sanitizes `state.from` return URLs, rejecting protocol-relative (`//`) or external schemas (`http:`, `javascript:`).
2. **Frontend vs Backend Security**: Route guards provide client UX boundaries; FastAPI `/api/v1` remains the authoritative security and ownership validator.
3. **Cache Isolation**: On session expiration or logout, `queryClient.clear()` purges server state across accounts.
