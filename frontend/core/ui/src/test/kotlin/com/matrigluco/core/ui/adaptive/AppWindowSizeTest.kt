package com.matrigluco.core.ui.adaptive

import org.junit.Assert.assertEquals
import org.junit.Test

class AppWindowSizeTest {
    @Test fun `compact below 600`() = assertEquals(AppLayoutMode.COMPACT, AppWindowSize.fromWidthDp(599))
    @Test fun `medium from 600 through 839`() { assertEquals(AppLayoutMode.MEDIUM, AppWindowSize.fromWidthDp(600)); assertEquals(AppLayoutMode.MEDIUM, AppWindowSize.fromWidthDp(839)) }
    @Test fun `expanded from 840`() = assertEquals(AppLayoutMode.EXPANDED, AppWindowSize.fromWidthDp(840))
}
