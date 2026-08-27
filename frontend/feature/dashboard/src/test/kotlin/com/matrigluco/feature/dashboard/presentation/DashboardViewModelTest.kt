package com.matrigluco.feature.dashboard.presentation

import com.matrigluco.core.network.error.ApiError
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.core.testing.MainDispatcherRule
import com.matrigluco.feature.dashboard.domain.DashboardRepository
import com.matrigluco.feature.dashboard.domain.DashboardSnapshot
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class DashboardViewModelTest {
    @get:Rule val main = MainDispatcherRule()

    @Test fun `empty server response renders empty`() = runTest(main.dispatcher) {
        val viewModel = DashboardViewModel(FakeRepository(ApiResult.Success(DashboardSnapshot())))
        runCurrent(); assertEquals(DashboardUiState.Empty, viewModel.state.value)
    }

    @Test fun `offline response renders truthful offline state`() = runTest(main.dispatcher) {
        val viewModel = DashboardViewModel(FakeRepository(ApiResult.Failure(ApiError.Offline)))
        runCurrent(); assertEquals(DashboardUiState.Offline(), viewModel.state.value)
    }

    @Test fun `retry re-enters repository and can recover`() = runTest(main.dispatcher) {
        val repository = SequenceRepository(ArrayDeque(listOf(ApiResult.Failure(ApiError.Server), ApiResult.Success(DashboardSnapshot()))))
        val viewModel = DashboardViewModel(repository); runCurrent()
        assertEquals(DashboardUiState.Error(ApiError.Server), viewModel.state.value)
        viewModel.refresh(); runCurrent()
        assertEquals(DashboardUiState.Empty, viewModel.state.value); assertEquals(2, repository.calls)
    }

    private class FakeRepository(private val result: ApiResult<DashboardSnapshot>) : DashboardRepository { override suspend fun load() = result }
    private class SequenceRepository(private val results: ArrayDeque<ApiResult<DashboardSnapshot>>) : DashboardRepository { var calls=0; override suspend fun load(): ApiResult<DashboardSnapshot> { calls++; return results.removeFirst() } }
}
