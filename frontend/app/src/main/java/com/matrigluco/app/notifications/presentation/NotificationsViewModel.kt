package com.matrigluco.app.notifications.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.app.notifications.domain.NotificationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val repository: NotificationRepository
) : ViewModel() {

    private val _state = MutableStateFlow(NotificationsUiState(loading = true))
    val state: StateFlow<NotificationsUiState> = _state.asStateFlow()

    init {
        loadNotifications()
    }

    fun setFilter(filter: NotificationFilter) {
        _state.update { it.copy(filter = filter) }
    }

    fun refresh() {
        loadNotifications()
    }

    fun markAsRead(id: String) {
        // Optimistic local update
        _state.update { current ->
            val updatedList = current.items.map {
                if (it.id == id) it.copy(isRead = true) else it
            }
            val newUnread = (current.unreadCount - 1).coerceAtLeast(0)
            current.copy(items = updatedList, unreadCount = newUnread)
        }

        viewModelScope.launch {
            repository.markAsRead(id)
        }
    }

    fun markAllAsRead() {
        // Optimistic local update
        _state.update { current ->
            val updatedList = current.items.map { it.copy(isRead = true) }
            current.copy(items = updatedList, unreadCount = 0)
        }

        viewModelScope.launch {
            repository.markAllAsRead()
        }
    }

    fun deleteNotification(id: String) {
        _state.update { current ->
            val removedItem = current.items.find { it.id == id }
            val updatedList = current.items.filter { it.id != id }
            val newUnread = if (removedItem?.isRead == false) {
                (current.unreadCount - 1).coerceAtLeast(0)
            } else {
                current.unreadCount
            }
            current.copy(items = updatedList, unreadCount = newUnread)
        }

        viewModelScope.launch {
            repository.deleteNotification(id)
        }
    }

    private fun loadNotifications() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true) }
            repository.getNotifications()
                .onSuccess { response ->
                    _state.update {
                        it.copy(
                            loading = false,
                            items = response.items,
                            unreadCount = response.unreadCount,
                            error = null
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            loading = false,
                            error = error.message
                        )
                    }
                }
        }
    }
}
