package com.matrigluco.feature.assistant.data.remote

import com.matrigluco.core.network.serialization.JsonFactory
import kotlinx.serialization.encodeToString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SendMessageDtoTest {
    private val json = JsonFactory.strict()

    @Test fun contextOffIsExplicitAndContainsNoMedicalPayload() {
        val encoded = json.encodeToString(SendMessageDto(content = "Explain glucose", useHealthContext = false))
        assertTrue(encoded.contains("\"use_health_context\":false"))
        assertFalse(encoded.contains("health_history"))
        assertFalse(encoded.contains("measurements"))
    }

    @Test fun contextOnSendsOnlyBackendPermissionFlagAndResourceReference() {
        val encoded = json.encodeToString(SendMessageDto("Explain this", true, "assessment", "assessment-public-id"))
        assertEquals("{\"content\":\"Explain this\",\"use_health_context\":true,\"resource_type\":\"assessment\",\"resource_id\":\"assessment-public-id\"}", encoded)
    }
}
