package com.matrigluco.app.legal.presentation.data

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.core.database.MatriglucoDatabase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DataControlsViewModel @Inject constructor(
    private val database: MatriglucoDatabase
) : ViewModel() {

    private val _events = MutableSharedFlow<DataControlEvent>()
    val events: SharedFlow<DataControlEvent> = _events.asSharedFlow()

    fun clearLocalCache() {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                database.clearAllTables()
                _events.emit(DataControlEvent.CacheCleared)
            } catch (e: Exception) {
                _events.emit(DataControlEvent.Error(e.message ?: "Failed to clear cache"))
            }
        }
    }
}

sealed interface DataControlEvent {
    object CacheCleared : DataControlEvent
    data class Error(val message: String) : DataControlEvent
}
