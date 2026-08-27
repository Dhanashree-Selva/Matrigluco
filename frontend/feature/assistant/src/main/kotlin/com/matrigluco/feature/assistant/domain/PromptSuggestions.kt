package com.matrigluco.feature.assistant.domain

import com.matrigluco.core.designsystem.R

object PromptSuggestions {
    val DEFAULT_PROMPTS = listOf(
        PromptSuggestion(
            id = "prompt_risk_assessment",
            category = PromptCategory.RISK_ASSESSMENT,
            categoryLabel = "RISK ASSESSMENT",
            question = "How do I understand my gestational diabetes risk estimate?",
            supportingText = "Learn how maternal factors, glucose, and metabolic markers are evaluated.",
            iconRes = R.drawable.ic_huge_sparkles_24
        ),
        PromptSuggestion(
            id = "prompt_report_terminology",
            category = PromptCategory.REPORT_TERMINOLOGY,
            categoryLabel = "REPORT TERMINOLOGY",
            question = "What is the difference between Fasting Blood Sugar and HbA1c?",
            supportingText = "Understand standard clinical lab biomarkers and their biological reference ranges.",
            iconRes = R.drawable.ic_huge_document_24
        ),
        PromptSuggestion(
            id = "prompt_health_logs",
            category = PromptCategory.HEALTH_LOGS,
            categoryLabel = "HEALTH LOGS",
            question = "What daily lifestyle and dietary factors influence glucose levels?",
            supportingText = "Explore curated nutritional and physical activity guidance for pregnancy.",
            iconRes = R.drawable.ic_huge_activity_24
        ),
        PromptSuggestion(
            id = "prompt_doctor_discussion",
            category = PromptCategory.DOCTOR_DISCUSSION,
            categoryLabel = "DOCTOR DISCUSSION",
            question = "What questions should I prepare for my next prenatal checkup?",
            supportingText = "Get structured suggestions on discussing your readings with your care team.",
            iconRes = R.drawable.ic_huge_bulb_24
        )
    )
}
