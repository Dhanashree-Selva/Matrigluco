package com.matrigluco.core.network.error

sealed interface ApiError {
    data object Offline : ApiError
    data object Timeout : ApiError
    data object Unauthorized : ApiError
    data object Forbidden : ApiError
    data object NotFound : ApiError
    data class Rejected(val statusCode: Int) : ApiError
    data class Validation(val fields: Map<String, List<String>>) : ApiError
    data class RateLimited(val retryAfterSeconds: Long?) : ApiError
    data object ServiceUnavailable : ApiError
    data object Server : ApiError
    data object Contract : ApiError
    data object Unknown : ApiError
}

sealed interface ApiResult<out T> {
    data class Success<T>(val value: T) : ApiResult<T>
    data class Failure(val error: ApiError) : ApiResult<Nothing>
}
