package com.matrigluco.core.designsystem.component.appbar

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class OrbitAppBarConfigTest {

    @Test
    fun rootModeCreatesExpectedDefaults() {
        var notifClicked = false
        val actions = listOf(OrbitAppBarAction.Notifications(unreadCount = 2) { notifClicked = true })
        val config = OrbitAppBarConfig.root(
            title = "Dashboard",
            eyebrow = "CARE ORBIT WORKSPACE",
            badgeText = "WEEK 27",
            actions = actions
        )

        assertEquals(OrbitAppBarMode.ROOT, config.mode)
        assertEquals("Dashboard", config.title)
        assertEquals("CARE ORBIT WORKSPACE", config.eyebrow)
        assertEquals("WEEK 27", config.badgeText)
        assertFalse("Root mode must not show back button", config.showBack)
        assertEquals(1, config.actions.size)
        val notifAction = config.actions.first() as OrbitAppBarAction.Notifications
        assertEquals(2, notifAction.unreadCount)
        notifAction.onClick()
        assertTrue(notifClicked)
    }

    @Test
    fun detailModeEnablesBackNavigation() {
        var backClicked = false
        val config = OrbitAppBarConfig.detail(
            title = "Report Details",
            subtitle = "Aug 18, 2026",
            onBackClick = { backClicked = true }
        )

        assertEquals(OrbitAppBarMode.DETAIL, config.mode)
        assertEquals("Report Details", config.title)
        assertEquals("Aug 18, 2026", config.subtitle)
        assertTrue("Detail mode must show back button", config.showBack)
        config.onBackClick?.invoke()
        assertTrue(backClicked)
    }

    @Test
    fun flowModeSetsStepMetadata() {
        val config = OrbitAppBarConfig.flow(
            title = "Assessment",
            stepText = "Step 2 of 5"
        )

        assertEquals(OrbitAppBarMode.FLOW, config.mode)
        assertEquals("Assessment", config.title)
        assertEquals("Step 2 of 5", config.eyebrow)
        assertTrue(config.showBack)
    }

    @Test
    fun searchModeHandlesQueryAndClose() {
        var closed = false
        var updatedQuery = ""
        val config = OrbitAppBarConfig.search(
            hint = "Search timeline...",
            initialQuery = "glucose",
            onQueryChange = { updatedQuery = it },
            onClose = { closed = true }
        )

        assertEquals(OrbitAppBarMode.SEARCH, config.mode)
        assertEquals("Search timeline...", config.searchHint)
        assertEquals("glucose", config.searchQuery)
        assertTrue(config.showBack)
        config.onSearchQueryChange?.invoke("fasting")
        assertEquals("fasting", updatedQuery)
        config.onCloseSearch?.invoke()
        assertTrue(closed)
    }

    @Test
    fun hiddenModeHasNoTitleOrBack() {
        val config = OrbitAppBarConfig.hidden()
        assertEquals(OrbitAppBarMode.HIDDEN, config.mode)
        assertFalse(config.showBack)
        assertNull(config.subtitle)
    }

    @Test
    fun filterActionStateTracksActiveStatus() {
        val filterAction = OrbitAppBarAction.Filter(isFiltered = true) {}
        assertTrue(filterAction.isFiltered)

        val inactiveFilter = OrbitAppBarAction.Filter(isFiltered = false) {}
        assertFalse(inactiveFilter.isFiltered)
    }

    @Test
    fun profileActionStoresInitials() {
        val profile = OrbitAppBarAction.Profile(initials = "EC") {}
        assertEquals("EC", profile.initials)
    }
}
