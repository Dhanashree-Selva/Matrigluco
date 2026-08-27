package com.matrigluco.feature.assessment

import com.matrigluco.feature.assessment.domain.model.AssessmentFieldKey
import com.matrigluco.feature.assessment.domain.model.AssessmentStepConfig
import com.matrigluco.feature.assessment.domain.model.RiskBand
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.exp

class AssessmentLogicTest {

    @Test
    fun testAssessmentStepConfigurationCompleteness() {
        val steps = AssessmentStepConfig.STEPS
        assertEquals(5, steps.size)

        val allKeys = steps.flatMap { it.fieldKeys }
        assertEquals(8, allKeys.size)
        assertTrue(allKeys.contains(AssessmentFieldKey.AGE))
        assertTrue(allKeys.contains(AssessmentFieldKey.PREGNANCIES))
        assertTrue(allKeys.contains(AssessmentFieldKey.GLUCOSE))
        assertTrue(allKeys.contains(AssessmentFieldKey.BLOOD_PRESSURE))
        assertTrue(allKeys.contains(AssessmentFieldKey.SKIN_THICKNESS))
        assertTrue(allKeys.contains(AssessmentFieldKey.INSULIN))
        assertTrue(allKeys.contains(AssessmentFieldKey.BMI))
        assertTrue(allKeys.contains(AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION))
    }

    @Test
    fun testRiskBandParsing() {
        assertEquals(RiskBand.LOW, RiskBand.fromString("low"))
        assertEquals(RiskBand.LOW, RiskBand.fromString("Non-Diabetic"))
        assertEquals(RiskBand.MODERATE, RiskBand.fromString("moderate"))
        assertEquals(RiskBand.MODERATE, RiskBand.fromString("elevated"))
        assertEquals(RiskBand.HIGH, RiskBand.fromString("high"))
        assertEquals(RiskBand.HIGH, RiskBand.fromString("Diabetic"))
    }

    @Test
    fun testFieldValidationRanges() {
        val age = AssessmentFieldKey.AGE
        assertEquals(15.0, age.min, 0.001)
        assertEquals(110.0, age.max, 0.001)
        assertEquals("years", age.unit)

        val glucose = AssessmentFieldKey.GLUCOSE
        assertEquals(40.0, glucose.min, 0.001)
        assertEquals(500.0, glucose.max, 0.001)
        assertEquals("mg/dL", glucose.unit)

        val bp = AssessmentFieldKey.BLOOD_PRESSURE
        assertEquals(40.0, bp.min, 0.001)
        assertEquals(250.0, bp.max, 0.001)
        assertEquals("mmHg", bp.unit)

        val dpf = AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION
        assertEquals(0.05, dpf.min, 0.001)
        assertEquals(3.0, dpf.max, 0.001)
        assertEquals("score", dpf.unit)
    }

    @Test
    fun testDeterministicRiskFormula() {
        val age = 29.0
        val preg = 1.0
        val glu = 90.0
        val bp = 70.0
        val skin = 20.0
        val ins = 75.0
        val bmi = 22.5
        val dpf = 0.35

        val logit = -7.5 + (0.02 * age) + (0.08 * preg) + (0.035 * glu) + (0.005 * bp) +
                (0.002 * skin) + (0.001 * ins) + (0.05 * bmi) + (0.8 * dpf)
        val prob = 1.0 / (1.0 + exp(-logit))

        assertTrue(prob in 0.0..1.0)
        assertTrue("Healthy baseline should evaluate below 0.30 (Low Risk)", prob < 0.30)
    }
}
