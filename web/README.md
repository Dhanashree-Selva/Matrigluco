# Matrigluco Web

React 19 + TypeScript frontend application for Matrigluco's maternal health tracking, clinical diabetes risk assessment, private medical report workflows, and educational AI assistant experiences.

> [!NOTE]
> **Medical Technology Notice**: Matrigluco is an academic clinical decision-support and patient-empowerment software prototype. It is not a certified diagnostic medical device and does not substitute for clinical medical judgment, professional consultation, or emergency care.

---

## 1. Quick Command Card (Clean Clone to Running Web App)

```powershell
# 1. Enter web frontend directory
cd web

# 2. Verify Node environment (Node 20+ LTS required)
node --version
npm --version

# 3. Install dependencies
npm install

# 4. Configure local environment
Copy-Item .env.example .env.local

# 5. Start FastAPI Backend first (in backend directory)
# cd ..\backend; python start.py

# 6. Start Vite development server
npm run dev
```

The web application will be accessible at `http://localhost:5173`.

---

## 2. Architecture & Data Flow

The Matrigluco web frontend operates as a Single-Page Application (SPA) communicating with the Matrigluco FastAPI backend through a typed API client layer.

```text
Browser (React 19 / DOM)
   │
   ▼
React Router v7 (Public / Protected / Onboarding Route Guards)
   │
   ▼
Feature Page View (e.g., Assessment, Tracking, Reports, Assistant)
   │
   ▼
Feature Custom Hook (e.g., useAssessmentFormState, useTrackingData)
   │
   ▼
TanStack Query / Mutation (Server State Cache & Invalidation)
   │
   ▼
Feature API Adapter (Typed DTO Request / Response Transformations)
   │
   ▼
Central Axios Client (src/api/client.js — Single-Flight Token Refresh & Auth Injection)
   │
   ▼
FastAPI Backend (/api/v1 REST Endpoints)
```

> [!IMPORTANT]
> **Architecture Boundary Rule**: The web client **never** connects directly to MySQL, Redis, Celery, or local filesystem storage. All data mutations, predictions, report extractions, and AI interactions are routed through authenticated FastAPI endpoints.

---

## 3. Technology Stack

| Layer | Technology | Version | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Framework** | React | 19.2+ | Component lifecycle, modern hooks, concurrent UI rendering |
| **Language** | TypeScript | 5.7+ | End-to-end static typing, schema contracts, DTO types |
| **Build Tooling** | Vite | 8.0+ | Lightning-fast HMR, Rolldown bundling, environment handling |
| **Styling** | Tailwind CSS v4 | 4.3+ | Modern CSS-first utility classes, theme tokens, CSS variables |
| **UI Primitives** | shadcn/ui | 4.18+ | Accessible Radix UI headless components styled for Matrigluco |
| **Iconography** | Hugeicons | 1.1+ | Canonical brand icon system (`@hugeicons/react`) |
| **Routing** | React Router | 7.15+ | Client-side routing, protected session guards, layout nesting |
| **Server State** | TanStack Query | 5.101+ | Async query caching, optimistic updates, garbage collection |
| **HTTP Client** | Axios | 1.16+ | Interceptors, Bearer token injection, single-flight refresh queue |
| **Form Handling** | React Hook Form | 7.85+ | Performant, uncontrolled form state management |
| **Validation** | Zod | 4.4+ | Schema validation contracts for forms, API responses, and env |
| **Motion** | Framer Motion | 12.40+ | Smooth, accessible transitions and micro-interactions |
| **Visualizations**| Recharts | 3.8+ | Responsive maternal health metric charts and trends |
| **Testing** | Vitest + RTL | 4.1+ | Unit, component, and integration testing with jsdom |

---

## 4. Repository Structure

