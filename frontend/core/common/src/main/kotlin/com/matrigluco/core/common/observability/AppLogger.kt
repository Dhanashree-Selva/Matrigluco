package com.matrigluco.core.common.observability

enum class LogLevel { DEBUG, INFO, WARN, ERROR }

data class DiagnosticEvent(
    val name: String,
    val attributes: Map<String, String> = emptyMap(),
)

fun interface AppLogger {
    fun log(level: LogLevel, event: DiagnosticEvent, cause: Throwable?)
}

object NoOpAppLogger : AppLogger {
    override fun log(level: LogLevel, event: DiagnosticEvent, cause: Throwable?) = Unit
}

interface CrashReporter {
    fun record(cause: Throwable, attributes: Map<String, String> = emptyMap())
}

object NoOpCrashReporter : CrashReporter {
    override fun record(cause: Throwable, attributes: Map<String, String>) = Unit
}
