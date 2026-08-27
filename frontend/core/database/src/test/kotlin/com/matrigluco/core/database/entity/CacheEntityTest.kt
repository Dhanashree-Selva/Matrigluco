package com.matrigluco.core.database.entity

import java.math.BigDecimal
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertEquals
import org.junit.Test

class CacheEntityTest {
    @Test fun `same server id remains isolated by owner`() { val a = row("a"); val b = row("b"); assertNotEquals(a, b); assertEquals(BigDecimal("98.125"), BigDecimal(a.numericValueDecimal)) }
    private fun row(owner: String) = HealthMeasurementEntity(owner, "same-server-id", "glucose", "98.125", null, null, "mg/dL", 1, 2)
}
