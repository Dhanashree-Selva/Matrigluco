package com.matrigluco.core.network.error

import kotlinx.coroutines.CancellationException

suspend inline fun <T> executeApiCall(mapper: ApiErrorMapper, crossinline call: suspend () -> T): ApiResult<T> =
    try { ApiResult.Success(call()) } catch (cancelled: CancellationException) { throw cancelled } catch (error: Throwable) { ApiResult.Failure(mapper.map(error)) }
