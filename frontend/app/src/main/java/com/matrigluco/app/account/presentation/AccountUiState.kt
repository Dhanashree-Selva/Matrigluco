package com.matrigluco.app.account.presentation

enum class AccountTab {
    PROFILE,
    PREFERENCES,
    SECURITY
}

data class AccountUiState(
    val activeTab: AccountTab = AccountTab.PROFILE,
    val loading: Boolean = false,
    val saving: Boolean = false,
    val saveSuccess: Boolean = false,
    val errorMessage: String? = null,
    // Identity fields
    val fullName: String = "",
    val email: String = "",
    val phone: String = "",
    val emergencyContact: String = "",
    // Maternal care context fields
    val pregnancyWeek: Int? = null,
    val expectedDueDate: String? = null,
    val bloodGroup: String? = null,
    val previousPregnancies: Int? = null,
    // Preferences fields
    val notificationsEnabled: Boolean = true,
    val aiContextEnabled: Boolean = true
) {
    val avatarInitials: String get() {
        val name = fullName.trim()
        if (name.isBlank()) {
            return email.firstOrNull { it.isLetter() }?.uppercaseChar()?.toString() ?: "M"
        }
        val parts = name.split("\\s+".toRegex()).filter { it.isNotBlank() }
        return when {
            parts.size >= 2 -> "${parts[0].first()}${parts[1].first()}".uppercase()
            parts.size == 1 -> parts[0].take(2).uppercase()
            else -> "M"
        }
    }
}
