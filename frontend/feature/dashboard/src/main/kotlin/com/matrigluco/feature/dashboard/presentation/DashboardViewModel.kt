package com.matrigluco.feature.dashboard.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.core.network.error.ApiError
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.feature.dashboard.domain.DashboardRepository
import com.matrigluco.feature.dashboard.domain.DashboardSnapshot
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface DashboardUiState { data object Loading : DashboardUiState; data class Content(val snapshot: DashboardSnapshot) : DashboardUiState; data object Empty : DashboardUiState; data class Offline(val cached: DashboardSnapshot? = null) : DashboardUiState; data class Error(val error: ApiError) : DashboardUiState }
object DashboardStatePolicy {
    fun from(snapshot: DashboardSnapshot): DashboardUiState = if (snapshot.prediction == null && snapshot.measurements.isEmpty() && snapshot.recentActivities.isEmpty()) DashboardUiState.Empty else DashboardUiState.Content(snapshot)
}
@HiltViewModel class DashboardViewModel @Inject constructor(private val repository: DashboardRepository) : ViewModel() {
    private val mutableState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val state: StateFlow<DashboardUiState> = mutableState.asStateFlow()
    init { refresh() }
    fun refresh() { viewModelScope.launch { mutableState.value = DashboardUiState.Loading; mutableState.value = when (val result = repository.load()) { is ApiResult.Success -> DashboardStatePolicy.from(result.value); is ApiResult.Failure -> if (result.error == ApiError.Offline) DashboardUiState.Offline() else DashboardUiState.Error(result.error) } } }
}
