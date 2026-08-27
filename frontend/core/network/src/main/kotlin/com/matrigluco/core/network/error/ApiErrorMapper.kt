package com.matrigluco.core.network.error

import java.io.IOException
import java.net.SocketTimeoutException
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.decodeFromJsonElement
import retrofit2.HttpException

class ApiErrorMapper(private val json: Json) {
    fun map(throwable: Throwable): ApiError = when (throwable) {
        is SocketTimeoutException -> ApiError.Timeout
        is SerializationException -> ApiError.Contract
        is HttpException -> mapHttp(throwable)
        is IOException -> ApiError.Offline
        else -> ApiError.Unknown
    }

    private fun mapHttp(error: HttpException): ApiError = when (error.code()) {
        401 -> ApiError.Unauthorized
        403 -> ApiError.Forbidden
        404 -> ApiError.NotFound
        400, 409, 413 -> ApiError.Rejected(error.code())
        422 -> validation(error)
        429 -> ApiError.RateLimited(error.response()?.headers()?.get("Retry-After")?.toLongOrNull())
        503 -> ApiError.ServiceUnavailable
        in 500..599 -> ApiError.Server
        else -> ApiError.Unknown
    }

    private fun validation(error: HttpException): ApiError {
        val body = error.response()?.errorBody()?.string() ?: return ApiError.Validation(emptyMap())
        return runCatching {
            val detail = json.decodeFromString<FastApiErrorDto>(body).detail as? JsonArray
            val issues = detail?.map { json.decodeFromJsonElement<FastApiValidationIssueDto>(it) }.orEmpty()
            ApiError.Validation(issues.groupBy({ issue -> issue.loc.drop(1).joinToString(".") { it.toString().trim('"') }.ifBlank { "request" } }, { it.msg }))
        }.getOrDefault(ApiError.Validation(emptyMap()))
    }
}