```text
web/
├── public/                     # Static public assets
│   ├── brand/                  # Matrigluco SVG logo & OG social preview cover
│   └── favicon.svg             # Brand favicon mark
├── src/
│   ├── api/                    # Central HTTP client & domain API services
│   │   ├── client.js           # Axios instance with single-flight 401 refresh
│   │   └── errors.ts           # Normalized error types & HTTP status handlers
│   ├── app/                    # Application root, routing, and providers
│   │   ├── boundaries/         # Error boundaries & crash recovery surfaces
│   │   ├── router/             # Route configurations & protected route guards
│   │   ├── navigation.ts       # Navigation bar & Care Rail configuration
│   │   ├── providers.tsx       # AuthProvider, QueryClientProvider, ThemeProvider
│   │   └── App.tsx             # Root layout container
│   ├── auth/                   # Authentication context & session store
│   ├── components/             # Reusable UI components & shadcn primitives
│   │   ├── theme/              # Dark/light theme provider & toggle
│   │   └── ui/                 # Accessible shadcn/ui components (buttons, dialogs, etc.)
│   ├── features/               # Domain feature modules
│   │   ├── account/            # Profile, preferences, and security settings
│   │   ├── assessment/         # Clinical maternal diabetes risk evaluation workflow
│   │   ├── assistant/          # Offline AI assistant conversation workspace & Markdown
│   │   ├── auth/               # Sign-in, sign-up, password reset, and verify email
│   │   ├── consultations/      # Clinical appointments, prescriptions, and video room
│   │   ├── dashboard/          # Maternal health overview, Care Orbit, and beacons
│   │   ├── history/            # Longitudinal vitals timeline and trend logs
│   │   ├── marketing/          # Public landing page, features, and FAQ
│   │   ├── notifications/      # Care alerts, action horizons, and clinical reminders
│   │   └── tracking/           # Daily health metric logging (glucose, BP, weight, etc.)
│   ├── layouts/                # AppLayout, AuthLayout, MarketingLayout, OnboardingLayout
│   ├── lib/                    # Shared utility functions, formatters, and date helpers
│   ├── query/                  # QueryClient instance & centralized query key factories
│   ├── shared/                 # Shared brand marks, illustrations, and system states
│   ├── styles/                 # Tailwind CSS v4 index.css & design tokens
│   ├── test/                   # Vitest setup & testing utilities
│   ├── env.ts                  # Type-safe environment validation via Zod
│   ├── main.tsx                # React DOM root entrypoint
│   └── vite-env.d.ts           # Vite client environment type definitions
├── .env.example                # Safe environment configuration template
├── components.json             # shadcn/ui configuration
├── index.html                  # HTML entrypoint with Open Graph & SEO metadata
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler configuration
├── vercel.json                 # Vercel SPA routing rewrites configuration
├── vite.config.js              # Vite bundler & Rolldown chunking configuration
└── vitest.config.ts            # Vitest testing environment configuration
```

---

## 5. Prerequisites

1. **Node.js**: Version `20.0.0` or higher (Node 20, 22, or 24 LTS recommended).
2. **npm**: Version `9.0.0` or higher (bundled with Node.js).
3. **Backend**: Matrigluco FastAPI backend running locally or accessible on the network (`http://127.0.0.1:8000`).

---

## 6. Step-by-Step Setup Guide

### Windows (PowerShell)

```powershell
# 1. Clone repository and navigate to web directory
cd d:\Matrigluco\web

# 2. Verify Node and npm
node --version
npm --version

# 3. Install dependencies
npm install

# 4. Create local environment configuration
Copy-Item .env.example .env.local

# 5. Start development server
npm run dev
```

### Linux / macOS (Bash)

```bash
# 1. Navigate to web directory
cd web

# 2. Install dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env.local

# 4. Start development server
npm run dev
```

---

## 7. Environment Variables Configuration

Environment variables are validated at startup in `src/env.ts` using Zod schemas.

### Variable Reference

| Variable | Required | Default Value | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `http://127.0.0.1:8000/api/v1` | Base URL for FastAPI REST endpoints |
| `VITE_SITE_URL` | No | `http://localhost:5173` | Canonical site URL for SEO & Open Graph meta tags |
| `VITE_APP_ENV` | No | `development` | Runtime environment badge (`development`, `staging`, `production`) |

> [!WARNING]
> **Client-Side Security Rule**: All variables prefixed with `VITE_` are compiled directly into the JavaScript bundle and are visible to anyone inspecting the browser. **Never** put database passwords, JWT secret keys, API secret keys, or private encryption keys in frontend environment variables.

---

## 8. Connecting to FastAPI Backend

