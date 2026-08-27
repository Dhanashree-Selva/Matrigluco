package com.matrigluco.feature.history.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.feature.history.domain.model.ChronicleDateGroup
import com.matrigluco.feature.history.domain.model.ChronicleEventType
import com.matrigluco.feature.history.domain.model.ChronicleViewMode
import com.matrigluco.feature.history.domain.repository.HistoryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val repository: HistoryRepository
) : ViewModel() {

    private val _state = MutableStateFlow(HistoryUiState(loading = true))
    val state: StateFlow<HistoryUiState> = _state.asStateFlow()

    private var observeJob: Job? = null

    init {
        observeTimeline()
    }

    fun setSourceFilter(type: ChronicleEventType) {
        if (_state.value.selectedSource == type) return
        _state.update { it.copy(selectedSource = type, loading = true) }
        observeTimeline()
    }

    fun setMonthFilter(month: String?) {
        if (_state.value.selectedMonth == month) return
        _state.update { it.copy(selectedMonth = month, loading = true) }
        observeTimeline()
    }

    fun setViewMode(mode: ChronicleViewMode) {
        if (_state.value.viewMode == mode) return
        _state.update { it.copy(viewMode = mode) }
    }

    fun toggleDateGroup(group: ChronicleDateGroup) {
        _state.update { current ->
            val updatedGroups = current.dateGroups.map { g ->
                if (g.date == group.date) g.copy(isExpanded = !g.isExpanded)
                else g
            }
            current.copy(dateGroups = updatedGroups)
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true) }
            repository.refreshChronicle(
                selectedType = _state.value.selectedSource,
                selectedMonth = _state.value.selectedMonth
            )
            observeTimeline()
        }
    }

    private fun observeTimeline() {
        observeJob?.cancel()
        observeJob = viewModelScope.launch {
            repository.observeChronicle(
                selectedType = _state.value.selectedSource,
                selectedMonth = _state.value.selectedMonth
            ).catch { e ->
                _state.update { it.copy(loading = false, error = e.message) }
            }.collect { feed ->
                _state.update { current ->
                    // Preserve user expansion state if already modified in session
                    val existingExpansionMap = current.dateGroups.associate { it.date to it.isExpanded }
                    val mergedGroups = feed.dateGroups.map { g ->
                        val persistedExpanded = existingExpansionMap[g.date] ?: true
                        g.copy(isExpanded = persistedExpanded)
                    }

                    current.copy(
                        loading = false,
                        summary = feed.summary,
                        dateGroups = mergedGroups,
                        isOffline = feed.isOffline,
                        error = null
                    )
                }
            }
        }
    }
}
