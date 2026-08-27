package com.matrigluco.core.network.error

import com.matrigluco.core.network.serialization.JsonFactory
import java.io.IOException
import java.net.SocketTimeoutException
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Response

class ApiErrorMapperTest {
    private val mapper = ApiErrorMapper(JsonFactory.strict())

    @Test fun `FastAPI 422 becomes field validation without rejected input`() {
        val body = """{"detail":[{"loc":["body","profile","age"],"msg":"required","type":"missing","input":"private"}]}"""
        assertEquals(ApiError.Validation(mapOf("profile.age" to listOf("required"))), mapper.map(http(422, body)))
    }

    @Test fun `HTTP status matrix is normalized`() {
        val expected = mapOf(400 to ApiError.Rejected(400), 401 to ApiError.Unauthorized, 403 to ApiError.Forbidden, 404 to ApiError.NotFound, 409 to ApiError.Rejected(409), 413 to ApiError.Rejected(413), 429 to ApiError.RateLimited(null), 500 to ApiError.Server, 502 to ApiError.Server, 503 to ApiError.ServiceUnavailable, 504 to ApiError.Server)
        expected.forEach { (code, error) -> assertEquals("status $code", error, mapper.map(http(code))) }
    }

    @Test fun `timeouts and interrupted sockets are normalized`() {
        assertEquals(ApiError.Timeout, mapper.map(SocketTimeoutException()))
        assertEquals(ApiError.Offline, mapper.map(IOException()))
    }

    private fun http(code: Int, body: String = "{}") = HttpException(Response.error<Unit>(code, body.toResponseBody()))
}
