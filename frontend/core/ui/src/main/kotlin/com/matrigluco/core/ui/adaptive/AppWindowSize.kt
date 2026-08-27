package com.matrigluco.core.ui.adaptive

enum class AppLayoutMode { COMPACT, MEDIUM, EXPANDED }

object AppWindowSize {
    fun fromWidthDp(widthDp: Int): AppLayoutMode = when {
        widthDp < 600 -> AppLayoutMode.COMPACT
        widthDp < 840 -> AppLayoutMode.MEDIUM
        else -> AppLayoutMode.EXPANDED
    }
}
