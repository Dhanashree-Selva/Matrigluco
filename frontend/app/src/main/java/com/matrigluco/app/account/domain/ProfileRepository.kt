package com.matrigluco.app.account.domain

import com.matrigluco.app.account.data.ProfileResponseDto
import com.matrigluco.app.account.data.ProfileUpdateDto

interface ProfileRepository {
    suspend fun getProfile(): Result<ProfileResponseDto>
    suspend fun updateProfile(update: ProfileUpdateDto): Result<ProfileResponseDto>
}
