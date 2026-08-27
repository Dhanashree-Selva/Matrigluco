package com.matrigluco.feature.history.presentation

import com.matrigluco.feature.history.domain.model.ChronicleDateGroup
import com.matrigluco.feature.history.domain.model.ChronicleEvent
import com.matrigluco.feature.history.domain.model.ChronicleEventType
import com.matrigluco.feature.history.domain.model.ChronicleSummary
import com.matrigluco.feature.history.domain.model.ChronicleViewMode

sealed interface TimelineItem {
    val stableId: String

    data class Header(
        val dateGroup: ChronicleDateGroup
    ) : TimelineItem {
        override val stableId: String = "header-${dateGroup.date}"
    }

    data class EventStory(
        val event: ChronicleEvent,
        val isFirstInGroup: Boolean,
        val isLastInGroup: Boolean
    ) : TimelineItem {
        override val stableId: String = "story-${event.id}"
    }

    data class EventDense(
        val event: ChronicleEvent
    ) : TimelineItem {
        override val stableId: String = "dense-${event.id}"
    }
}

data class HistoryUiState(
    val loading: Boolean = false,
    val summary: ChronicleSummary = ChronicleSummary(),
    val selectedSource: ChronicleEventType = ChronicleEventType.ALL,
    val selectedMonth: String? = null,
    val viewMode: ChronicleViewMode = ChronicleViewMode.STORY,
    val dateGroups: List<ChronicleDateGroup> = emptyList(),
    val isOffline: Boolean = false,
    val error: String? = null
) {
    val isEmpty: Boolean get() = dateGroups.isEmpty() || dateGroups.all { it.events.isEmpty() }
}
