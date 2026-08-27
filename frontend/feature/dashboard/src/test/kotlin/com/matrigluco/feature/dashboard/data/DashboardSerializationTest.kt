package com.matrigluco.feature.dashboard.data

import com.matrigluco.core.network.serialization.JsonFactory
import kotlinx.serialization.decodeFromString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class DashboardSerializationTest {

    private val json = JsonFactory.strict()

    @Test
    fun deserializesBackendSummaryWithNullsAndRealMetrics() {
        val payload = """
        {
            "latest_measurements": {
                "glucose": {
                    "metric_type": "glucose",
                    "value": 150.0,
                    "unit": "mg/dL",
                    "measured_at": "2026-08-27T07:47:00"
                },
                "blood_pressure": {
                    "systolic": 120.0,
                    "diastolic": 80.0,
                    "unit": "mmHg",
                    "measured_at": "2026-08-18T06:48:00"
                },
                "weight": {
                    "metric_type": "weight",
                    "value": 70.0,
                    "unit": "kg",
                    "measured_at": "2026-08-18T15:02:00"
                },
                "bmi": {
                    "metric_type": "bmi",
                    "value": 27.0,
                    "unit": "kg/m²",
                    "measured_at": "2026-08-18T15:03:00"
                },
                "hba1c": null
            },
            "recent_prediction": {
                "id": "4cb00e9a-e32e-4fb9-bd06-c4c1f114ff85",
                "probability": 0.206211,
                "probability_score": 0.206211,
                "risk_band": "low",
                "prediction_result": "Non-Diabetic",
                "created_at": "2026-08-17T21:06:21.458360Z"
            },
            "measurement_counts": {
                "total_7_days": 1,
                "total_30_days": 8
            },
            "recent_activities": [
                {
                    "id": "meas-1",
                    "type": "measurement",
                    "title": "Glucose Recorded",
                    "description": "150.0 mg/dL logged.",
                    "timestamp": "2026-08-27T07:47:00",
                    "path": "/app/tracking",
                    "is_upcoming": false
                }
            ]
        }
        """.trimIndent()

        val dto = json.decodeFromString<DashboardDto>(payload)

        assertEquals(5, dto.latestMeasurements.size)
        assertNotNull(dto.latestMeasurements["glucose"])
        assertNull(dto.latestMeasurements["hba1c"])
        assertNotNull(dto.recentPrediction)
        assertEquals("low", dto.recentPrediction?.riskBand)
        assertEquals(1, dto.measurementCounts?.total7Days)
        assertEquals(8, dto.measurementCounts?.total30Days)
        assertEquals(1, dto.recentActivities.size)
        assertEquals("Glucose Recorded", dto.recentActivities[0].title)
    }
}
