package com.matrigluco.feature.auth.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable data class LoginRequestDto(val email: String, val password: String)
@Serializable data class RegisterRequestDto(
    val email: String, val password: String,
    @SerialName("full_name") val fullName: String? = null,
    @SerialName("expected_due_date") val expectedDueDate: String? = null,
    val phone: String? = null,
)
@Serializable data class RefreshRequestDto(@SerialName("refresh_token") val refreshToken: String)
@Serializable data class LogoutRequestDto(@SerialName("refresh_token") val refreshToken: String? = null)
@Serializable data class ForgotPasswordRequestDto(val email: String)
@Serializable data class MessageResponseDto(val message: String)
@Serializable data class TokenPairResponseDto(
    @SerialName("access_token") val accessToken: String,
    @SerialName("token_type") val tokenType: String,
    @SerialName("expires_in") val expiresIn: Long,
    @SerialName("refresh_token") val refreshToken: String? = null,
    val user: UserDto,
)
@Serializable data class UserDto(
    val id: String, @SerialName("public_id") val publicId: String? = null, val email: String,
    @SerialName("full_name") val fullName: String? = null,
    @SerialName("expected_due_date") val expectedDueDate: String? = null,
    val role: String = "user", val status: String = "active",
    @SerialName("user_metadata") val userMetadata: JsonObject? = null,
)
