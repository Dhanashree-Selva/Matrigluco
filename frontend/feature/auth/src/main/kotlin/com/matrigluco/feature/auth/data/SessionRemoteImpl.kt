package com.matrigluco.feature.auth.data

import com.matrigluco.core.auth.session.RefreshOutcome
import com.matrigluco.core.auth.session.SessionExpiryReason
import com.matrigluco.core.auth.session.SessionRemote
import com.matrigluco.core.network.error.ApiError
import com.matrigluco.core.network.error.ApiErrorMapper
import com.matrigluco.feature.auth.data.remote.RefreshApi
import com.matrigluco.feature.auth.data.remote.dto.LogoutRequestDto
import com.matrigluco.feature.auth.data.remote.dto.RefreshRequestDto
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CancellationException

@Singleton class SessionRemoteImpl @Inject constructor(private val refreshApi: RefreshApi, private val errors: ApiErrorMapper) : SessionRemote {
    override suspend fun refresh(refreshToken: String): RefreshOutcome = try {
        RefreshOutcome.Success(refreshApi.refresh(RefreshRequestDto(refreshToken)).toRemoteSession())
    } catch (cancelled: CancellationException) { throw cancelled } catch (error: Throwable) {
        when (errors.map(error)) {
            ApiError.Unauthorized -> RefreshOutcome.Terminal(SessionExpiryReason.INVALID_REFRESH)
            ApiError.Forbidden -> RefreshOutcome.Terminal(SessionExpiryReason.REVOKED)
            ApiError.Offline, ApiError.Timeout -> RefreshOutcome.NetworkUnavailable
            ApiError.ServiceUnavailable, ApiError.Server -> RefreshOutcome.ServiceUnavailable
            else -> RefreshOutcome.Terminal(SessionExpiryReason.INVALID_REFRESH)
        }
    }
    override suspend fun logout(refreshToken: String) { refreshApi.logout(LogoutRequestDto(refreshToken)) }
}
