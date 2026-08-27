# MatriGluco Frontend Technology Stack & Dependency Governance

> **Platform Version:** MatriGluco Frontend 2.0  
> **Governance Standard:** Single Responsibility & Decoupled Architecture  
> **Target Runtime:** React 19.2 + TypeScript + Vite 8.0  

---

## 1. Approved Technology Stack Matrix

| Layer | Approved Technology | Package | Exact Responsibility | Forbidden Usage / Non-Goals |
| :--- | :--- | :--- | :--- | :--- |
| **UI Runtime** | React 19 + TypeScript | `react`, `react-dom`, `typescript` | Component composition, hooks, UI view state | Direct DB queries, raw transport config |
| **Build & Bundling** | Vite 8.0 | `vite`, `@vitejs/plugin-react` | HMR, dev server, bundling, env exposure | Backend execution, secrets injection |
| **Styling & Tokens** | Tailwind CSS v4 | `tailwindcss`, `@tailwindcss/vite` | Utility layout, responsive design, semantic CSS tokens | Hard-coded arbitrary color classes |
| **UI Primitives** | shadcn/ui | `src/components/ui/*` | Accessible, owned component source | Monolithic visual themes without customization |
| **Iconography** | Hugeicons | `@hugeicons/react`, `@hugeicons/core-free-icons` | Application-level iconography | Mixed icon libraries in new code |
| **Routing** | React Router 7 | `react-router-dom` | Route matching, layout nesting, route guards | Business logic, API fetching |
| **Server State** | TanStack Query v5 | `@tanstack/react-query` | Server caching, deduplication, invalidation | Local UI state (modals, dropdowns) |
| **HTTP Transport** | Axios | `axios` | REST calls, auth bearer header, single 401 refresh | Domain business rules inside interceptors |
| **Form Management** | React Hook Form | `react-hook-form` | Form state, registration, submission lifecycle | Uncontrolled `useState` monoliths |
| **Form Validation** | Zod | `zod`, `@hookform/resolvers` | Runtime schema validation & type inference | Silently coercing blank inputs to zero |
| **Visualization** | Recharts | `recharts` | Clinical trend visualization (glucose, BP, weight) | Decorative non-data charts |
| **Motion** | Framer Motion | `framer-motion` | Purposeful transitions, reduced-motion compliant | Constant gratuitous decorative movement |
| **Unit Testing** | Vitest + RTL | `vitest`, `@testing-library/react` | Component, hook, schema, and utility tests | Real cloud/backend integration dependencies |
| **E2E Testing** | Playwright | `@playwright/test` | Full synthetic user flows | Flaky UI-heavy unit testing |

---

## 2. Dependency Boundaries & Single Responsibility

```text
               ┌───────────────────────────────┐
               │    React 19 View / Pages      │
               └───────────────┬───────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ shadcn / UI   │     │ React Hook Form │     │ TanStack Query  │
│ Composites    │     │ + Zod Schema    │     │ Query Hooks     │
└───────────────┘     └────────┬────────┘     └────────┬────────┘
                               │                       │
                               ▼                       ▼
                      ┌─────────────────────────────────┐
                      │        Typed API Modules        │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │    Central Axios Instance       │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │         FastAPI /api/v1         │
                      └─────────────────────────────────┘
```

---

## 3. Numeric & Clinical Safety Standards

1. **Explicit Validation over Silent Coercion**:
   - `Number(value) || 0` and `parseFloat(value) || 0` are **strictly forbidden** for medical form fields.
   - Missing or blank fields must fail validation rather than silently submitting a fake zero value.
2. **Canonical 8-Feature ML Contract**:
   - `pregnancies`, `glucose`, `blood_pressure`, `skin_thickness`, `insulin`, `bmi`, `diabetes_pedigree_function`, `age`.
   - Gestational diabetes history is tracked in health records and **never** mapped to pregnancy count.
   - Blood pressure is sent as numeric mmHg rather than parsing `"120/80"`.
3. **Clinical Range Enforcement**:
   - Glucose: 40 – 500 mg/dL.
   - Diastolic Blood Pressure: 40 – 200 mmHg.
   - BMI: 10 – 80 kg/m².
   - Age: 14 – 65 years.
