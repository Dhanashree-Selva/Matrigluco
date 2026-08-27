package com.matrigluco.feature.reports.data.remote

import com.matrigluco.feature.reports.data.remote.dto.FileAssetDto
import com.matrigluco.feature.reports.data.remote.dto.ReportDto
import com.matrigluco.feature.reports.data.remote.dto.SaveReportRequestDto
import com.matrigluco.feature.reports.data.remote.dto.UpdateReportRequestDto
import okhttp3.MultipartBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Streaming

interface ReportsApi {

    @GET("api/v1/reports")
    suspend fun getReports(
        @Query("limit") limit: Int = 50
    ): List<ReportDto>

    @GET("api/v1/reports/{report_id}")
    suspend fun getReportDetail(
        @Path("report_id") reportId: String
    ): ReportDto

    @Multipart
    @POST("api/v1/files/upload")
    suspend fun uploadPrivateFile(
        @Part file: MultipartBody.Part
    ): FileAssetDto

    @POST("api/v1/reports")
    suspend fun saveReport(
        @Body payload: SaveReportRequestDto
    ): ReportDto

    @PATCH("api/v1/reports/{report_id}")
    suspend fun updateReport(
        @Path("report_id") reportId: String,
        @Body payload: UpdateReportRequestDto
    ): ReportDto

    @DELETE("api/v1/reports/{report_id}")
    suspend fun deleteReport(
        @Path("report_id") reportId: String
    ): Response<Unit>

    @Streaming
    @GET("api/v1/reports/{report_id}/pdf")
    suspend fun downloadReportPdf(
        @Path("report_id") reportId: String
    ): Response<ResponseBody>

    @Streaming
    @GET("api/v1/files/{file_id}/download")
    suspend fun downloadPrivateFile(
        @Path("file_id") fileId: String
    ): Response<ResponseBody>
}
