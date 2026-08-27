package com.matrigluco.core.common.config

data class AppConfig(val apiBaseUrl: String, val environment: AppEnvironment, val debugToolsEnabled: Boolean)

enum class AppEnvironment {
    DEBUG, STAGING, RELEASE;

    companion object {
        fun from(value: String): AppEnvironment = entries.firstOrNull { it.name.equals(value, true) }
            ?: error("Unsupported app environment: $value")
    }
}
