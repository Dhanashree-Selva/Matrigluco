package com.matrigluco.core.database.dao

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.matrigluco.core.database.MatriglucoDatabase
import com.matrigluco.core.database.entity.HealthMeasurementEntity
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class HealthMeasurementDaoTest {
    private lateinit var database: MatriglucoDatabase
    private lateinit var dao: HealthMeasurementDao

    @Before fun createDatabase() {
        database = Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext<Context>(), MatriglucoDatabase::class.java).allowMainThreadQueries().build()
        dao = database.healthMeasurements()
    }

    @After fun closeDatabase() = database.close()

    @Test fun replaceIsOwnerScopedOrderedAndAtomic() = runBlocking {
        dao.upsertAll(listOf(row("owner-b", "shared", 5)))
        dao.replace("owner-a", listOf(row("owner-a", "older", 10), row("owner-a", "newer", 20)))
        assertEquals(listOf("newer", "older"), dao.observe("owner-a", 10).first().map { it.serverId })
        assertEquals(listOf("shared"), dao.observe("owner-b", 10).first().map { it.serverId })
        try { dao.replace("owner-a", listOf(row("wrong-owner", "bad", 30))); fail("Expected owner-scope rejection") } catch (_: IllegalArgumentException) { }
        assertEquals(2, dao.observe("owner-a", 10).first().size)
    }

    @Test fun upsertReplacesSameServerRecord() = runBlocking {
        dao.upsertAll(listOf(row("owner-a", "server", 10, "0"), row("owner-a", "server", 20, "95.5")))
        val stored = dao.observe("owner-a", 10).first().single()
        assertEquals(20, stored.measuredAtEpochMillis)
        assertEquals("95.5", stored.numericValueDecimal)
    }

    private fun row(owner: String, id: String, measuredAt: Long, value: String = "0") = HealthMeasurementEntity(owner, id, "synthetic_metric", value, null, null, "test-unit", measuredAt, 100)
}
