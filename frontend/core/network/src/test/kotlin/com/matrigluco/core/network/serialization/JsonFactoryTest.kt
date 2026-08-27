package com.matrigluco.core.network.serialization

import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import org.junit.Assert.assertEquals
import org.junit.Test

class JsonFactoryTest {
    @Serializable data class Payload(val required: String, val optional: String? = null)
    @Test fun `unknown response fields are tolerated`() { assertEquals("yes", JsonFactory.strict().decodeFromString<Payload>("""{"required":"yes","future":1}""").required) }
    @Test(expected = SerializationException::class) fun `missing required fields fail`() { JsonFactory.strict().decodeFromString<Payload>("{}") }
    @Test fun `null optional request fields are omitted`() { assertEquals("""{"required":"yes"}""", JsonFactory.strict().encodeToString(Payload.serializer(), Payload("yes"))) }
}
