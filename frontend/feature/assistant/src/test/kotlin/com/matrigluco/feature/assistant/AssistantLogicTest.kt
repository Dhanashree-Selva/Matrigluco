package com.matrigluco.feature.assistant

import com.matrigluco.core.network.serialization.JsonFactory
import com.matrigluco.feature.assistant.data.remote.ConversationDto
import com.matrigluco.feature.assistant.data.remote.FeedbackDto
import com.matrigluco.feature.assistant.data.remote.MessageDto
import com.matrigluco.feature.assistant.data.remote.SendMessageDto
import com.matrigluco.feature.assistant.domain.ChatMessage
import com.matrigluco.feature.assistant.domain.ChatRole
import com.matrigluco.feature.assistant.domain.ChatSource
import com.matrigluco.feature.assistant.domain.PromptCategory
import com.matrigluco.feature.assistant.domain.PromptSuggestions
import kotlinx.serialization.encodeToString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AssistantLogicTest {

    private val json = JsonFactory.strict()

    @Test
    fun promptSuggestionsContainAllFourCanonicalCategories() {
        val prompts = PromptSuggestions.DEFAULT_PROMPTS
        assertEquals(4, prompts.size)

        val categories = prompts.map { it.category }.toSet()
        assertTrue(categories.contains(PromptCategory.RISK_ASSESSMENT))
        assertTrue(categories.contains(PromptCategory.REPORT_TERMINOLOGY))
        assertTrue(categories.contains(PromptCategory.HEALTH_LOGS))
        assertTrue(categories.contains(PromptCategory.DOCTOR_DISCUSSION))

        prompts.forEach {
            assertTrue(it.question.isNotBlank())
            assertTrue(it.supportingText.isNotBlank())
            assertTrue(it.iconRes != 0)
        }
    }

    @Test
    fun conversationDtoSerializationRoundtrip() {
        val dto = ConversationDto(
            id = "conv-123",
            userId = "user-456",
            title = "Maternal Health Consultation",
            status = "active",
            createdAt = "2026-08-27T10:00:00Z"
        )
        val encoded = json.encodeToString(dto)
        val decoded = json.decodeFromString<ConversationDto>(encoded)

        assertEquals("conv-123", decoded.id)
        assertEquals("user-456", decoded.userId)
        assertEquals("Maternal Health Consultation", decoded.title)
    }

    @Test
    fun messageDtoWithSourcesSerialization() {
        val dto = MessageDto(
            id = "msg-001",
            conversationId = "conv-123",
            role = "assistant",
            content = "Fasting glucose reference range is typically under 95 mg/dL during pregnancy.",
            tokensUsed = 42,
            latencyMs = 120.5,
            sources = listOf("ACOG Practice Bulletin No. 190", "ADA Standards of Care in Diabetes"),
            createdAt = "2026-08-27T10:01:00Z"
        )
        val encoded = json.encodeToString(dto)
        val decoded = json.decodeFromString<MessageDto>(encoded)

        assertEquals("msg-001", decoded.id)
        assertEquals(2, decoded.sources?.size)
        assertEquals("ACOG Practice Bulletin No. 190", decoded.sources?.first())
    }

    @Test
    fun feedbackDtoSerializesProperly() {
        val helpful = FeedbackDto(rating = 1, comment = "Very clear explanation")
        val unhelpful = FeedbackDto(rating = -1, comment = null)

        val encHelpful = json.encodeToString(helpful)
        val encUnhelpful = json.encodeToString(unhelpful)

        assertTrue(encHelpful.contains("\"rating\":1"))
        assertTrue(encUnhelpful.contains("\"rating\":-1"))
    }

    @Test
    fun chatMessageDomainModelIntegrity() {
        val msg = ChatMessage(
            id = "test-1",
            conversationId = "c-1",
            role = ChatRole.ASSISTANT,
            content = "Test content",
            sources = listOf(ChatSource(title = "Clinical Source 1")),
            isPending = false,
            isError = false
        )

        assertEquals("test-1", msg.id)
        assertEquals(ChatRole.ASSISTANT, msg.role)
        assertEquals(1, msg.sources.size)
        assertFalse(msg.isPending)
    }
}
