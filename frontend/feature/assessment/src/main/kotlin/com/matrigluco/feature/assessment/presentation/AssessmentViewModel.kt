package com.matrigluco.feature.assessment.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.feature.assessment.data.AssessmentRepository
import com.matrigluco.feature.assessment.domain.model.AssessmentFieldKey
import com.matrigluco.feature.assessment.domain.model.AssessmentResult
import com.matrigluco.feature.assessment.domain.model.AssessmentStepConfig
import com.matrigluco.feature.assessment.domain.model.AssessmentStepDef
import com.matrigluco.feature.assessment.domain.model.AssessmentViewMode
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AssessmentUiState(
    val mode: AssessmentViewMode = AssessmentViewMode.INTRO,
    val currentStepIndex: Int = 0,
    val fieldValues: Map<AssessmentFieldKey, String> = mapOf(
        AssessmentFieldKey.AGE to "29",
        AssessmentFieldKey.PREGNANCIES to "1",
        AssessmentFieldKey.GLUCOSE to "102",
        AssessmentFieldKey.BLOOD_PRESSURE to "72",
        AssessmentFieldKey.SKIN_THICKNESS to "23",
        AssessmentFieldKey.INSULIN to "85",
        AssessmentFieldKey.BMI to "24.3",
        AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION to "0.45"
    ),
    val fieldErrors: Map<AssessmentFieldKey, String> = emptyMap(),
    val activeFocusedField: AssessmentFieldKey = AssessmentFieldKey.AGE,
    val isSubmitting: Boolean = false,
    val submissionError: String? = null,
    val result: AssessmentResult? = null
) {
    val currentStep: AssessmentStepDef get() = AssessmentStepConfig.STEPS.getOrElse(currentStepIndex) { AssessmentStepConfig.STEPS.first() }
    val progressPercent: Int get() = (currentStepIndex * 100) / (AssessmentStepConfig.STEPS.size - 1)
    val isFirstStep: Boolean get() = currentStepIndex == 0
    val isReviewStep: Boolean get() = currentStepIndex == AssessmentStepConfig.STEPS.size - 1
}

@HiltViewModel
class AssessmentViewModel @Inject constructor(
    private val repository: AssessmentRepository
) : ViewModel() {

    private val _state = MutableStateFlow(AssessmentUiState())
    val state: StateFlow<AssessmentUiState> = _state.asStateFlow()

    fun beginAssessment() {
        _state.update {
            it.copy(
                mode = AssessmentViewMode.GUIDED_STEPS,
                currentStepIndex = 0,
                activeFocusedField = AssessmentFieldKey.AGE,
                fieldErrors = emptyMap(),
                submissionError = null
            )
        }
    }

    fun setFocusedField(key: AssessmentFieldKey) {
        _state.update { it.copy(activeFocusedField = key) }
    }

    fun updateFieldValue(key: AssessmentFieldKey, value: String) {
        _state.update { current ->
            val updatedValues = current.fieldValues.toMutableMap().apply { put(key, value) }
            val updatedErrors = current.fieldErrors.toMutableMap().apply { remove(key) }
            current.copy(fieldValues = updatedValues, fieldErrors = updatedErrors)
        }
    }

    fun nextStep() {
        val current = _state.value
        val currentStep = current.currentStep

        // Validate fields for current step
        val errors = mutableMapOf<AssessmentFieldKey, String>()
        for (fieldKey in currentStep.fieldKeys) {
            val valueStr = current.fieldValues[fieldKey]?.trim() ?: ""
            if (valueStr.isEmpty()) {
                errors[fieldKey] = "${fieldKey.displayName} is required."
            } else {
                val num = valueStr.toDoubleOrNull()
                if (num == null) {
                    errors[fieldKey] = "Please enter a valid number."
                } else if (num < fieldKey.min || num > fieldKey.max) {
                    errors[fieldKey] = "Must be between ${fieldKey.min} and ${fieldKey.max} ${fieldKey.unit}."
                }
            }
        }

        if (errors.isNotEmpty()) {
            _state.update { it.copy(fieldErrors = errors) }
            return
        }

        if (current.isReviewStep) {
            submitEvaluation()
        } else {
            val nextIndex = current.currentStepIndex + 1
            val nextStep = AssessmentStepConfig.STEPS[nextIndex]
            val nextFocus = nextStep.fieldKeys.firstOrNull() ?: AssessmentFieldKey.AGE

            _state.update {
                it.copy(
                    currentStepIndex = nextIndex,
                    activeFocusedField = nextFocus,
                    fieldErrors = emptyMap()
                )
            }
        }
    }

    fun previousStep() {
        val current = _state.value
        if (current.isFirstStep) {
            _state.update { it.copy(mode = AssessmentViewMode.INTRO) }
        } else {
            val prevIndex = current.currentStepIndex - 1
            val prevStep = AssessmentStepConfig.STEPS[prevIndex]
            val prevFocus = prevStep.fieldKeys.firstOrNull() ?: AssessmentFieldKey.AGE
            _state.update {
                it.copy(
                    currentStepIndex = prevIndex,
                    activeFocusedField = prevFocus,
                    fieldErrors = emptyMap()
                )
            }
        }
    }

    fun restartAssessment() {
        _state.update {
            it.copy(
                mode = AssessmentViewMode.INTRO,
                currentStepIndex = 0,
                activeFocusedField = AssessmentFieldKey.AGE,
                fieldErrors = emptyMap(),
                submissionError = null,
                result = null
            )
        }
    }

    private fun submitEvaluation() {
        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true, submissionError = null) }

            val parsedInputs = mutableMapOf<AssessmentFieldKey, Double>()
            for (key in AssessmentFieldKey.entries) {
                val num = _state.value.fieldValues[key]?.toDoubleOrNull() ?: key.min
                parsedInputs[key] = num
            }

            when (val res = repository.submitAssessment(parsedInputs)) {
                is ApiResult.Success -> {
                    _state.update {
                        it.copy(
                            isSubmitting = false,
                            result = res.value,
                            mode = AssessmentViewMode.RESULT
                        )
                    }
                }
                is ApiResult.Failure -> {
                    _state.update {
                        it.copy(
                            isSubmitting = false,
                            submissionError = "Unable to process evaluation. Please try again."
                        )
                    }
                }
            }
        }
    }
}
