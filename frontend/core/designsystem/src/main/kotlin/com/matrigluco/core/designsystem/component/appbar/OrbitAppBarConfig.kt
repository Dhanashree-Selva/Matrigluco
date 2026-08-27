package com.matrigluco.core.designsystem.component.appbar

/**
 * Immutable typed configuration supplied to OrbitAppBar by Fragment or app shell controller.
 */
data class OrbitAppBarConfig(
    val mode: OrbitAppBarMode = OrbitAppBarMode.ROOT,
    val title: CharSequence = "",
    val subtitle: CharSequence? = null,
    val eyebrow: CharSequence? = null,
    val badgeText: CharSequence? = null,
    val showBack: Boolean = false,
    val onBackClick: (() -> Unit)? = null,
    val actions: List<OrbitAppBarAction> = emptyList(),
    val status: OrbitAppBarStatus? = null,
    val searchHint: CharSequence? = null,
    val searchQuery: String? = null,
    val onSearchQueryChange: ((String) -> Unit)? = null,
    val onCloseSearch: (() -> Unit)? = null
) {
    companion object {
        fun root(
            title: CharSequence,
            eyebrow: CharSequence? = null,
            badgeText: CharSequence? = null,
            subtitle: CharSequence? = null,
            actions: List<OrbitAppBarAction> = emptyList()
        ) = OrbitAppBarConfig(
            mode = OrbitAppBarMode.ROOT,
            title = title,
            eyebrow = eyebrow,
            badgeText = badgeText,
            subtitle = subtitle,
            showBack = false,
            actions = actions
        )

        fun detail(
            title: CharSequence,
            eyebrow: CharSequence? = null,
            badgeText: CharSequence? = null,
            subtitle: CharSequence? = null,
            actions: List<OrbitAppBarAction> = emptyList(),
            onBackClick: (() -> Unit)? = null
        ) = OrbitAppBarConfig(
            mode = OrbitAppBarMode.DETAIL,
            title = title,
            eyebrow = eyebrow,
            badgeText = badgeText,
            subtitle = subtitle,
            showBack = true,
            onBackClick = onBackClick,
            actions = actions
        )

        fun flow(
            title: CharSequence,
            stepText: CharSequence? = null,
            onBackClick: (() -> Unit)? = null,
            actions: List<OrbitAppBarAction> = emptyList()
        ) = OrbitAppBarConfig(
            mode = OrbitAppBarMode.FLOW,
            title = title,
            eyebrow = stepText,
            showBack = true,
            onBackClick = onBackClick,
            actions = actions
        )

        fun search(
            hint: CharSequence? = null,
            initialQuery: String? = null,
            onQueryChange: ((String) -> Unit)? = null,
            onClose: (() -> Unit)? = null
        ) = OrbitAppBarConfig(
            mode = OrbitAppBarMode.SEARCH,
            searchHint = hint,
            searchQuery = initialQuery,
            onSearchQueryChange = onQueryChange,
            onCloseSearch = onClose,
            showBack = true,
            onBackClick = onClose
        )

        fun hidden() = OrbitAppBarConfig(mode = OrbitAppBarMode.HIDDEN)
    }
}
