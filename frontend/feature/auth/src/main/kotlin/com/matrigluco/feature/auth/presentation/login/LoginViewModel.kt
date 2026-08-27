package com.matrigluco.feature.auth.presentation.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.core.network.error.ApiError
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.feature.auth.domain.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

enum class LoginFieldError { INVALID_EMAIL, REQUIRED }
data class LoginValidation(val email: LoginFieldError? = null, val password: LoginFieldError? = null) { val isValid get() = email == null && password == null }
object LoginValidator {
    private val emailPattern = Regex("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$", RegexOption.IGNORE_CASE)
    fun validate(email: String, password: String): LoginValidation = LoginValidation(
        email = if (emailPattern.matches(email.trim())) null else LoginFieldError.INVALID_EMAIL,
        password = if (password.isBlank()) LoginFieldError.REQUIRED else null,
    )
}
sealed interface LoginUiState { data object Pristine : LoginUiState; data object Submitting : LoginUiState; data object Success : LoginUiState; data class Invalid(val validation: LoginValidation) : LoginUiState; data class Error(val error: ApiError) : LoginUiState }
@HiltViewModel class LoginViewModel @Inject constructor(private val repository: AuthRepository) : ViewModel() {
    private val mutableState = MutableStateFlow<LoginUiState>(LoginUiState.Pristine); val state: StateFlow<LoginUiState> = mutableState
    fun submit(email: String, password: String) {
        val validation = LoginValidator.validate(email, password)
        if (!validation.isValid) { mutableState.value = LoginUiState.Invalid(validation); return }
        viewModelScope.launch { mutableState.value = LoginUiState.Submitting; mutableState.value = when (val result = repository.login(email, password)) { is ApiResult.Success -> LoginUiState.Success; is ApiResult.Failure -> LoginUiState.Error(result.error) } }
    }
}
