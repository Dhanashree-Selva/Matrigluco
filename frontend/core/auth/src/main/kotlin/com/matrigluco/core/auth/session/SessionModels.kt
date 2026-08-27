package com.matrigluco.core.auth.session

import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.Serializable

@Serializable data class AuthenticatedUser(val id: String, val email: String, val fullName: String? = null)
enum class SessionExpiryReason { INVALID_REFRESH, REVOKED, SECURITY_REUSE, KEYSTORE_FAILURE }

sealed interface SessionState {
    data object Restoring : SessionState
    data object Public : SessionState
    data class Authenticated(val user: AuthenticatedUser, val onboardingComplete: Boolean) : SessionState
    data class OfflineRestored(val user: AuthenticatedUser, val onboardingComplete: Boolean) : SessionState
    data class Expired(val reason: SessionExpiryReason) : SessionState
}

interface SessionRepository {
    val sessionState: StateFlow<SessionState>
    suspend fun resolveSession()
    suspend fun markSignedOut()
    suspend fun updateCurrentUser(user: AuthenticatedUser)
}
