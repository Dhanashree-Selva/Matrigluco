package com.matrigluco.app.account.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ProfileResponseDto(
    val id: String,
    val email: String,
    @SerialName("full_name") val fullName: String? = null,
    val age: Int? = null,
    @SerialName("blood_group") val bloodGroup: String? = null,
    val phone: String? = null,
    @SerialName("emergency_contact") val emergencyContact: String? = null,
    val role: String? = null,
    val status: String? = null,
    @SerialName("email_verified") val emailVerified: Boolean = false,
    @SerialName("pregnancy_week") val pregnancyWeek: Int? = null,
    @SerialName("expected_due_date") val expectedDueDate: String? = null,
    @SerialName("previous_pregnancies") val previousPregnancies: Int? = null
)

@Serializable
data class ProfileUpdateDto(
    @SerialName("full_name") val fullName: String? = null,
    val age: Int? = null,
    @SerialName("blood_group") val bloodGroup: String? = null,
    val phone: String? = null,
    @SerialName("emergency_contact") val emergencyContact: String? = null,
    @SerialName("pregnancy_week") val pregnancyWeek: Int? = null,
    @SerialName("expected_due_date") val expectedDueDate: String? = null,
    @SerialName("previous_pregnancies") val previousPregnancies: Int? = null
)
