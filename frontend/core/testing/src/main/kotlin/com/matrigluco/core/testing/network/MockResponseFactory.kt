package com.matrigluco.core.testing.network

import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.RecordedRequest

object MockResponseFactory {
    fun json(code: Int = 200, body: String = "{}"): MockResponse = MockResponse()
        .setResponseCode(code)
        .setHeader("Content-Type", "application/json")
        .setBody(body)

    fun fastApiValidation(field: String, message: String): MockResponse = json(
        422,
        """{"detail":[{"loc":["body","$field"],"msg":"$message","type":"value_error"}]}""",
    )
}

fun RecordedRequest.requireRedactedBearer(): String =
    checkNotNull(getHeader("Authorization")) { "Expected an Authorization header; token value intentionally omitted" }
        .also { check(it.startsWith("Bearer ")) { "Expected Bearer authentication; token value intentionally omitted" } }
