package com.matrigluco.feature.reports.presentation.list

import com.matrigluco.feature.reports.domain.model.MedicalReport
import com.matrigluco.feature.reports.domain.model.ReportCounts
import com.matrigluco.feature.reports.domain.model.ReportFilter

data class ReportsUiState(
    val loading: Boolean = false,
    val reports: List<MedicalReport> = emptyList(),
    val filteredReports: List<MedicalReport> = emptyList(),
    val counts: ReportCounts = ReportCounts(),
    val selectedFilter: ReportFilter = ReportFilter.ALL,
    val isOffline: Boolean = false,
    val errorMessage: String? = null,
    val uploading: Boolean = false
)
