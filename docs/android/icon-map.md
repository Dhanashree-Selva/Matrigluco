# Matrigluco Android icon map

This file is the source of truth for Matrigluco-owned functional icons. Before adding an icon, reuse an existing `OrbitIcon`; only add a genuinely new concept through the pinned conversion manifest and update this document in the same change.

## Source, family, and license

- Official source: `@hugeicons/core-free-icons@4.2.1`, package integrity recorded by npm as `sha512-75jYZKYyA9VwS…EL9RwCYtOgnSw==`.
- Catalog: Hugeicons Free, Stroke Rounded family, canonical 24×24 grid and 1.5 stroke.
- License basis: MIT for the free icon package and source code. No Pro assets are used.
- Conversion: [tools/icons/convert_hugeicons.ps1](../../frontend/tools/icons/convert_hugeicons.ps1) reads the official ESM geometry, accepts paths and exact circle-to-arc conversion, validates stroke width, and fails on unsupported primitives.
- Android location: `core/designsystem/src/main/res/drawable/`. Android does not permit a nested `drawable/hugeicons` resource folder, so the `ic_huge_*_24` namespace supplies logical ownership.

## Primary navigation

| Product meaning | Exact Hugeicons export | Android resource | License | Used by |
|---|---|---|---|---|
| Home | `Home01Icon` | `ic_huge_home_24` | MIT | App shell |
| Track | `Activity01Icon` | `ic_huge_activity_24` | MIT | App shell/tracking |
| Assess | `TaskDone01Icon` | `ic_huge_assessment_24` | MIT | App shell/assessment |
| Assistant | `BubbleChatIcon` | `ic_huge_message_24` | MIT | App shell/dialogue |
| More | `MoreHorizontalIcon` | `ic_huge_more_horizontal_24` | MIT | App shell |

## Secondary navigation

| Product meaning | Exact Hugeicons export | Android resource | License | Used by |
|---|---|---|---|---|
| History | `TimeQuarterPassIcon` | `ic_huge_history_24` | MIT | History |
| Reports | `File02Icon` | `ic_huge_report_24` | MIT | Reports |
| Consultations | `Calendar03Icon` | `ic_huge_calendar_24` | MIT | Consultations |
| Notifications | `Notification02Icon` | `ic_huge_notification_24` | MIT | Notification center |
| Account | `UserIcon` | `ic_huge_user_24` | MIT | Account |

## Common actions

| Meaning | Exact export | Resource |
|---|---|---|
| Back | `ArrowLeft02Icon` | `ic_huge_arrow_left_24` |
| Close | `Cancel01Icon` | `ic_huge_close_24` |
| Add | `Add01Icon` | `ic_huge_add_24` |
| Edit | `Edit02Icon` | `ic_huge_edit_24` |
| Delete | `Delete02Icon` | `ic_huge_delete_24` |
| Search | `Search01Icon` | `ic_huge_search_24` |
| Filter | `FilterIcon` | `ic_huge_filter_24` |
| Calendar | `Calendar03Icon` | `ic_huge_calendar_24` |
| Clock | `Clock01Icon` | `ic_huge_clock_24` |
| Upload | `Upload01Icon` | `ic_huge_upload_24` |
| Download | `Download01Icon` | `ic_huge_download_24` |
| Share | `Share01Icon` | `ic_huge_share_24` |
| Refresh/retry | `RefreshIcon` | `ic_huge_refresh_24` |
| Next | `ArrowRight01Icon` | `ic_huge_chevron_right_24` |
| Expand | `ArrowDown01Icon` | `ic_huge_chevron_down_24` |

## Status and context

| Meaning | Exact export | Resource |
|---|---|---|
| Information | `InformationCircleIcon` | `ic_huge_info_24` |
| Warning | `Alert02Icon` | `ic_huge_warning_24` |
| Success/check | `Tick02Icon` | `ic_huge_check_24` |
| Lock | `LockIcon` | `ic_huge_lock_24` |
| Privacy/security | `SecurityCheckIcon` | `ic_huge_shield_24` |
| Offline | `WifiDisconnected01Icon` | `ic_huge_offline_24` |
| Document | `DocumentAttachmentIcon` | `ic_huge_document_24` |
| Trend | `ChartUpIcon` | `ic_huge_trend_24` |

All entries in the common-action and status tables use the same MIT license basis. Care Pink means selection/brand focus, never medical severity.

## Usage rules

- Kotlin consumes `OrbitIcon`; no reflection or `getIdentifier` lookup.
- Default visual size is 24dp inside an approximately 48dp interactive target.
- Navigation state uses one vector plus `orbit_icon_navigation_tint`; action and destructive controls use their corresponding state lists.
- Directional back/next/expand vectors use `autoMirrored` for RTL.
- Decorative compound-control icons are excluded from TalkBack; icon-only actions describe the action, not the drawing.
- Health-critical actions use icon plus visible text or an unambiguous contextual label.

## Exceptions

- Launcher foreground/background and adaptive icon resources are Matrigluco branding assets, not Hugeicons.
- Android system permission, biometric, document-picker, back-gesture, and notification small-icon UI remain platform/separate concerns.
- No third-party product-icon library exception currently exists.
