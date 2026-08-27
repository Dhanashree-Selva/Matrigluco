package com.matrigluco.feature.assistant.data.remote

import kotlinx.serialization.EncodeDefault
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

@Serializable
data class ConversationDto(
    @SerialName("id") val id: String,
    @SerialName("user_id") val userId: String = "",
    @SerialName("title") val title: String = "Maternal Health Conversation",
    @SerialName("status") val status: String = "active",
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("updated_at") val updatedAt: String? = null
)

@Serializable
data class ConversationCreateDto(
    @SerialName("title") val title: String? = null
)

@Serializable
data class ConversationUpdateDto(
    @SerialName("title") val title: String? = null,
    @SerialName("status") val status: String? = null
)

@Serializable
data class MessageDto(
    @SerialName("id") val id: String,
    @SerialName("conversation_id") val conversationId: String,
    @SerialName("role") val role: String,
    @SerialName("content") val content: String,
    @SerialName("tokens_used") val tokensUsed: Int? = null,
    @SerialName("latency_ms") val latencyMs: Double? = null,
    @SerialName("sources") val sources: List<String>? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class SendMessageDto(
    @SerialName("content") val content: String,
    @EncodeDefault(EncodeDefault.Mode.ALWAYS)
    @SerialName("use_health_context") val useHealthContext: Boolean = true,
    @SerialName("resource_type") val resourceType: String? = null,
    @SerialName("resource_id") val resourceId: String? = null
)

@Serializable
data class FeedbackDto(
    @SerialName("rating") val rating: Int,
    @SerialName("comment") val comment: String? = null
)

interface ChatApi {
    @GET("api/v1/chatbot/conversations")
    suspend fun conversations(): List<ConversationDto>

    @POST("api/v1/chatbot/conversations")
    suspend fun create(@Body body: ConversationCreateDto): ConversationDto

    @GET("api/v1/chatbot/conversations/{id}")
    suspend fun getConversation(@Path("id") id: String): ConversationDto

    @PATCH("api/v1/chatbot/conversations/{id}")
    suspend fun updateConversation(@Path("id") id: String, @Body body: ConversationUpdateDto): ConversationDto

    @DELETE("api/v1/chatbot/conversations/{id}")
    suspend fun deleteConversation(@Path("id") id: String)

    @GET("api/v1/chatbot/conversations/{id}/messages")
    suspend fun messages(@Path("id") id: String): List<MessageDto>

    @POST("api/v1/chatbot/conversations/{id}/messages")
    suspend fun send(@Path("id") id: String, @Body body: SendMessageDto): MessageDto

    @POST("api/v1/chatbot/messages/{id}/feedback")
    suspend fun feedback(@Path("id") id: String, @Body body: FeedbackDto)
}

interface ChatRemoteDataSource {
    suspend fun conversations(): List<ConversationDto>
    suspend fun create(title: String?): ConversationDto
    suspend fun getConversation(id: String): ConversationDto
    suspend fun updateConversation(id: String, title: String?, status: String?): ConversationDto
    suspend fun deleteConversation(id: String)
    suspend fun messages(id: String): List<MessageDto>
    suspend fun send(id: String, body: SendMessageDto): MessageDto
    suspend fun feedback(id: String, rating: Int, comment: String?)
}

class ChatRemoteDataSourceImpl(private val api: ChatApi) : ChatRemoteDataSource {
    override suspend fun conversations() = api.conversations()
    override suspend fun create(title: String?) = api.create(ConversationCreateDto(title))
    override suspend fun getConversation(id: String) = api.getConversation(id)
    override suspend fun updateConversation(id: String, title: String?, status: String?) =
        api.updateConversation(id, ConversationUpdateDto(title, status))
    override suspend fun deleteConversation(id: String) = api.deleteConversation(id)
    override suspend fun messages(id: String) = api.messages(id)
    override suspend fun send(id: String, body: SendMessageDto) = api.send(id, body)
    override suspend fun feedback(id: String, rating: Int, comment: String?) =
        api.feedback(id, FeedbackDto(rating, comment))
}
