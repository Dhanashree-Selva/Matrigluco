package com.matrigluco.feature.auth.data

import com.matrigluco.core.network.serialization.JsonFactory
import com.matrigluco.feature.auth.data.remote.dto.RegisterRequestDto
import com.matrigluco.feature.auth.data.remote.dto.TokenPairResponseDto
import org.junit.Assert.assertFalse
import org.junit.Assert.assertEquals
import org.junit.Test

class AuthSerializationTest {
    private val json = JsonFactory.strict()
    @Test fun `register omits absent optional fields`() { val encoded = json.encodeToString(RegisterRequestDto.serializer(), RegisterRequestDto("a@b.com", "password")); assertFalse(encoded.contains("full_name")); assertFalse(encoded.contains("phone")) }
    @Test fun `token pair matches backend snake case`() { val dto = json.decodeFromString<TokenPairResponseDto>("""{"access_token":"a","token_type":"bearer","expires_in":900,"refresh_token":"r","user":{"id":"u","email":"e@example.com"}}"""); assertEquals("r", dto.refreshToken); assertEquals(900, dto.expiresIn) }
}
