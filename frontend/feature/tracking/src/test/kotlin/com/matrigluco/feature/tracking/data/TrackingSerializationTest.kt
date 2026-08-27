package com.matrigluco.feature.tracking.data

import com.matrigluco.core.network.serialization.JsonFactory
import kotlinx.serialization.decodeFromString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class TrackingSerializationTest {

    private val json = JsonFactory.strict()

    @Test
    fun deserializesMeasurementListResponse() {
        val payload = """
        {
            "items": [
                {
                    "id": "meas-1",
                    "user_id": "user-123",
                    "metric_type": "glucose",
                    "value_primary": 150.0,
                    "value_secondary": null,
                    "unit": "mg/dL",
                    "measured_at": "2026-08-27T07:47:00Z",
                    "source": "manual",
                    "notes": "Fasting",
                    "created_at": "2026-08-27T07:47:00Z"
                },
                {
                    "id": "meas-2",
                    "user_id": "user-123",
                    "metric_type": "blood_pressure",
                    "value_primary": 120.0,
                    "value_secondary": 80.0,
                    "unit": "mmHg",
                    "measured_at": "2026-08-18T06:48:00Z",
                    "source": "manual",
                    "notes": null,
                    "created_at": "2026-08-18T06:48:00Z"
                }
            ],
            "total": 2,
            "page": 1,
            "page_size": 100
        }
        """.trimIndent()

        val listDto = json.decodeFromString<MeasurementListDto>(payload)
        assertEquals(2, listDto.items.size)
        assertEquals("glucose", listDto.items[0].metricType)
        assertEquals(150.0, listDto.items[0].valuePrimary, 0.001)
        assertEquals("blood_pressure", listDto.items[1].metricType)
        assertEquals(120.0, listDto.items[1].valuePrimary, 0.001)
        assertEquals(80.0, listDto.items[1].valueSecondary!!, 0.001)
    }
}
