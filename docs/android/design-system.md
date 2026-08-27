# Care Orbit Native design system

## Direction

Care Orbit is Matrigluco's native Android visual language: neutral black and warm near-white surfaces, restrained borders, information-first typography, and Care Pink as the canonical focus/action accent. Teal and mint are not part of the baseline brand system. Semantic success, warning, danger, and information colors render supplied state only; they never derive clinical meaning.

Hierarchy follows typography, spacing, surface contrast, dividers, outline, then restrained elevation. The design system does not use dynamic color, gradients, glass effects, or card walls.

## Tokens

- Colors: `care_background`, surface levels, ink/text levels, `care_pink` family, border/divider/focus, disabled, success/warning/danger/info, and risk aliases.
- Spacing: `orbit_space_0`, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64; semantic phone/tablet screen padding and content/section/control gaps.
- Radius: small 12dp, medium 16dp, large 20dp, extra-large 24dp, pill.
- Elevation: flat 0dp, lifted 2dp, overlay 8dp. Prefer borders and surfaces first.
- Motion: fast 150ms, standard 200ms, emphasized 240ms. `OrbitMotion` returns zero duration when the system animator scale is disabled. Information never depends on animation.
- Typography: `Orbit.Text.Display`, Headline, TitleLarge, Title, BodyLarge, Body, BodyMuted, Label, LabelStrong, Metric, MetricUnit, Caption. All text sizing uses `sp`.

`Theme.Matrigluco` is DayNight and owns the Care Orbit palette, transparent system bars, icon contrast, and no-ActionBar policy. Dynamic Material color is intentionally disabled.

## Components

### OrbitButton

Use for primary, secondary, quiet, and destructive actions. Loading preserves its label and width, disables duplicate interaction, shows progress, and exposes a state description. Do not use it as a status display.

### OrbitTopBar

Use for a compact title, optional subtitle, back delegation, and one contextual action. Call `setScrolled` only when content has actually moved beneath it. It does not own navigation or finish activities.

### OrbitInputLayout

Use for labeled fields with required text, helper/error copy, prefix, fixed unit suffix, and password visibility. Errors are textual and announced. The caller owns validation and unit semantics.

### OrbitStatusChip

Use for compact supplied state labels in neutral, brand, success, warning, danger, or info tones. Text is mandatory. Do not use as the sole presentation of a critical error.

### OrbitMetricSurface

Use to render an exact supplied label, value, unit, timestamp, and optional status. It builds a complete accessibility description and never calculates ranges or risk.

### OrbitTimelineItem

Use for chronological tracking, report, consultation, and history rows. A rail and marker communicate continuity without wrapping each event in a card.

### OrbitSectionHeader

Use for a section title, optional metadata, and optional trailing action. Do not promote every section to page-heading scale.

### OrbitEmptyState

Use for a truthful title/reason, decorative icon, and at most one primary recovery action. Features supply copy; no fake health values are created.

### OrbitBottomSheet

Use as a styled composition over Material's stable `BottomSheetDialog` engine. It owns surface, handle, title focus, spacing, and a content host. Full pages remain Navigation destinations. Feature content must apply IME/navigation inset handling where its action layout requires it.

## Insets and back

`View.applyOrbitInsets` in `core:ui` preserves original padding and combines status/navigation bars, cutouts, system gestures, and IME as requested. The app root uses `SafeDrawing`; backgrounds can remain edge-to-edge while content is safe. No custom back interception or predictive-back animation is installed, so AppCompat and Navigation retain system behavior.

## Accessibility and adaptive use

Interactive controls target at least 48dp. Icons paired with visible text are decorative; icon-only actions require labels. State is never color-only. Layouts use start/end directions and wrap content rather than fixed text heights. Components contain no clinical rules and accept supplied semantics. Phone/tablet width adaptation belongs to feature containers; tokens provide 20dp phone and 32dp tablet padding.

## QA status

Resource linking and debug compilation verify light/night resource completeness. Static review covered 360/390/430/600/840dp container behavior and 1.0–2.0 font-scale wrapping rules; physical emulator visual/TalkBack/gesture/three-button checks remain a documented manual QA gap.
