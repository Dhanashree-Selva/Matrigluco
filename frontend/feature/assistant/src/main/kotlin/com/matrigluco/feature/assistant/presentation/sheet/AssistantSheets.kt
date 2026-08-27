package com.matrigluco.feature.assistant.presentation.sheet

import android.content.Context
import android.view.LayoutInflater
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.widget.SwitchCompat
import com.matrigluco.core.designsystem.R as DesignR
import com.matrigluco.core.designsystem.component.OrbitBottomSheet
import com.matrigluco.feature.assistant.R
import com.matrigluco.feature.assistant.domain.ChatSource

object AssistantSheets {

    fun showContextSheet(
        context: Context,
        isContextEnabled: Boolean,
        onToggleContext: (Boolean) -> Unit
    ) {
        val sheet = OrbitBottomSheet(context)
        sheet.setOrbitTitle(context.getString(R.string.assistant_context_sheet_title))

        val layout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            val pad = resources.getDimensionPixelSize(DesignR.dimen.orbit_space_16)
            setPadding(pad, pad, pad, pad)
        }

        // Toggle Row
        val toggleRow = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            val rowPad = resources.getDimensionPixelSize(DesignR.dimen.orbit_space_8)
            setPadding(0, 0, 0, rowPad)
        }

        val toggleLabelCol = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }

        val titleTv = TextView(context).apply {
            text = context.getString(R.string.assistant_context_sheet_consent_title)
            setTextAppearance(DesignR.style.Orbit_Text_Body)
            setTextColor(context.getColor(DesignR.color.care_text_primary))
            paint.isFakeBoldText = true
        }

        val descTv = TextView(context).apply {
            text = context.getString(R.string.assistant_context_sheet_consent_desc)
            setTextAppearance(DesignR.style.Orbit_Text_Caption)
            setTextColor(context.getColor(DesignR.color.care_text_secondary))
        }

        toggleLabelCol.addView(titleTv)
        toggleLabelCol.addView(descTv)

        val switch = SwitchCompat(context).apply {
            isChecked = isContextEnabled
            setOnCheckedChangeListener { _, isChecked ->
                onToggleContext(isChecked)
            }
        }

        toggleRow.addView(toggleLabelCol)
        toggleRow.addView(switch)
        layout.addView(toggleRow)

        // Included categories bullet list
        val categoriesTitle = TextView(context).apply {
            text = "Connected Health Dimensions:"
            setTextAppearance(DesignR.style.Orbit_Text_Eyebrow)
            setTextColor(context.getColor(DesignR.color.care_pink))
            val topP = resources.getDimensionPixelSize(DesignR.dimen.orbit_space_16)
            setPadding(0, topP, 0, 8)
        }
        layout.addView(categoriesTitle)

        val bullets = listOf(
            "• Maternal Profile: Gestational age & baseline metrics",
            "• Risk Evaluation: Latest Gestational Diabetes ML Risk Band",
            "• Vitals Telemetry: Recent Blood Glucose & Blood Pressure logs",
            "• Sources: Curated evidence-based clinical knowledge"
        )

        for (bullet in bullets) {
            val bTv = TextView(context).apply {
                text = bullet
                setTextAppearance(DesignR.style.Orbit_Text_Caption)
                setTextColor(context.getColor(DesignR.color.care_text_secondary))
                setPadding(0, 4, 0, 4)
            }
            layout.addView(bTv)
        }

        sheet.setOrbitContent(layout)
        sheet.show()
    }

    fun showInfoSheet(context: Context) {
        val sheet = OrbitBottomSheet(context)
        sheet.setOrbitTitle(context.getString(R.string.assistant_info_sheet_title))

        val layout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            val pad = resources.getDimensionPixelSize(DesignR.dimen.orbit_space_16)
            setPadding(pad, pad, pad, pad)
        }

        val sections = listOf(
            context.getString(R.string.assistant_info_purpose_title) to context.getString(R.string.assistant_info_purpose_desc),
            context.getString(R.string.assistant_info_inference_title) to context.getString(R.string.assistant_info_inference_desc),
            context.getString(R.string.assistant_info_limitations_title) to context.getString(R.string.assistant_info_limitations_desc)
        )

        for ((title, desc) in sections) {
            val tTv = TextView(context).apply {
                text = title.uppercase()
                setTextAppearance(DesignR.style.Orbit_Text_Eyebrow)
                setTextColor(context.getColor(DesignR.color.care_pink))
                val topP = resources.getDimensionPixelSize(DesignR.dimen.orbit_space_12)
                setPadding(0, topP, 0, 4)
            }
            val dTv = TextView(context).apply {
                text = desc
                setTextAppearance(DesignR.style.Orbit_Text_Body)
                setTextColor(context.getColor(DesignR.color.care_text_secondary))
                textSize = 13f
            }
            layout.addView(tTv)
            layout.addView(dTv)
        }

        sheet.setOrbitContent(layout)
        sheet.show()
    }

    fun showSourcesSheet(context: Context, sources: List<ChatSource>) {
        val sheet = OrbitBottomSheet(context)
        val titleText = context.resources.getQuantityString(
            R.plurals.assistant_sources,
            sources.size,
            sources.size
        )
        sheet.setOrbitTitle(titleText)

        val layout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            val pad = resources.getDimensionPixelSize(DesignR.dimen.orbit_space_16)
            setPadding(pad, pad, pad, pad)
        }

        if (sources.isEmpty()) {
            val emptyTv = TextView(context).apply {
                text = "No specific clinical citations attached to this response."
                setTextAppearance(DesignR.style.Orbit_Text_Body)
                setTextColor(context.getColor(DesignR.color.care_text_secondary))
            }
            layout.addView(emptyTv)
        } else {
            sources.forEachIndexed { index, source ->
                val card = LinearLayout(context).apply {
                    orientation = LinearLayout.VERTICAL
                    background = context.getDrawable(R.drawable.bg_prompt_card)
                    val p = resources.getDimensionPixelSize(DesignR.dimen.orbit_space_12)
                    setPadding(p, p, p, p)
                    val mb = resources.getDimensionPixelSize(DesignR.dimen.orbit_space_8)
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply { setMargins(0, 0, 0, mb) }
                }

                val docTv = TextView(context).apply {
                    text = "CITATION 0${index + 1} · ${source.document.uppercase()}"
                    setTextAppearance(DesignR.style.Orbit_Text_Eyebrow)
                    setTextColor(context.getColor(DesignR.color.care_pink))
                    textSize = 10f
                }

                val titleTv = TextView(context).apply {
                    text = source.title
                    setTextAppearance(DesignR.style.Orbit_Text_Body)
                    setTextColor(context.getColor(DesignR.color.care_text_primary))
                    paint.isFakeBoldText = true
                    textSize = 13f
                    val topMargin = 4
                    setPadding(0, topMargin, 0, 2)
                }

                card.addView(docTv)
                card.addView(titleTv)
                layout.addView(card)
            }
        }

        sheet.setOrbitContent(layout)
        sheet.show()
    }
}
