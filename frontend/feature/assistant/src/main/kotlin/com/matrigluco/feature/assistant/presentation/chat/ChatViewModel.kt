package com.matrigluco.feature.assistant.presentation.chat

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import com.matrigluco.core.network.error.ApiError
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.feature.assistant.domain.ChatMessage
import com.matrigluco.feature.assistant.domain.ChatDraftStore
import com.matrigluco.feature.assistant.domain.ChatRepository
import com.matrigluco.feature.assistant.domain.ChatRole
import com.matrigluco.feature.assistant.domain.PromptSuggestion
import com.matrigluco.feature.assistant.domain.PromptSuggestions
import com.matrigluco.feature.assistant.domain.SendMessage
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

data class ChatUiState(
    val loading: Boolean = false,
    val conversationId: String? = null,
    val messages: List<ChatMessage> = emptyList(),
    val draft: String = "",
    val healthContext: Boolean = true,
    val sending: Boolean = false,
    val offline: Boolean = false,
    val error: ApiError? = null,
    val suggestions: List<PromptSuggestion> = PromptSuggestions.DEFAULT_PROMPTS
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val repository: ChatRepository,
    private val drafts: ChatDraftStore,
    private val session: SessionRepository,
    saved: SavedStateHandle
) : ViewModel() {

    private var activeConversationId: String? = saved.get<String>("conversationId")
    private val mutable = MutableStateFlow(ChatUiState(conversationId = activeConversationId))
    val state = mutable.asStateFlow()

    private fun owner() = when (val state = session.sessionState.value) {
        is SessionState.Authenticated -> state.user.id
        is SessionState.OfflineRestored -> state.user.id
        else -> null
    }

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            val owner = owner()
            val convId = activeConversationId

            if (convId != null) {
                val draft = owner?.let { drafts.read(it, convId) }.orEmpty()
                mutable.value = mutable.value.copy(loading = true, draft = draft, error = null)

                when (val result = repository.messages(convId)) {
                    is ApiResult.Success -> {
                        mutable.value = mutable.value.copy(
                            loading = false,
                            messages = result.value,
                            offline = false,
                            conversationId = convId
                        )
                    }
                    is ApiResult.Failure -> {
                        mutable.value = mutable.value.copy(
                            loading = false,
                            offline = result.error == ApiError.Offline,
                            error = if (result.error == ApiError.Offline) null else result.error
                        )
                    }
                }
            } else {
                // If no specific conversation was requested, check if user has existing conversations
                when (val listResult = repository.conversations()) {
                    is ApiResult.Success -> {
                        val firstConv = listResult.value.firstOrNull()
                        if (firstConv != null && listResult.value.size == 1) {
                            activeConversationId = firstConv.id
                            val draft = owner?.let { drafts.read(it, firstConv.id) }.orEmpty()
                            val msgResult = repository.messages(firstConv.id)
                            if (msgResult is ApiResult.Success) {
                                mutable.value = mutable.value.copy(
                                    conversationId = firstConv.id,
                                    messages = msgResult.value,
                                    draft = draft,
                                    loading = false
                                )
                                return@launch
                            }
                        }
                    }
                    else -> Unit
                }

                val draft = owner?.let { drafts.read(it, "new_draft") }.orEmpty()
                mutable.value = mutable.value.copy(
                    loading = false,
                    conversationId = null,
                    messages = emptyList(),
                    draft = draft
                )
            }
        }
    }

    fun setConversationId(id: String?) {
        activeConversationId = id
        load()
    }

    fun startNewConversation() {
        activeConversationId = null
        mutable.value = mutable.value.copy(
            conversationId = null,
            messages = emptyList(),
            draft = "",
            error = null
        )
    }

    fun selectPrompt(prompt: PromptSuggestion) {
        mutable.value = mutable.value.copy(draft = prompt.question)
        val key = activeConversationId ?: "new_draft"
        owner()?.let {
            viewModelScope.launch {
                drafts.write(it, key, prompt.question)
            }
        }
    }

    fun draftChanged(value: String) {
        mutable.value = mutable.value.copy(draft = value.take(2000))
        val key = activeConversationId ?: "new_draft"
        owner()?.let {
            viewModelScope.launch {
                drafts.write(it, key, value)
            }
        }
    }

    fun setHealthContext(enabled: Boolean) {
        mutable.value = mutable.value.copy(healthContext = enabled)
    }

    fun send() {
        val current = mutable.value
        val text = current.draft.trim()
        if (current.sending || text.isBlank() || current.offline) return

        viewModelScope.launch {
            mutable.value = current.copy(sending = true, error = null)

            // Step 1: Ensure conversation exists
            var targetConversationId = activeConversationId
            if (targetConversationId == null) {
                when (val convResult = repository.createConversation("Maternal Health Consultation")) {
                    is ApiResult.Success -> {
                        targetConversationId = convResult.value.id
                        activeConversationId = targetConversationId
                        mutable.value = mutable.value.copy(conversationId = targetConversationId)
                    }
                    is ApiResult.Failure -> {
                        mutable.value = mutable.value.copy(
                            sending = false,
                            offline = convResult.error == ApiError.Offline,
                            error = convResult.error
                        )
                        return@launch
                    }
                }
            }

            // Step 2: Optimistically add user message + pending message to local UI
            val optimisticUserMsg = ChatMessage(
                id = UUID.randomUUID().toString(),
                conversationId = targetConversationId,
                role = ChatRole.USER,
                content = text,
                createdAt = java.time.Instant.now().toString()
            )
            val pendingMsg = ChatMessage(
                id = "pending_${UUID.randomUUID()}",
                conversationId = targetConversationId,
                role = ChatRole.ASSISTANT,
                content = "",
                isPending = true
            )

            mutable.value = mutable.value.copy(
                messages = current.messages + optimisticUserMsg + pendingMsg,
                draft = ""
            )

            owner()?.let {
                drafts.clear(it, targetConversationId)
                drafts.clear(it, "new_draft")
            }

            // Step 3: Send to backend
            when (val sendResult = repository.send(
                targetConversationId,
                SendMessage(text, current.healthContext)
            )) {
                is ApiResult.Success -> {
                    // Replace pending message with real assistant message
                    val updated = mutable.value.messages.filterNot { it.isPending } + sendResult.value
                    mutable.value = mutable.value.copy(
                        messages = updated,
                        sending = false,
                        error = null
                    )
                }
                is ApiResult.Failure -> {
                    val updated = mutable.value.messages.filterNot { it.isPending }
                    mutable.value = mutable.value.copy(
                        messages = updated,
                        sending = false,
                        draft = text, // restore draft for retry
                        offline = sendResult.error == ApiError.Offline,
                        error = sendResult.error
                    )
                }
            }
        }
    }

    fun feedback(messageId: String, helpful: Boolean) {
        viewModelScope.launch {
            repository.submitFeedback(messageId, helpful)
        }
    }
}
