package com.matrigluco.app.legal.presentation.licenses

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.app.legal.data.OpenSourceLibraryRepository
import com.matrigluco.app.legal.model.LicenseCategory
import com.matrigluco.app.legal.model.OpenSourceLibrary
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject

data class LicensesUiState(
    val query: String = "",
    val selectedCategory: LicenseCategory = LicenseCategory.ALL,
    val libraries: List<OpenSourceLibrary> = emptyList(),
    val totalCount: Int = 0
)

@HiltViewModel
class OpenSourceLicensesViewModel @Inject constructor(
    private val repository: OpenSourceLibraryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(LicensesUiState())
    val uiState: StateFlow<LicensesUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun setQuery(newQuery: String) {
        _uiState.update { it.copy(query = newQuery) }
        refresh()
    }

    fun setCategory(category: LicenseCategory) {
        _uiState.update { it.copy(selectedCategory = category) }
        refresh()
    }

    private fun refresh() {
        val current = _uiState.value
        val list = repository.getLibraries(current.query, current.selectedCategory)
        _uiState.update {
            it.copy(
                libraries = list,
                totalCount = list.size
            )
        }
    }
}
