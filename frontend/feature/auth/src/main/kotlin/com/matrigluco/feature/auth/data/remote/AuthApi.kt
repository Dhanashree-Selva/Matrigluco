package com.matrigluco.feature.auth.data.remote

import com.matrigluco.feature.auth.data.remote.dto.*
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApi {
    @POST("api/v1/auth/login") suspend fun login(@Body request: LoginRequestDto): TokenPairResponseDto
    @POST("api/v1/auth/register") suspend fun register(@Body request: RegisterRequestDto): TokenPairResponseDto
    @GET("api/v1/auth/me") suspend fun me(): UserDto
    @POST("api/v1/auth/logout") suspend fun logout(@Body request: LogoutRequestDto)
    @POST("api/v1/auth/logout-all") suspend fun logoutAll()
    @POST("api/v1/auth/forgot-password") suspend fun forgotPassword(@Body request: ForgotPasswordRequestDto): MessageResponseDto
}
interface RefreshApi {
    @POST("api/v1/auth/refresh") suspend fun refresh(@Body request: RefreshRequestDto): TokenPairResponseDto
    @POST("api/v1/auth/logout") suspend fun logout(@Body request: LogoutRequestDto)
}
