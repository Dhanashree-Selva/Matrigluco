package com.matrigluco.core.designsystem.component.appbar

import androidx.fragment.app.Fragment

/**
 * Interface implemented by host Activity/AppShell to control the canonical top OrbitAppBar.
 */
interface OrbitAppBarHost {
    fun configureAppBar(config: OrbitAppBarConfig)
    fun setAppBarScrolled(isScrolled: Boolean)
}

/**
 * Convenient fragment extension to configure the shared top OrbitAppBar declaratively.
 */
fun Fragment.configureOrbitAppBar(config: OrbitAppBarConfig) {
    (activity as? OrbitAppBarHost)?.configureAppBar(config)
}

/**
 * Convenient fragment extension to update the app bar scroll/elevation state.
 */
fun Fragment.setOrbitAppBarScrolled(isScrolled: Boolean) {
    (activity as? OrbitAppBarHost)?.setAppBarScrolled(isScrolled)
}
