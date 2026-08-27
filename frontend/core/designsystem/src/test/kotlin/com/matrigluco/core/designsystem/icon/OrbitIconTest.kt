package com.matrigluco.core.designsystem.icon

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class OrbitIconTest {
    @Test fun `every semantic icon has a compile time drawable mapping`() = assertTrue(OrbitIcon.entries.all { it.drawableRes != 0 })
    @Test fun `primary navigation mappings are distinct`() {
        val primary = listOf(OrbitIcon.Home, OrbitIcon.Tracking, OrbitIcon.Assessment, OrbitIcon.Assistant, OrbitIcon.More)
        assertEquals(primary.size, primary.map { it.drawableRes }.toSet().size)
    }
}
