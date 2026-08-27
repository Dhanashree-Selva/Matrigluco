package com.matrigluco.core.designsystem.component.appbar

/**
 * Compact contextual status metadata displayed near the title or context region.
 */
data class OrbitAppBarStatus(
    val text: CharSequence,
    val isWarning: Boolean = false
)
