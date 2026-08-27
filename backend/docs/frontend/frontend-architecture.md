# MatriGluco Frontend Architecture & Platform Governance

> **Architecture Standard:** Care Orbit Modular Architecture  
> **Platform Runtime:** React 19.2 + TypeScript + Vite 8.0  
> **State Governance:** Single-Owner Layering (Server State $\to$ TanStack Query, Form State $\to$ RHF/Zod, Session $\to$ AuthProvider)  

---

## 1. Architecture Overview & Dependency Flow

```text
               ┌───────────────────────────────┐
               │          app/Router           │
               └───────────────┬───────────────┘
                               │
                               ▼
               ┌───────────────────────────────┐
               │         pages/ & views        │
               └───────────────┬───────────────┘
                               │
                               ▼
               ┌───────────────────────────────┐
               │          features/*           │
               └───────┬───────────────┬───────┘
                       │               │
       ┌───────────────┘               └───────────────┐
       ▼                                               ▼
┌──────────────┐                               ┌──────────────┐
│   shared/    │                               │  services/   │
│  Care Orbit  │                               │ Domain APIs  │
│  UI / Lib    │                               └───────┬──────┘
└──────────────┘                                       │
                                                       ▼
                                               ┌──────────────┐
                                               │ services/http│
                                               │ Axios Client │
                                               └───────┬──────┘
                                                       │
                                                       ▼
                                               ┌──────────────┐
                                               │   FastAPI    │
                                               │   /api/v1    │
                                               └──────────────┘
```

---

## 2. Directory Responsibilities

| Directory | Layer Responsibility | Prohibited Usages |
| :--- | :--- | :--- |
| `src/app/` | Application bootstrapping, composed provider tree, route paths, route guards, error boundaries, layout shells | Feature-specific business logic, direct API calls |
| `src/shared/` | Cross-feature Care Orbit presentation components, feedback states, design-system primitives, generic utility functions | Importing anything from `src/features/*` |
| `src/features/` | Domain modules (pages, components, schemas, types, custom hooks) | Directly creating Axios instances or accessing raw storage |
| `src/services/` | API contract adapters, HTTP client, error normalizer, token store | Rendering React JSX components or using React hooks |
| `src/query/` | Shared `QueryClient` singleton and structured `queryKeys` factory | Storing local UI state (modals, dropdowns) |

---

## 3. Provider Hierarchy

```tsx
<AppErrorBoundary>
  <ThemeProvider defaultTheme="system" storageKey="matrigluco-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
</AppErrorBoundary>
```

---

## 4. State Ownership Taxonomy

| State Type | Governing Mechanism | Scope / Example |
| :--- | :--- | :--- |
| **Server State** | `@tanstack/react-query` | Clinical predictions, health telemetry, reports, consultations, notifications |
| **Form State** | `react-hook-form` + `zod` | Clinical prediction form inputs, manual telemetry entry, login inputs |
| **Session State** | `AuthProvider` + `tokenStore` | Authenticated user profile, access token lifecycle |
| **Theme State** | `ThemeProvider` + `localStorage` | Light, dark, and system preference |
| **Route State** | `react-router-dom` | Active URL, search params, breadcrumbs |
| **Local Interaction** | `useState` / `useReducer` | Drawer open/closed, expanded rows, active tab |

---

## 5. Architectural Invariants & Rules

1. **Shared Independence**: `src/shared/` must never import from `src/features/`.
2. **Service Purity**: `src/services/` contains pure async functions returning typed promises with no React JSX or hooks.
3. **No Direct Storage**: Features do not read/write `localStorage` directly for session or medical data.
4. **Session Cache Isolation**: On logout, `queryClient.clear()` is called to purge all cached server data across accounts.
