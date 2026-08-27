# Matrigluco Android UI State Contract

**Applies to:** every data-driven or mutation-driven feature  
**Architecture authority:** `android-architecture.md`

## 1. Five-state review baseline

Every major screen must explicitly evaluate:

1. **Loading** — insufficient usable information to render the intended content.
2. **Content** — real backend data or clearly identified cached data.
3. **Empty** — successful, valid absence of content with a useful explanation/action.
4. **Offline** — connectivity unavailable, distinct from server/application failure.
5. **Error** — an operation failed, with controlled messaging and retryability.

Implement only semantically possible states. Document omissions. An assessment result has no meaningful Empty state: a missing ID becomes `Unavailable`/`NotFound`. A static settings page may have no Loading state. Strict review does not require artificial subclasses.

Additional states include `Refreshing`, `Saving`, `Submitting`, `Uploading`, `Processing`, `ReviewRequired`, `Unavailable`, `SessionExpired` and genuine `PendingSync`.

## 2. Rendering rules

- State is immutable and exposed through read-only `StateFlow`.
- One explicit state controls major visibility; never race scattered flags from callbacks.
- Rendering is idempotent and derives entirely from current state.
- Initial loading differs from refresh: keep useful content visible with `isRefreshing=true`.
- Empty and loading never contain sample readings, risks, doctors, reports or notifications.
- Cached content visibly discloses offline/stale status and source timestamp where relevant.
- Error UI explains what failed and whether retry is possible without raw exceptions/internal details.
- A one-off navigation, Snackbar, picker launch or session exit is an effect, not durable state.

```kotlin
sealed interface DashboardUiState {
    data object Loading : DashboardUiState
    data class Content(
        val model: DashboardUiModel,
        val isRefreshing: Boolean = false,
    ) : DashboardUiState
    data object Empty : DashboardUiState
    data class Offline(val cached: DashboardUiModel?) : DashboardUiState
    data class Error(
        val message: UiText,
        val retryable: Boolean,
        val requestId: String? = null,
    ) : DashboardUiState
}
```

This is illustrative, not a mandatory universal mega-state.

## 3. Mutation contract

Important mutations evaluate `Idle`, `Editing`, `Invalid`, `Submitting`, `Success` and `Failure`. Add `PendingSync` only when the backend/idempotency/WorkManager design genuinely supports durable queued mutation. Do not claim success before confirmation. Preserve safe form state on offline/error and prevent duplicate submissions across rotation/recollection.

## 4. Feature state decisions

| Feature | Required evaluation | Feature-specific decisions |
|---|---|---|
| Dashboard | Loading, Content, Empty, Offline, Error | Cached Content may refresh; Empty means no meaningful health data, never sample metrics |
| Tracking | all five | Offline may show stale readings; mutations require server or approved pending sync |
| History | all five | Paging refresh/load errors remain distinct from an empty chronology |
| Reports list | all five | Offline metadata only if approved; no public file URL assumptions |
| Report detail | Loading, Content, Offline, Error | Add Uploading, Processing, ReviewRequired, Ready, Failed, Unavailable from real backend states |
| Assistant | all five | Add Sending, Streaming, Unavailable; never synthesize replies; cancellation is explicit |
| Consultations | all five for supported records | Video/chat/provider states are forbidden until contracts exist |
| Notifications | all five | Cached inbox may be stale; inbox state is not push-delivery state |
| Assessment form | Content, Offline, Error + Editing/Invalid/Submitting | Preserve safe form state; no offline result |
| Assessment result | Loading, Content, Offline, Error, Unavailable | Empty is intentionally impossible |
| Account/settings | evaluate per subsection | Static local preferences need not invent Loading; remote profile/sessions do |

## 5. Actions and effects

Meaningful feature actions are explicit when they improve traceability and tests. Effects use the chosen Channel/SharedFlow mechanism and are consumed lifecycle-safely. `SingleLiveEvent` is prohibited. Do not turn every trivial click into architecture ceremony.

```kotlin
sealed interface AssessmentEffect {
    data class NavigateToResult(val assessmentId: String) : AssessmentEffect
    data class ShowMessage(val message: UiText) : AssessmentEffect
}
```

## 6. State transition tests

Every major ViewModel tests relevant paths:

```text
initial → Loading → Content
initial → Loading → Empty
offline + cache → Offline(cached)
offline + no cache → Offline(null)
server failure → Error
Content → Content(isRefreshing=true) → refreshed Content/error-with-existing-content
Idle → Submitting → Success
Idle → Submitting → Failure
```

Tests verify repeated actions/configuration changes do not duplicate sensitive mutations and no failure creates a locally completed assessment, report correction or booking.

## 7. Review checklist

- Five baseline states evaluated; impossible states documented.
- Feature-specific states reflect actual backend workflow.
- Content is real or explicitly cached.
- Empty contains no fake health/product records.
- Offline is distinct and cache staleness is disclosed.
- Refresh preserves useful content.
- Errors are normalized and safe.
- Mutation success requires real confirmation.
- Persistent state and one-off effects are separated.
- Visibility derives from one immutable state.
- Relevant transitions have unit tests.
