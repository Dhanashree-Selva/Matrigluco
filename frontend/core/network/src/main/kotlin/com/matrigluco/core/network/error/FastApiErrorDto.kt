package com.matrigluco.core.network.error

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable data class FastApiErrorDto(val detail: JsonElement? = null)
@Serializable data class FastApiValidationIssueDto(
    val loc: List<JsonElement> = emptyList(),
    val msg: String,
    val type: String? = null,
    @SerialName("input") val rejectedInput: JsonElement? = null,
)
