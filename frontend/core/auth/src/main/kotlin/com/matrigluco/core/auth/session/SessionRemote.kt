package com.matrigluco.core.auth.session

data class RemoteSession(val accessToken: String, val refreshToken: String, val expiresInSeconds: Long, val user: AuthenticatedUser, val onboardingComplete: Boolean)
sealed interface RefreshOutcome {
    data class Success(val session: RemoteSession) : RefreshOutcome
    data object NetworkUnavailable : RefreshOutcome
    data object ServiceUnavailable : RefreshOutcome
    data class Terminal(val reason: SessionExpiryReason) : RefreshOutcome
}
interface SessionRemote {
    suspend fun refresh(refreshToken: String): RefreshOutcome
    suspend fun logout(refreshToken: String)
}
