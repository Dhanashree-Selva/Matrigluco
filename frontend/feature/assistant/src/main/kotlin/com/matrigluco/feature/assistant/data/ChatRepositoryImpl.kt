package com.matrigluco.feature.assistant.data

import com.matrigluco.core.network.error.ApiErrorMapper
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.core.network.error.executeApiCall
import com.matrigluco.feature.assistant.data.remote.ChatRemoteDataSource
import com.matrigluco.feature.assistant.data.remote.ConversationDto
import com.matrigluco.feature.assistant.data.remote.MessageDto
import com.matrigluco.feature.assistant.data.remote.SendMessageDto
import com.matrigluco.feature.assistant.domain.ChatMessage
import com.matrigluco.feature.assistant.domain.ChatRepository
import com.matrigluco.feature.assistant.domain.ChatRole
import com.matrigluco.feature.assistant.domain.ChatSource
import com.matrigluco.feature.assistant.domain.Conversation
import com.matrigluco.feature.assistant.domain.SendMessage
import javax.inject.Inject

class ChatRepositoryImpl @Inject constructor(
    private val remote: ChatRemoteDataSource,
    private val errors: ApiErrorMapper
) : ChatRepository {

    override suspend fun conversations(): ApiResult<List<Conversation>> =
        executeApiCall(errors) {
            remote.conversations().map(::mapConversation)
        }

    override suspend fun createConversation(title: String?): ApiResult<Conversation> =
        executeApiCall(errors) {
            mapConversation(remote.create(title))
        }

    override suspend fun getConversation(id: String): ApiResult<Conversation> =
        executeApiCall(errors) {
            mapConversation(remote.getConversation(id))
        }

    override suspend fun updateConversation(
        id: String,
        title: String?,
        status: String?
    ): ApiResult<Conversation> =
        executeApiCall(errors) {
            mapConversation(remote.updateConversation(id, title, status))
        }

    override suspend fun deleteConversation(id: String): ApiResult<Unit> =
        executeApiCall(errors) {
            remote.deleteConversation(id)
        }

    override suspend fun messages(conversationId: String): ApiResult<List<ChatMessage>> =
        executeApiCall(errors) {
            remote.messages(conversationId).map(::mapMessage)
        }

    override suspend fun send(
        conversationId: String,
        message: SendMessage
    ): ApiResult<ChatMessage> =
        executeApiCall(errors) {
            val dto = remote.send(
                conversationId,
                SendMessageDto(
                    content = message.content,
                    useHealthContext = message.useHealthContext,
                    resourceType = message.resourceType,
                    resourceId = message.resourceId
                )
            )
            mapMessage(dto)
        }

    override suspend fun submitFeedback(
        messageId: String,
        helpful: Boolean,
        comment: String?
    ): ApiResult<Unit> =
        executeApiCall(errors) {
            remote.feedback(messageId, if (helpful) 1 else -1, comment)
        }

    private fun mapConversation(dto: ConversationDto) = Conversation(
        id = dto.id,
        title = dto.title.ifBlank { "Maternal Health Conversation" },
        status = dto.status,
        createdAt = dto.createdAt.orEmpty(),
        updatedAt = dto.updatedAt.orEmpty()
    )

    private fun mapMessage(dto: MessageDto) = ChatMessage(
        id = dto.id,
        conversationId = dto.conversationId,
        role = when (dto.role.lowercase()) {
            "user" -> ChatRole.USER
            "assistant" -> ChatRole.ASSISTANT
            "system" -> ChatRole.SYSTEM
            else -> ChatRole.UNKNOWN
        },
        content = dto.content,
        sources = dto.sources.orEmpty().map { safeSource(it) },
        tokensUsed = dto.tokensUsed ?: 0,
        latencyMs = dto.latencyMs ?: 0.0,
        createdAt = dto.createdAt.orEmpty()
    )

    private fun safeSource(raw: String): ChatSource {
        val clean = raw.substringAfterLast('/').substringAfterLast('\\').trim()
        val title = clean
            .replace(".pdf", "", ignoreCase = true)
            .replace(".txt", "", ignoreCase = true)
            .replace("_", " ")
            .replace("-", " ")
            .trim()
            .take(120)
            .ifBlank { "Curated Clinical Guideline" }

        return ChatSource(
            title = title,
            snippet = raw,
            section = "Evidence-Based Guidance",
            document = "Matrigluco Clinical Knowledge Base"
        )
    }
}
