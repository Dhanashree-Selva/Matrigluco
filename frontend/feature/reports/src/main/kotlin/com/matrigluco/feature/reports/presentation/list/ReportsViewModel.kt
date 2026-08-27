package com.matrigluco.feature.reports.presentation.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import com.matrigluco.feature.reports.domain.model.MedicalReport
import com.matrigluco.feature.reports.domain.model.ReportCounts
import com.matrigluco.feature.reports.domain.model.ReportFilter
import com.matrigluco.feature.reports.domain.model.ReportStatus
import com.matrigluco.feature.reports.domain.repository.ReportsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReportsViewModel @Inject constructor(
    private val repository: ReportsRepository,
    private val sessionRepository: SessionRepository
) : ViewModel() {

    private val _state = MutableStateFlow(ReportsUiState(loading = true))
    val state = _state.asStateFlow()

    private var currentUserId: String? = null

    init {
        observeSession()
    }

    private fun observeSession() {
        viewModelScope.launch {
            sessionRepository.sessionState.collect { sessionState ->
                val userId = when (sessionState) {
                    is SessionState.Authenticated -> sessionState.user.id
                    is SessionState.OfflineRestored -> sessionState.user.id
                    else -> null
                }
                currentUserId = userId
                if (userId != null) {
                    observeCachedReports(userId)
                    refreshReports()
                } else {
                    _state.update { it.copy(loading = false, reports = emptyList(), filteredReports = emptyList()) }
                }
            }
        }
    }

    private fun observeCachedReports(userId: String) {
        viewModelScope.launch {
            repository.observeReports(userId).collect { reports ->
                val counts = calculateCounts(reports)
                val filtered = applyFilter(reports, _state.value.selectedFilter)
                _state.update {
                    it.copy(
                        reports = reports,
                        filteredReports = filtered,
                        counts = counts
                    )
                }
            }
        }
    }

    fun refreshReports() {
        val userId = currentUserId ?: return
        viewModelScope.launch {
            _state.update { it.copy(loading = true, isOffline = false, errorMessage = null) }
            val result = repository.fetchReports(userId)
            result.onSuccess { reports ->
                val counts = calculateCounts(reports)
                val filtered = applyFilter(reports, _state.value.selectedFilter)
                _state.update {
                    it.copy(
                        loading = false,
                        reports = reports,
                        filteredReports = filtered,
                        counts = counts,
                        isOffline = false
                    )
                }
            }.onFailure { error ->
                _state.update {
                    it.copy(
                        loading = false,
                        isOffline = true,
                        errorMessage = error.localizedMessage
                    )
                }
            }
        }
    }

    fun setFilter(filter: ReportFilter) {
        _state.update {
            val filtered = applyFilter(it.reports, filter)
            it.copy(selectedFilter = filter, filteredReports = filtered)
        }
    }

    fun uploadReport(
        fileBytes: ByteArray,
        filename: String,
        mimeType: String,
        onSuccess: (MedicalReport) -> Unit,
        onError: (String) -> Unit
    ) {
        val userId = currentUserId ?: return
        viewModelScope.launch {
            _state.update { it.copy(uploading = true) }
            val result = repository.uploadReport(userId, fileBytes, filename, mimeType)
            _state.update { it.copy(uploading = false) }
            result.onSuccess { created ->
                refreshReports()
                onSuccess(created)
            }.onFailure { error ->
                onError(error.localizedMessage ?: "Failed to upload medical report.")
            }
        }
    }

    fun updateReportBiomarkers(
        reportId: String,
        extractedValues: Map<String, String>,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            val result = repository.updateReport(reportId, extractedValues)
            result.onSuccess {
                refreshReports()
                onSuccess()
            }.onFailure { error ->
                onError(error.localizedMessage ?: "Failed to update report.")
            }
        }
    }

    fun deleteReport(
        reportId: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val userId = currentUserId ?: return
        viewModelScope.launch {
            val result = repository.deleteReport(reportId, userId)
            result.onSuccess {
                refreshReports()
                onSuccess()
            }.onFailure { error ->
                onError(error.localizedMessage ?: "Failed to delete report.")
            }
        }
    }

    suspend fun downloadPdf(reportId: String): Result<ByteArray> {
        return repository.downloadReportPdf(reportId)
    }

    private fun calculateCounts(reports: List<MedicalReport>): ReportCounts {
        val all = reports.size
        val needsReview = reports.count { it.status == ReportStatus.NEEDS_REVIEW }
        val reviewed = reports.count { it.status == ReportStatus.REVIEWED }
        return ReportCounts(all = all, needsReview = needsReview, reviewed = reviewed)
    }

    private fun applyFilter(reports: List<MedicalReport>, filter: ReportFilter): List<MedicalReport> {
        return when (filter) {
            ReportFilter.ALL -> reports
            ReportFilter.NEEDS_REVIEW -> reports.filter { it.status == ReportStatus.NEEDS_REVIEW }
            ReportFilter.REVIEWED -> reports.filter { it.status == ReportStatus.REVIEWED }
        }
    }
}
