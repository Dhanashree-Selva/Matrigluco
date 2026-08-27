package com.matrigluco.app.account.data

import com.matrigluco.app.account.domain.ProfileRepository
import com.matrigluco.core.auth.session.AuthenticatedUser
import com.matrigluco.core.auth.session.SessionRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProfileRepositoryImpl @Inject constructor(
    private val api: ProfileApi,
    private val sessionRepository: SessionRepository
) : ProfileRepository {

    override suspend fun getProfile(): Result<ProfileResponseDto> = runCatching {
        api.getProfile()
    }

    override suspend fun updateProfile(update: ProfileUpdateDto): Result<ProfileResponseDto> = runCatching {
        val updated = api.updateProfile(update)
        sessionRepository.updateCurrentUser(
            AuthenticatedUser(
                id = updated.id,
                email = updated.email,
                fullName = updated.fullName
            )
        )
        updated
    }
}
