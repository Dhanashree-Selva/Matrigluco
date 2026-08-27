# Android adaptive layout contract

The phone resource in `layout/` is canonical. Runtime window width selects compact below 600 dp, medium from 600–839 dp, and expanded at 840 dp or wider. Navigation changes from bottom navigation to a rail without changing destinations or feature state.

`values-sw600dp` increases semantic screen and pane spacing. Content containers enforce readable maximum widths: 560 dp for forms, 720 dp for chat, 760 dp for detail content, and 1120 dp for composed pages. The dashboard has a real `layout-sw600dp` composition with health horizon and snapshot panes; it reuses the same binding IDs and ViewModel.

Alternative resources are introduced only when composition changes. Orientation-only resources are intentionally absent because current screens reflow without an information-architecture change. Business logic, repositories, and state restoration never live in resource variants.

Tracking, history, reports, consultations, and account currently remain shell destinations. Their master/detail or bounded tablet layouts must be implemented with their actual feature modules; placeholder tablet screens are prohibited. The assistant currently uses a readable single-pane flow and does not yet provide tablet master/detail conversation selection.

Release QA must exercise phone portrait/landscape, 7–8 inch tablet, 10–12 inch tablet, split screen, resize, keyboard-open landscape, RTL, light/dark theme, and state preservation across configuration change.
