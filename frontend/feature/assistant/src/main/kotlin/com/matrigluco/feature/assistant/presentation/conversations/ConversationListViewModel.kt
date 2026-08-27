package com.matrigluco.feature.assistant.presentation.conversations

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.core.network.error.ApiError
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.feature.assistant.domain.ChatRepository
import com.matrigluco.feature.assistant.domain.Conversation
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface ConversationListState {
    data object Loading : ConversationListState
    data class Content(val items: List<Conversation>) : ConversationListState
    data object Empty : ConversationListState
    data object Offline : ConversationListState
    data class Error(val error: ApiError) : ConversationListState
    data object Creating : ConversationListState
}

@HiltViewModel
class ConversationListViewModel @Inject constructor(
    private val repository: ChatRepository
) : ViewModel() {

    private val mutable = MutableStateFlow<ConversationListState>(ConversationListState.Loading)
    val state = mutable.asStateFlow()

    private val eventsMutable = MutableStateFlow<Conversation?>(null)
    val opened = eventsMutable.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            mutable.value = ConversationListState.Loading
            mutable.value = when (val result = repository.conversations()) {
                is ApiResult.Success -> {
                    if (result.value.isEmpty()) ConversationListState.Empty
                    else ConversationListState.Content(result.value)
                }
                is ApiResult.Failure -> {
                    if (result.error == ApiError.Offline) ConversationListState.Offline
                    else ConversationListState.Error(result.error)
                }
            }
        }
    }

    fun create() {
        if (mutable.value == ConversationListState.Creating) return
        viewModelScope.launch {
            mutable.value = ConversationListState.Creating
            when (val result = repository.createConversation("Maternal Health Consultation")) {
                is ApiResult.Success -> {
                    eventsMutable.value = result.value
                }
                is ApiResult.Failure -> {
                    mutable.value = if (result.error == ApiError.Offline) {
                        ConversationListState.Offline
                    } else {
                        ConversationListState.Error(result.error)
                    }
                }
            }
        }
    }

    fun delete(id: String) {
        viewModelScope.launch {
            repository.deleteConversation(id)
            refresh()
        }
    }

    fun consumed() {
        eventsMutable.value = null
    }
}
