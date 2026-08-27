package com.matrigluco.core.auth.token

import com.matrigluco.core.auth.session.AuthenticatedUser
import kotlinx.serialization.Serializable

@Serializable data class TokenSnapshot(
    val accessToken: String,
    val refreshToken: String,
    val accessTokenExpiresAtEpochSeconds: Long,
    val user: AuthenticatedUser,
    val onboardingComplete: Boolean,
)

interface SecureTokenStore {
    suspend fun read(): TokenSnapshot?
    suspend fun write(tokens: TokenSnapshot)
    suspend fun clear()
}
