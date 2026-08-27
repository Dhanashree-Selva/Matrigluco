package com.matrigluco.feature.auth.presentation.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.core.network.error.ApiError
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.feature.auth.domain.AuthRepository
import com.matrigluco.feature.auth.presentation.login.LoginFieldError
import com.matrigluco.feature.auth.presentation.login.LoginValidator
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface RegisterUiState { data object Ready:RegisterUiState; data object Submitting:RegisterUiState; data object Success:RegisterUiState; data class Invalid(val email:LoginFieldError?=null,val passwordTooShort:Boolean=false):RegisterUiState; data class Error(val error:ApiError):RegisterUiState }
@HiltViewModel class RegisterViewModel @Inject constructor(private val repository: AuthRepository):ViewModel(){
    private val mutable=MutableStateFlow<RegisterUiState>(RegisterUiState.Ready);val state=mutable.asStateFlow()
    fun submit(name:String,email:String,password:String){val emailError=LoginValidator.validate(email,"valid").email;val short=password.length<8;if(emailError!=null||short){mutable.value=RegisterUiState.Invalid(emailError,short);return};viewModelScope.launch{mutable.value=RegisterUiState.Submitting;mutable.value=when(val result=repository.register(email,password,name.ifBlank{null})){is ApiResult.Success->RegisterUiState.Success;is ApiResult.Failure->RegisterUiState.Error(result.error)}}}
}
