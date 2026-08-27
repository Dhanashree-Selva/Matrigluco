package com.matrigluco.feature.reports.domain.repository

import com.matrigluco.feature.reports.domain.model.MedicalReport
import kotlinx.coroutines.flow.Flow

interface ReportsRepository {

    fun observeReports(ownerUserId: String): Flow<List<MedicalReport>>

    suspend fun fetchReports(ownerUserId: String): Result<List<MedicalReport>>

    suspend fun getReportDetail(reportId: String): Result<MedicalReport>

    suspend fun uploadReport(
        ownerUserId: String,
        fileBytes: ByteArray,
        filename: String,
        mimeType: String
    ): Result<MedicalReport>

    suspend fun updateReport(
        reportId: String,
        extractedValues: Map<String, String>
    ): Result<MedicalReport>

    suspend fun deleteReport(
        reportId: String,
        ownerUserId: String
    ): Result<Unit>

    suspend fun downloadReportPdf(
        reportId: String
    ): Result<ByteArray>

    suspend fun downloadPrivateFile(
        fileId: String
    ): Result<ByteArray>
}
