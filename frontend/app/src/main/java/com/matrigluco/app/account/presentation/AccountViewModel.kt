package com.matrigluco.app.account.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.app.account.data.ProfileUpdateDto
import com.matrigluco.app.account.domain.ProfileRepository
import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AccountViewModel @Inject constructor(
    private val repository: ProfileRepository,
    private val sessionRepository: SessionRepository
) : ViewModel() {

    private val _state = MutableStateFlow(AccountUiState(loading = true))
    val state: StateFlow<AccountUiState> = _state.asStateFlow()

    init {
        loadInitialData()
    }

    fun setTab(tab: AccountTab) {
        _state.update { it.copy(activeTab = tab) }
    }

    fun updateFullName(value: String) {
        _state.update { it.copy(fullName = value, saveSuccess = false, errorMessage = null) }
    }

    fun updatePhone(value: String) {
        _state.update { it.copy(phone = value, saveSuccess = false, errorMessage = null) }
    }

    fun updateEmergencyContact(value: String) {
        _state.update { it.copy(emergencyContact = value, saveSuccess = false, errorMessage = null) }
    }

    fun updatePregnancyWeek(value: Int?) {
        _state.update { it.copy(pregnancyWeek = value, saveSuccess = false, errorMessage = null) }
    }

    fun updateExpectedDueDate(value: String?) {
        _state.update { it.copy(expectedDueDate = value, saveSuccess = false, errorMessage = null) }
    }

    fun updateBloodGroup(value: String?) {
        _state.update { it.copy(bloodGroup = value, saveSuccess = false, errorMessage = null) }
    }

    fun updatePreviousPregnancies(value: Int?) {
        _state.update { it.copy(previousPregnancies = value, saveSuccess = false, errorMessage = null) }
    }

    fun updateNotificationsEnabled(enabled: Boolean) {
        _state.update { it.copy(notificationsEnabled = enabled) }
    }

    fun updateAiContextEnabled(enabled: Boolean) {
        _state.update { it.copy(aiContextEnabled = enabled) }
    }

    fun clearNotifications() {
        _state.update { it.copy(saveSuccess = false, errorMessage = null) }
    }

    fun saveProfile() {
        val current = _state.value
        if (current.fullName.isBlank()) {
            _state.update { it.copy(errorMessage = "Full name is required.") }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(saving = true, errorMessage = null, saveSuccess = false) }

            val updateDto = ProfileUpdateDto(
                fullName = current.fullName.trim(),
                phone = current.phone.trim().ifBlank { null },
                emergencyContact = current.emergencyContact.trim().ifBlank { null },
                pregnancyWeek = current.pregnancyWeek,
                expectedDueDate = current.expectedDueDate,
                bloodGroup = current.bloodGroup,
                previousPregnancies = current.previousPregnancies
            )

            repository.updateProfile(updateDto)
                .onSuccess { updated ->
                    _state.update {
                        it.copy(
                            saving = false,
                            saveSuccess = true,
                            fullName = updated.fullName.orEmpty(),
                            email = updated.email,
                            phone = updated.phone.orEmpty(),
                            emergencyContact = updated.emergencyContact.orEmpty(),
                            pregnancyWeek = updated.pregnancyWeek,
                            expectedDueDate = updated.expectedDueDate,
                            bloodGroup = updated.bloodGroup,
                            previousPregnancies = updated.previousPregnancies,
                            errorMessage = null
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            saving = false,
                            errorMessage = error.message ?: "Failed to update profile. Please try again."
                        )
                    }
                }
        }
    }

    private fun loadInitialData() {
        // Pre-populate with current session data immediately
        when (val session = sessionRepository.sessionState.value) {
            is SessionState.Authenticated -> {
                _state.update {
                    it.copy(
                        fullName = session.user.fullName.orEmpty(),
                        email = session.user.email
                    )
                }
            }
            is SessionState.OfflineRestored -> {
                _state.update {
                    it.copy(
                        fullName = session.user.fullName.orEmpty(),
                        email = session.user.email
                    )
                }
            }
            else -> {}
        }

        // Fetch latest server profile
        viewModelScope.launch {
            repository.getProfile()
                .onSuccess { profile ->
                    _state.update {
                        it.copy(
                            loading = false,
                            fullName = profile.fullName ?: it.fullName,
                            email = profile.email,
                            phone = profile.phone.orEmpty(),
                            emergencyContact = profile.emergencyContact.orEmpty(),
                            pregnancyWeek = profile.pregnancyWeek,
                            expectedDueDate = profile.expectedDueDate,
                            bloodGroup = profile.bloodGroup,
                            previousPregnancies = profile.previousPregnancies
                        )
                    }
                }
                .onFailure {
                    _state.update { it.copy(loading = false) }
                }
        }
    }
}
