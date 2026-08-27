package com.matrigluco.app.account.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH

interface ProfileApi {

    @GET("api/v1/profiles/me")
    suspend fun getProfile(): ProfileResponseDto

    @PATCH("api/v1/profiles/me")
    suspend fun updateProfile(@Body payload: ProfileUpdateDto): ProfileResponseDto
}
