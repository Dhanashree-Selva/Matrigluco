package com.matrigluco.feature.auth.data

import com.matrigluco.core.auth.session.AuthenticatedUser
import com.matrigluco.core.auth.session.RemoteSession
import com.matrigluco.feature.auth.data.remote.dto.TokenPairResponseDto

fun TokenPairResponseDto.toRemoteSession(): RemoteSession {
    val rotatingRefresh = requireNotNull(refreshToken) { "Backend omitted required rotating refresh token" }
    return RemoteSession(accessToken, rotatingRefresh, expiresIn, AuthenticatedUser(user.id, user.email, user.fullName), user.expectedDueDate != null)
}
