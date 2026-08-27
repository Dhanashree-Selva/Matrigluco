package com.matrigluco.core.designsystem.accessibility

import org.junit.Assert.assertEquals
import org.junit.Test

class MetricSemanticDescriptionTest {
    @Test fun `includes exact value unit time and supplied status`() {
        assertEquals("Glucose, 102, mg/dL, 8:30 AM, Ready for review", MetricSemanticDescription.build("Glucose", "102", "mg/dL", "8:30 AM", "Ready for review"))
    }
    @Test fun `does not announce an absent status`() {
        assertEquals("Weight, 64, kg, Today", MetricSemanticDescription.build("Weight", "64", "kg", "Today"))
    }
}