1. **Start Backend**: Follow the instructions in [backend/README.md](file:///d:/Matrigluco/backend/README.md) to launch FastAPI:
   ```powershell
   cd ..\backend
   python start.py
   ```
2. **Verify Backend Health**: Open `http://127.0.0.1:8000/api/v1/health/live` in your browser. You should receive `{"status": "healthy"}`.
3. **CORS Allowlist**: Ensure the backend `.env` includes `http://localhost:5173` in `FRONTEND_ORIGINS`.

---

## 9. Authentication & Token Management

* **Token Storage**: Access tokens and refresh tokens are stored in `localStorage` under `matrigluco_access_token` and `matrigluco_refresh_token`.
* **Single-Flight Token Refresh**: When an API request returns HTTP 401, the central Axios interceptor buffers concurrent requests in a queue, executes a single refresh call to `/api/v1/auth/refresh`, updates tokens, and replays pending requests.
* **Graceful Session Expiry**: If the refresh token is expired or invalid, the session is cleared, authentication listeners are notified, and the user is redirected to `/login` with an informative session-expired message.

---

## 10. Design System & Theming

* **Palette**: Care Pink primary (`#D94F7D` / `#F06F9D`), clean white light background, and deep zinc dark background (`#0D0B0C`).
* **Theme Switching**: Handled by `ThemeProvider` with system preference detection and persistent user choice in `localStorage` (`matrigluco-theme`).
* **shadcn/ui Customization**: Located in `src/components/ui/` and `src/shared/ui/`. Primitives are customized for Matrigluco's organic, calm maternal health design language.
* **Icon System**: Standardized on **Hugeicons** (`@hugeicons/react`). New UI components must use Hugeicons rather than Lucide or react-icons.

---

## 11. Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **`dev`** | `vite` | Starts local Vite development server on `http://localhost:5173` |
| **`dev:lan`** | `vite --host 0.0.0.0` | Starts Vite server bound to all network interfaces for LAN testing |
| **`build`** | `vite build` | Compiles optimized production bundle into `dist/` |
| **`preview`** | `vite preview` | Locally serves and validates the production `dist/` build |
| **`typecheck`** | `tsc --noEmit` | Runs full TypeScript static type checking across the project |
| **`lint`** | `eslint .` | Runs ESLint analysis across all source files |
| **`lint:fix`** | `eslint . --fix` | Automatically fixes auto-fixable ESLint issues |
| **`test`** | `vitest` | Starts interactive Vitest watcher for unit & component tests |
| **`test:run`** | `vitest run` | Runs one complete pass of all Vitest test suites (CI mode) |
| **`test:coverage`**| `vitest run --coverage`| Runs test suite and generates code coverage report |

---

## 12. Testing

Matrigluco web features a comprehensive test suite powered by **Vitest**, **React Testing Library**, and **jsdom**:

```powershell
# Run full test suite once
npm run test:run

# Run tests with interactive watch mode
npm run test

# Run tests matching a specific feature
npx vitest run src/features/assessment/
npx vitest run src/features/tracking/
```

---

## 13. Production Build & Deployment

### Build Verification

```powershell
# 1. Run type check
npm run typecheck

# 2. Run tests
npm run test:run

# 3. Create production bundle
npm run build

# 4. Preview build locally
npm run preview
```

### Vercel Deployment

1. **Import Repository**: Connect your Git repository to Vercel.
2. **Root Directory**: Set Root Directory to `web` (if in a monorepo).
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**: Configure the public API endpoint in Vercel:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
   VITE_SITE_URL=https://yourdomain.vercel.app
   VITE_APP_ENV=production
   ```
6. **SPA Rewrites**: `vercel.json` is already pre-configured to rewrite all routes to `/index.html` preventing 404 errors on deep-link refreshes:
   ```json
   {
     "framework": "vite",
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## 14. LAN & Mobile Testing

To test the web app from a mobile phone or another computer on the same Wi-Fi network:

1. **Discover Host LAN IP**:
   ```cmd
   ipconfig
   ```
   *(e.g., `192.168.31.44`)*
2. **Start Backend on LAN**:
   ```powershell
   cd ..\backend; python start.py --host 0.0.0.0
   ```
3. **Configure Frontend Environment**:
   In `web/.env.local`, set:
   ```env
   VITE_API_BASE_URL=http://192.168.31.44:8000/api/v1
   ```
4. **Start Frontend on LAN**:
   ```powershell
   npm run dev:lan
   ```
5. **Open on Mobile**: Browse to `http://192.168.31.44:5173` on your mobile browser.

---

## 15. Social Preview & Open Graph Metadata

* **Assets**: Configured in `public/brand/` (`matrigluco-mark.svg`, `og-cover.png`).
* **Tags**: Defined in `index.html` (`og:title`, `og:description`, `og:image`, `twitter:card`).
* **WhatsApp / Social Crawlers**: Social media crawlers (WhatsApp, Facebook, Twitter) require a publicly accessible HTTPS domain to fetch preview cards. Previews will not render for `localhost` URLs during local testing.

---

## 16. Troubleshooting

### 1. `API Connection Refused / Network Error`
* Verify that the FastAPI backend is running on `http://127.0.0.1:8000`.
* Check `VITE_API_BASE_URL` in `.env.local`.
* Verify that your browser can open `http://127.0.0.1:8000/api/v1/health/live`.

### 2. `CORS Error in Browser Console`
* The backend must include your frontend origin in its `FRONTEND_ORIGINS` setting.
* In `backend/.env`, set:
  ```env
  FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
  ```

### 3. `401 Unauthorized Loop`
* Ensure your refresh token has not been revoked. Clear browser storage by calling `localStorage.clear()` in DevTools or logging in again.

### 4. `Vercel 404 on Direct Page Refresh`
* Ensure `vercel.json` is present in the `web` root directory with the rewrite rule to `/index.html`.

### 5. `Tailwind Styles Not Applying`
* In Tailwind CSS v4, styling is driven by `@import "tailwindcss";` and `@theme` directives in `src/index.css` via `@tailwindcss/vite`. Do not create a legacy `tailwind.config.js`.

---

## 17. Security & Privacy Guidelines

* **Zero Backend Secrets**: Never place database passwords, private keys, or API tokens in the web repository.
* **No PHI Logging**: Do not output raw clinical biomarker values, pregnancy history, or health assessments to unmasked `console.log` statements in production code.
* **Authenticated Document Access**: Lab reports and PDFs are downloaded via authenticated backend endpoints (`/api/v1/files/{id}/download`); direct public static URLs are prohibited.
* **Production HTTPS**: Always enforce HTTPS in production environments to prevent credential sniffing and token interception.
