package com.matrigluco.feature.auth.data

import com.matrigluco.core.auth.session.SessionManager
import com.matrigluco.core.network.error.ApiErrorMapper
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.core.network.error.executeApiCall
import com.matrigluco.feature.auth.data.remote.AuthApi
import com.matrigluco.feature.auth.data.remote.dto.LoginRequestDto
import com.matrigluco.feature.auth.data.remote.dto.RegisterRequestDto
import com.matrigluco.feature.auth.data.remote.dto.ForgotPasswordRequestDto
import com.matrigluco.feature.auth.domain.AuthRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton class AuthRepositoryImpl @Inject constructor(private val api: AuthApi, private val session: SessionManager, private val errors: ApiErrorMapper) : AuthRepository {
    override suspend fun login(email: String, password: String): ApiResult<Unit> = executeApiCall(errors) { session.establish(api.login(LoginRequestDto(email.trim().lowercase(), password)).toRemoteSession()) }
    override suspend fun register(email: String, password: String, fullName: String?): ApiResult<Unit> = executeApiCall(errors) { session.establish(api.register(RegisterRequestDto(email.trim().lowercase(), password, fullName?.trim())).toRemoteSession()) }
    override suspend fun forgotPassword(email: String): ApiResult<Unit> = executeApiCall(errors) { api.forgotPassword(ForgotPasswordRequestDto(email.trim().lowercase())); Unit }
    override suspend fun logout() = session.logout()
}
