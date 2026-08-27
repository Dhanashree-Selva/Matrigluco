package com.matrigluco.core.ui.layout

import org.junit.Assert.assertEquals
import org.junit.Test

class ContentWidthPolicyTest {
    @Test fun compactContentUsesAvailableWidth() {
        assertEquals(360, ContentWidthPolicy.boundedWidth(360, 760))
    }

    @Test fun expandedContentStopsAtReadableMaximum() {
        assertEquals(760, ContentWidthPolicy.boundedWidth(1280, 760))
    }
}
