package com.matrigluco.feature.reports.data.repository

import com.matrigluco.core.database.dao.ReportSummaryDao
import com.matrigluco.feature.reports.data.mapper.ReportMapper
import com.matrigluco.feature.reports.data.remote.ReportsApi
import com.matrigluco.feature.reports.data.remote.dto.SaveReportRequestDto
import com.matrigluco.feature.reports.data.remote.dto.UpdateReportRequestDto
import com.matrigluco.feature.reports.domain.model.MedicalReport
import com.matrigluco.feature.reports.domain.repository.ReportsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.JsonPrimitive
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReportsRepositoryImpl @Inject constructor(
    private val reportsApi: ReportsApi,
    private val reportDao: ReportSummaryDao
) : ReportsRepository {

    override fun observeReports(ownerUserId: String): Flow<List<MedicalReport>> {
        return reportDao.observe(ownerUserId, limit = 100).map { entities ->
            entities.map(ReportMapper::fromEntity)
        }
    }

    override suspend fun fetchReports(ownerUserId: String): Result<List<MedicalReport>> {
        return runCatching {
            val dtos = reportsApi.getReports(limit = 50)
            val domainReports = dtos.map(ReportMapper::toDomain)

            // Cache summaries into Room database
            val entities = domainReports.map { domain ->
                ReportMapper.toEntity(domain, ownerUserId)
            }
            reportDao.replace(ownerUserId, entities)

            domainReports
        }
    }

    override suspend fun getReportDetail(reportId: String): Result<MedicalReport> {
        return runCatching {
            val dto = reportsApi.getReportDetail(reportId)
            ReportMapper.toDomain(dto)
        }
    }

    override suspend fun uploadReport(
        ownerUserId: String,
        fileBytes: ByteArray,
        filename: String,
        mimeType: String
    ): Result<MedicalReport> {
        return runCatching {
            // 1. Upload private file to storage
            val requestBody = fileBytes.toRequestBody(mimeType.toMediaTypeOrNull())
            val part = MultipartBody.Part.createFormData("file", filename, requestBody)
            val assetDto = reportsApi.uploadPrivateFile(part)

            // 2. Create report record linked to file asset
            val saveRequest = SaveReportRequestDto(
                fileName = filename,
                fileUrl = assetDto.downloadUrl ?: assetDto.id
            )
            val reportDto = reportsApi.saveReport(saveRequest)
            val domain = ReportMapper.toDomain(reportDto)

            // 3. Cache newly created report
            reportDao.upsertAll(listOf(ReportMapper.toEntity(domain, ownerUserId)))

            domain
        }
    }

    override suspend fun updateReport(
        reportId: String,
        extractedValues: Map<String, String>
    ): Result<MedicalReport> {
        return runCatching {
            val jsonMap = extractedValues.mapValues { (_, v) -> JsonPrimitive(v) }
            val updatePayload = UpdateReportRequestDto(
                extractedValues = jsonMap
            )
            val updatedDto = reportsApi.updateReport(reportId, updatePayload)
            ReportMapper.toDomain(updatedDto)
        }
    }

    override suspend fun deleteReport(
        reportId: String,
        ownerUserId: String
    ): Result<Unit> {
        return runCatching {
            reportsApi.deleteReport(reportId)
            // Remove from cache
            fetchReports(ownerUserId)
            Unit
        }
    }

    override suspend fun downloadReportPdf(reportId: String): Result<ByteArray> {
        return runCatching {
            val response = reportsApi.downloadReportPdf(reportId)
            if (!response.isSuccessful || response.body() == null) {
                throw IllegalStateException("Failed to download report PDF: HTTP ${response.code()}")
            }
            response.body()!!.bytes()
        }
    }

    override suspend fun downloadPrivateFile(fileId: String): Result<ByteArray> {
        return runCatching {
            val response = reportsApi.downloadPrivateFile(fileId)
            if (!response.isSuccessful || response.body() == null) {
                throw IllegalStateException("Failed to download private file: HTTP ${response.code()}")
            }
            response.body()!!.bytes()
        }
    }
}
