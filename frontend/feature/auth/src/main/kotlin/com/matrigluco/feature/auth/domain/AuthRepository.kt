package com.matrigluco.feature.auth.domain

import com.matrigluco.core.network.error.ApiResult

interface AuthRepository {
    suspend fun login(email: String, password: String): ApiResult<Unit>
    suspend fun register(email: String, password: String, fullName: String?): ApiResult<Unit>
    suspend fun forgotPassword(email: String): ApiResult<Unit>
    suspend fun logout()
}
