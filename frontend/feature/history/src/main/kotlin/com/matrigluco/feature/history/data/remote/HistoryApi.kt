package com.matrigluco.feature.history.data.remote

import com.matrigluco.feature.history.data.remote.dto.HistoryListResponseDto
import retrofit2.http.GET
import retrofit2.http.Query

interface HistoryApi {

    @GET("api/v1/history")
    suspend fun getHistory(
        @Query("types") types: String? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null,
        @Query("month") month: String? = null,
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 50
    ): HistoryListResponseDto
}
