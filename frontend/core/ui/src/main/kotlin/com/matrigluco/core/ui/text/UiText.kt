package com.matrigluco.core.ui.text

import androidx.annotation.StringRes

sealed interface UiText {
    data class Resource(@StringRes val resId: Int, val args: List<Any> = emptyList()) : UiText
    data class Dynamic(val value: String) : UiText
}
