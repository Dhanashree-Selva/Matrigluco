package com.matrigluco.feature.auth.presentation.login

import com.matrigluco.core.network.error.ApiError
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.core.testing.MainDispatcherRule
import com.matrigluco.feature.auth.domain.AuthRepository
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class LoginViewModelTest {
    @get:Rule val main = MainDispatcherRule()

    @Test fun `invalid input never calls repository`() = runTest(main.dispatcher) {
        val repository = FakeAuthRepository(ApiResult.Success(Unit)); val viewModel = LoginViewModel(repository)
        viewModel.submit("not-an-email", "")
        assertEquals(0, repository.loginCalls)
        assert(viewModel.state.value is LoginUiState.Invalid)
    }

    @Test fun `valid login exposes submitting then success`() = runTest(main.dispatcher) {
        val gate = CompletableDeferred<ApiResult<Unit>>(); val repository = FakeAuthRepository(null, gate); val viewModel = LoginViewModel(repository)
        viewModel.submit("synthetic@example.test", "test-password"); runCurrent()
        assertEquals(LoginUiState.Submitting, viewModel.state.value)
        gate.complete(ApiResult.Success(Unit)); runCurrent()
        assertEquals(LoginUiState.Success, viewModel.state.value)
    }

    @Test fun `backend unavailable becomes normalized error`() = runTest(main.dispatcher) {
        val viewModel = LoginViewModel(FakeAuthRepository(ApiResult.Failure(ApiError.ServiceUnavailable)))
        viewModel.submit("synthetic@example.test", "test-password"); runCurrent()
        assertEquals(LoginUiState.Error(ApiError.ServiceUnavailable), viewModel.state.value)
    }

    private class FakeAuthRepository(private val result: ApiResult<Unit>?, private val gate: CompletableDeferred<ApiResult<Unit>>? = null) : AuthRepository {
        var loginCalls = 0
        override suspend fun login(email: String, password: String): ApiResult<Unit> { loginCalls++; return gate?.await() ?: checkNotNull(result) }
        override suspend fun register(email: String, password: String, fullName: String?) = ApiResult.Success(Unit)
        override suspend fun forgotPassword(email: String) = ApiResult.Success(Unit)
        override suspend fun logout() = Unit
    }
}
