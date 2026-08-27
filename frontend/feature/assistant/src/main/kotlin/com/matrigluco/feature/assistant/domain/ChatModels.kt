package com.matrigluco.feature.assistant.domain

import com.matrigluco.core.network.error.ApiResult

data class Conversation(
    val id: String,
    val title: String,
    val status: String,
    val createdAt: String,
    val updatedAt: String
)

enum class ChatRole { USER, ASSISTANT, SYSTEM, UNKNOWN }

data class ChatSource(
    val title: String,
    val snippet: String = "",
    val section: String = "",
    val document: String = ""
)

data class ChatMessage(
    val id: String,
    val conversationId: String,
    val role: ChatRole,
    val content: String,
    val sources: List<ChatSource> = emptyList(),
    val tokensUsed: Int = 0,
    val latencyMs: Double = 0.0,
    val createdAt: String = "",
    val isPending: Boolean = false,
    val isError: Boolean = false
)

data class SendMessage(
    val content: String,
    val useHealthContext: Boolean = true,
    val resourceType: String? = null,
    val resourceId: String? = null
)

enum class PromptCategory {
    RISK_ASSESSMENT,
    REPORT_TERMINOLOGY,
    HEALTH_LOGS,
    DOCTOR_DISCUSSION
}

data class PromptSuggestion(
    val id: String,
    val category: PromptCategory,
    val categoryLabel: String,
    val question: String,
    val supportingText: String,
    val iconRes: Int
)

data class AssistantContextState(
    val useHealthContext: Boolean = true,
    val hasAssessmentContext: Boolean = true,
    val hasTelemetryContext: Boolean = true,
    val hasProfileContext: Boolean = true,
    val focusedResourceTitle: String? = null
)

interface ChatRepository {
    suspend fun conversations(): ApiResult<List<Conversation>>
    suspend fun createConversation(title: String? = null): ApiResult<Conversation>
    suspend fun getConversation(id: String): ApiResult<Conversation>
    suspend fun updateConversation(id: String, title: String? = null, status: String? = null): ApiResult<Conversation>
    suspend fun deleteConversation(id: String): ApiResult<Unit>
    suspend fun messages(conversationId: String): ApiResult<List<ChatMessage>>
    suspend fun send(conversationId: String, message: SendMessage): ApiResult<ChatMessage>
    suspend fun submitFeedback(messageId: String, helpful: Boolean, comment: String? = null): ApiResult<Unit>
}

interface ChatDraftStore {
    suspend fun read(ownerId: String, conversationId: String): String
    suspend fun write(ownerId: String, conversationId: String, text: String)
    suspend fun clear(ownerId: String, conversationId: String)
}
