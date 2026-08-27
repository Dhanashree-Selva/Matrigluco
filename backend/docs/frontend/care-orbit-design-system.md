# Care Orbit Design System

> **Product Design Language:** Care Orbit  
> **Brand Accent:** Sophisticated Maternal Pink (`#D94F7D` / `#F06F9D`)  
> **Light Canvas:** Clean White & Soft Neutral Surfaces  
> **Dark Canvas:** Neutral Charcoal & Black Surfaces  
> **Governance:** No Stock SaaS Clones, Controlled Information Density, Meaning Preceding Metrics  

---

## 1. Care Orbit Philosophy
Health information in MatriGluco is arranged around meaning, context, and immediate action rather than an overwhelming grid of raw KPIs:
```text
What changed?
   ↓
What matters?
   ↓
What should I understand?
   ↓
What should I do next?
```

Every screen helps maternal patients answer:
1. **Where am I now?**
2. **What changed recently?**
3. **What does this information mean?**
4. **What should I do next?**
5. **Where can I ask for help?**

---

## 2. Color Direction & Theme Palette

### Light Theme
- **Background**: `#FFFFFF`
- **Secondary Background**: `#FCFAFB`
- **Elevated Surface**: `#FFFFFF`
- **Soft Surface**: `#F8F6F7`
- **Primary Ink (Foreground)**: `#171417`
- **Secondary Ink**: `#5E565B`
- **Muted Ink**: `#8E858B`
- **Primary Pink**: `#D94F7D`
- **Primary Pink Hover**: `#C84470`
- **Primary Pink Strong**: `#B93665`
- **Soft Pink (Wash)**: `#FCEBF1`
- **Pink Border**: `#F1C6D4`
- **Neutral Border**: `#E8E2E5`
- **Focus Ring**: `#E16B94`

### Dark Theme (Neutral Black Foundation)
- **Background**: `#0D0B0C`
- **Secondary Background**: `#131113`
- **Elevated Surface**: `#191619`
- **Raised Surface**: `#201C1F`
- **Primary Text**: `#FFF9FB`
- **Secondary Text**: `#D8D0D5`
- **Muted Text**: `#A69DA3`
- **Primary Pink**: `#F06F9D`
- **Primary Pink Hover**: `#FA83AC`
- **Primary Pink Strong**: `#FF9BBB`
- **Soft Pink Surface**: `#2A1820`
- **Pink Border**: `#5D2D3F`
- **Neutral Border**: `#2D292C`
- **Focus Ring**: `#F06F9D`

---

## 3. Status Tokens (Strictly Non-Pink)
Clinical and medical statuses are strictly separated from the brand pink accent to avoid alarm fatigue or false positive associations:

| Status | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| **Success / Low Risk** | `#3D8B6D` | `#6CC39C` | Normal glycemic readings, low clinical risk |
| **Warning / Moderate Risk** | `#B9863B` | `#D7AA63` | Elevated readings, moderate risk thresholds |
| **Danger / High Risk** | `#C94E59` | `#EE747D` | Critical thresholds, urgent clinical review required |
| **Info / Educational** | `#5E6FA8` | `#8FA3DB` | Informational guides, clinical research notes |

---

## 4. Spacing & Radius System

### Spacing Scale (4px Base)
- `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`

### Radius Hierarchy
- **Control / Buttons**: `12px – 14px` (`rounded-xl`)
- **Small Surfaces / Capsules**: `16px` (`rounded-2xl`)
- **Standard Cards / Dialogs**: `20px` (`rounded-[20px]`)
- **Major Surfaces / Health Horizon**: `24px` (`rounded-[24px]`)
- **Drawers / Modal Sheets**: `28px`

---

## 5. Care Orbit Signature Components

1. **Health Horizon (`HealthHorizon`)**:
   - The dominant dashboard surface. Explains recent state, clinical narrative, timestamp, and hosts the primary next action.
2. **Care Orbit (`CareOrbit`)**:
   - 4-pillar orientation and navigation hub (Assessment, Tracking, Reports, Consultations). Explicitly **not** a health or gamified wellness score.
3. **Journey Rail (`JourneyRail`)**:
   - Milestone progress tracker communicating care phases without gamification or artificial percentage completion.
4. **Signal Capsules (`SignalCapsule`)**:
   - Compact telemetry capsules (`label`, `value`, `unit`, `direction`, `timestamp`) replacing endless KPI card walls.
5. **Context Drawer (`ContextDrawer`)**:
   - Non-disruptive slide-out drawer (sheet on desktop, bottom sheet on mobile) preserving workflow state.
6. **Action Beacon (`ActionBeacon`)**:
   - Visually prioritized primary next action button preventing competing CTA noise.
7. **Calm Empty State (`CalmEmptyState`)**:
   - Structured, reassuring empty states using Hugeicons without cartoons or panic-inducing text.

---

## 6. Do's and Don'ts

### Do
- Use soft blush/pink as an ambient background wash on dominant surfaces.
- Use neutral black and charcoal for dark mode canvas.
- Prioritize **one** dominant next action with the Action Beacon.
- Provide clear units (`mg/dL`, `mmHg`, `kg/m²`) and timestamps for all clinical readings.

### Don't
- Do not make every card pink or use hot-pink / neon magenta anywhere.
- Do not make the dark theme blue-black.
- Do not use circular gauges to invent arbitrary "maternal health scores".
- Do not confuse brand pink with clinical status (success, warning, high risk).
