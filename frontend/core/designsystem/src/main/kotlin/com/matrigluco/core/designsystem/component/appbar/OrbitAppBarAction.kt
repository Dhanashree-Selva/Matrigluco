package com.matrigluco.core.designsystem.component.appbar

import androidx.annotation.DrawableRes

/**
 * Domain-neutral action models for OrbitAppBar using Hugeicons.
 */
sealed interface OrbitAppBarAction {
    /**
     * Notifications action with optional unread badge count and accessibility semantics.
     */
    data class Notifications(
        val unreadCount: Int = 0,
        val onClick: () -> Unit
    ) : OrbitAppBarAction

    /**
     * Search action to activate search mode or open search destination.
     */
    data class Search(
        val onClick: () -> Unit
    ) : OrbitAppBarAction

    /**
     * Filter action with active state indicator.
     */
    data class Filter(
        val isFiltered: Boolean = false,
        val onClick: () -> Unit
    ) : OrbitAppBarAction

    /**
     * Overflow/More menu action.
     */
    data class More(
        val onClick: () -> Unit
    ) : OrbitAppBarAction

    /**
     * Close modal or dismissible flow action.
     */
    data class Close(
        val onClick: () -> Unit
    ) : OrbitAppBarAction

    /**
     * Profile/Account action with optional user initials.
     */
    data class Profile(
        val initials: String? = null,
        val onClick: () -> Unit
    ) : OrbitAppBarAction

    /**
     * Custom icon action with task-based accessibility description.
     */
    data class Custom(
        val id: String,
        @DrawableRes val iconRes: Int,
        val contentDescription: CharSequence,
        val onClick: () -> Unit
    ) : OrbitAppBarAction

    /**
     * Text-based action button (e.g. "Save", "Skip", "Done").
     */
    data class ActionText(
        val id: String,
        val text: CharSequence,
        val onClick: () -> Unit
    ) : OrbitAppBarAction
}
