package com.matrigluco.feature.dashboard.presentation

import com.matrigluco.feature.dashboard.domain.DashboardSnapshot
import com.matrigluco.feature.dashboard.domain.MeasurementSnapshot
import org.junit.Assert.assertTrue
import org.junit.Test

class DashboardStatePolicyTest {
    @Test fun emptySnapshotProducesTruthfulEmptyState() {
        assertTrue(DashboardStatePolicy.from(DashboardSnapshot()) is DashboardUiState.Empty)
    }

    @Test fun realMeasurementProducesContent() {
        val snapshot = DashboardSnapshot(
            measurements = listOf(
                MeasurementSnapshot(
                    metric = "glucose",
                    displayName = "Blood Glucose",
                    value = "102",
                    secondaryValue = null,
                    unit = "mg/dL",
                    measuredAt = "2026-08-21T10:00:00Z"
                )
            )
        )
        assertTrue(DashboardStatePolicy.from(snapshot) is DashboardUiState.Content)
    }
}
