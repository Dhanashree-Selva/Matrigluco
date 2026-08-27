package com.matrigluco.app.legal.presentation.licenses

import com.matrigluco.app.legal.data.OpenSourceLibraryRepository
import com.matrigluco.app.legal.model.LicenseCategory
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class OpenSourceLicensesViewModelTest {

    private lateinit var repository: OpenSourceLibraryRepository
    private lateinit var viewModel: OpenSourceLicensesViewModel

    @Before
    fun setup() {
        repository = OpenSourceLibraryRepository()
        viewModel = OpenSourceLicensesViewModel(repository)
    }

    @Test
    fun initialStateLoadsAllLibraries() {
        val state = viewModel.uiState.value
        assertEquals("", state.query)
        assertEquals(LicenseCategory.ALL, state.selectedCategory)
        assertTrue(state.totalCount > 0)
        assertEquals(state.totalCount, state.libraries.size)
    }

    @Test
    fun setQueryFiltersLibraries() {
        viewModel.setQuery("OkHttp")
        val state = viewModel.uiState.value
        assertEquals(1, state.libraries.size)
        assertEquals("OkHttp", state.libraries.first().name)
    }

    @Test
    fun setCategoryFiltersLibraries() {
        viewModel.setCategory(LicenseCategory.MIT)
        val state = viewModel.uiState.value
        assertTrue(state.libraries.all { it.licenseCategory == LicenseCategory.MIT })
    }
}
