package com.matrigluco.feature.assessment.presentation

import android.content.res.ColorStateList
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.core.content.ContextCompat
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.matrigluco.core.designsystem.R as DesignR
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.configureOrbitAppBar
import com.matrigluco.feature.assessment.databinding.FragmentAssessmentBinding
import com.matrigluco.feature.assessment.domain.model.AssessmentFieldKey
import com.matrigluco.feature.assessment.domain.model.AssessmentResult
import com.matrigluco.feature.assessment.domain.model.AssessmentViewMode
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AssessmentFragment : Fragment() {

    private var _binding: FragmentAssessmentBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AssessmentViewModel by viewModels()

    private var isProgrammaticUpdate = false

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAssessmentBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupInputWatchers()
        setupListeners()

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    private fun setupListeners() {
        binding.btnBeginAssessment.setOnClickListener {
            viewModel.beginAssessment()
            binding.assessmentScroll.smoothScrollTo(0, 0)
        }

        binding.btnPreviousStep.setOnClickListener {
            viewModel.previousStep()
            binding.assessmentScroll.smoothScrollTo(0, 0)
        }

        binding.btnNextStep.setOnClickListener {
            viewModel.nextStep()
            binding.assessmentScroll.smoothScrollTo(0, 0)
        }

        binding.btnRestartAssessment.setOnClickListener {
            viewModel.restartAssessment()
            binding.assessmentScroll.smoothScrollTo(0, 0)
        }
    }

    private fun setupInputWatchers() {
        bindField(binding.inputAge, AssessmentFieldKey.AGE)
        bindField(binding.inputPregnancies, AssessmentFieldKey.PREGNANCIES)
        bindField(binding.inputGlucose, AssessmentFieldKey.GLUCOSE)
        bindField(binding.inputBloodPressure, AssessmentFieldKey.BLOOD_PRESSURE)
        bindField(binding.inputSkinThickness, AssessmentFieldKey.SKIN_THICKNESS)
        bindField(binding.inputInsulin, AssessmentFieldKey.INSULIN)
        bindField(binding.inputBmi, AssessmentFieldKey.BMI)
        bindField(binding.inputDpf, AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION)
    }

    private fun bindField(editText: EditText, key: AssessmentFieldKey) {
        editText.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                viewModel.setFocusedField(key)
            }
        }

        editText.doAfterTextChanged { text ->
            if (!isProgrammaticUpdate) {
                viewModel.updateFieldValue(key, text?.toString() ?: "")
            }
        }
    }

    private fun render(state: AssessmentUiState) {
        val b = binding

        when (state.mode) {
            AssessmentViewMode.INTRO -> {
                b.introContainer.visibility = View.VISIBLE
                b.guidedStepsContainer.visibility = View.GONE
                b.resultContainer.visibility = View.GONE

                configureOrbitAppBar(
                    OrbitAppBarConfig.root(
                        title = "Risk Assessment",
                        eyebrow = "CLINICAL RISK EVALUATION",
                        badgeText = "MODEL V1.0.0",
                        subtitle = "Gestational diabetes evaluation"
                    )
                )
            }
            AssessmentViewMode.GUIDED_STEPS -> {
                b.introContainer.visibility = View.GONE
                b.guidedStepsContainer.visibility = View.VISIBLE
                b.resultContainer.visibility = View.GONE

                configureOrbitAppBar(
                    OrbitAppBarConfig.flow(
                        title = "Stage ${state.currentStepIndex + 1} of 5",
                        stepText = "ASSESSMENT PATH",
                        onBackClick = { viewModel.previousStep() }
                    )
                )

                renderGuidedSteps(state)
            }
            AssessmentViewMode.RESULT -> {
                b.introContainer.visibility = View.GONE
                b.guidedStepsContainer.visibility = View.GONE
                b.resultContainer.visibility = View.VISIBLE

                configureOrbitAppBar(
                    OrbitAppBarConfig.detail(
                        title = "Assessment Summary",
                        subtitle = "Calibrated clinical risk band",
                        onBackClick = { viewModel.restartAssessment() }
                    )
                )

                if (state.result != null) {
                    renderResult(state.result)
                }
            }
        }
    }

    private fun renderGuidedSteps(state: AssessmentUiState) {
        val b = binding
        val step = state.currentStep

        b.stepProgressPercent.text = "${state.progressPercent}%"
        b.stageCounter.text = "Stage ${state.currentStepIndex + 1} of 5"

        // Update progress indicator pills
        val pinkColor = ContextCompat.getColor(requireContext(), DesignR.color.care_pink)
        val surfaceRaised = ContextCompat.getColor(requireContext(), DesignR.color.care_surface_raised)
        val textMuted = ContextCompat.getColor(requireContext(), DesignR.color.care_text_muted)
        val textWhite = ContextCompat.getColor(requireContext(), DesignR.color.care_on_accent)

        val pills = listOf(b.pillStage1, b.pillStage2, b.pillStage3, b.pillStage4, b.pillStage5)
        pills.forEachIndexed { index, pill ->
            if (index <= state.currentStepIndex) {
                pill.backgroundTintList = ColorStateList.valueOf(pinkColor)
                pill.setTextColor(textWhite)
            } else {
                pill.backgroundTintList = ColorStateList.valueOf(surfaceRaised)
                pill.setTextColor(textMuted)
            }
        }

        // Current Stage Text
        b.stageEyebrow.text = step.eyebrow
        b.stageTitle.text = step.title
        b.stageDescription.text = step.description

        // Stage Input Containers Visibility
        b.containerStage1.visibility = if (state.currentStepIndex == 0) View.VISIBLE else View.GONE
        b.containerStage2.visibility = if (state.currentStepIndex == 1) View.VISIBLE else View.GONE
        b.containerStage3.visibility = if (state.currentStepIndex == 2) View.VISIBLE else View.GONE
        b.containerStage4.visibility = if (state.currentStepIndex == 3) View.VISIBLE else View.GONE
        b.containerStage5.visibility = if (state.currentStepIndex == 4) View.VISIBLE else View.GONE

        // Update Field Values
        isProgrammaticUpdate = true
        b.inputAge.setTextIfDifferent(state.fieldValues[AssessmentFieldKey.AGE] ?: "")
        b.inputPregnancies.setTextIfDifferent(state.fieldValues[AssessmentFieldKey.PREGNANCIES] ?: "")
        b.inputGlucose.setTextIfDifferent(state.fieldValues[AssessmentFieldKey.GLUCOSE] ?: "")
        b.inputBloodPressure.setTextIfDifferent(state.fieldValues[AssessmentFieldKey.BLOOD_PRESSURE] ?: "")
        b.inputSkinThickness.setTextIfDifferent(state.fieldValues[AssessmentFieldKey.SKIN_THICKNESS] ?: "")
        b.inputInsulin.setTextIfDifferent(state.fieldValues[AssessmentFieldKey.INSULIN] ?: "")
        b.inputBmi.setTextIfDifferent(state.fieldValues[AssessmentFieldKey.BMI] ?: "")
        b.inputDpf.setTextIfDifferent(state.fieldValues[AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION] ?: "")
        isProgrammaticUpdate = false

        // Update Field Errors
        b.layoutAge.error = state.fieldErrors[AssessmentFieldKey.AGE]
        b.layoutPregnancies.error = state.fieldErrors[AssessmentFieldKey.PREGNANCIES]
        b.layoutGlucose.error = state.fieldErrors[AssessmentFieldKey.GLUCOSE]
        b.layoutBloodPressure.error = state.fieldErrors[AssessmentFieldKey.BLOOD_PRESSURE]
        b.layoutSkinThickness.error = state.fieldErrors[AssessmentFieldKey.SKIN_THICKNESS]
        b.layoutInsulin.error = state.fieldErrors[AssessmentFieldKey.INSULIN]
        b.layoutBmi.error = state.fieldErrors[AssessmentFieldKey.BMI]
        b.layoutDpf.error = state.fieldErrors[AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION]

        // Review Ledger Summary for Stage 5
        if (state.currentStepIndex == 4) {
            val sb = StringBuilder()
            for (key in AssessmentFieldKey.entries) {
                val value = state.fieldValues[key] ?: "--"
                sb.append("• ${key.displayName}: $value ${key.unit}\n")
            }
            sb.append("\nAll 8 inputs verified. Ready for clinical ML model inference.")
            b.reviewSummaryText.text = sb.toString()
        }

        // Active Context Card
        val focusedKey = state.activeFocusedField
        b.contextFieldBadge.text = focusedKey.name.replace("_", " ")
        b.contextTitle.text = focusedKey.displayName
        b.contextUnit.text = focusedKey.unit
        b.contextAcceptedRange.text = "${focusedKey.min.toInt()}–${focusedKey.max.toInt()}"
        b.contextExplanation.text = focusedKey.detailedExplanation

        // Buttons
        b.btnPreviousStep.setText(if (state.isFirstStep) "< Overview" else "< Previous")
        b.btnNextStep.setText(if (state.isReviewStep) "Run Evaluation >" else "Continue >")
    }

    private fun renderResult(result: AssessmentResult) {
        val b = binding

        b.resultRiskBandBadge.text = "${result.riskBand.displayName.uppercase()} BAND"
        b.resultProbabilityScore.text = "${result.probabilityPercent} Estimated Probability"
        b.resultPredictionTitle.text = result.predictionResult
        b.resultModelInfo.text = "Evaluated by LogisticRegression v${result.modelVersion} (scikit-learn)"

        val sb = StringBuilder()
        for (key in AssessmentFieldKey.entries) {
            val snakeKey = when (key) {
                AssessmentFieldKey.AGE -> "age"
                AssessmentFieldKey.PREGNANCIES -> "pregnancies"
                AssessmentFieldKey.GLUCOSE -> "glucose"
                AssessmentFieldKey.BLOOD_PRESSURE -> "blood_pressure"
                AssessmentFieldKey.SKIN_THICKNESS -> "skin_thickness"
                AssessmentFieldKey.INSULIN -> "insulin"
                AssessmentFieldKey.BMI -> "bmi"
                AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION -> "diabetes_pedigree_function"
            }
            val v = result.featuresSnapshot[key.modelKey]
                ?: result.featuresSnapshot[snakeKey]
                ?: result.featuresSnapshot[key.name.lowercase()]
                ?: result.featuresSnapshot[key.displayName]
            val valStr = if (v != null) {
                if (key.isDecimal) String.format(java.util.Locale.US, "%.1f", v)
                else String.format(java.util.Locale.US, "%.0f", v)
            } else "--"
            sb.append("• ${key.displayName}: $valStr ${key.unit}\n")
        }
        b.resultFeatureSnapshotText.text = sb.toString()
    }

    private fun EditText.setTextIfDifferent(newText: String) {
        if (text?.toString() != newText) {
            setText(newText)
            setSelection(newText.length)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
