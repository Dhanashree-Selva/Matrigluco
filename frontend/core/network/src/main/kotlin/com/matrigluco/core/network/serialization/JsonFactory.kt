package com.matrigluco.core.network.serialization

import kotlinx.serialization.json.Json

object JsonFactory {
    fun strict(): Json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
        isLenient = false
        coerceInputValues = false
    }
}
