package com.matrigluco.app.navigation

import com.matrigluco.core.ui.adaptive.AppLayoutMode
import org.junit.Assert.assertEquals
import org.junit.Test

class AppShellPolicyTest {
    private val protectedChrome = DestinationChrome(TopBarMode.ROOT, showPrimaryNavigation = true)
    private val publicChrome = DestinationChrome(TopBarMode.HIDDEN, showPrimaryNavigation = false)

    @Test fun compactProtectedDestinationUsesBottomNavigation() {
        assertEquals(PrimaryNavigationVisibility(true, false), AppShellPolicy.primaryNavigation(protectedChrome, AppLayoutMode.COMPACT))
    }

    @Test fun mediumAndExpandedProtectedDestinationsUseRail() {
        assertEquals(PrimaryNavigationVisibility(false, true), AppShellPolicy.primaryNavigation(protectedChrome, AppLayoutMode.MEDIUM))
        assertEquals(PrimaryNavigationVisibility(false, true), AppShellPolicy.primaryNavigation(protectedChrome, AppLayoutMode.EXPANDED))
    }

    @Test fun publicDestinationNeverShowsProtectedNavigation() {
        AppLayoutMode.entries.forEach { mode ->
            assertEquals(PrimaryNavigationVisibility(false, false), AppShellPolicy.primaryNavigation(publicChrome, mode))
        }
    }
}
