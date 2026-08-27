package com.matrigluco.core.designsystem.component

import android.content.Context
import android.util.AttributeSet
import android.view.Gravity
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.DrawableRes
import androidx.core.view.ViewCompat
import com.matrigluco.core.designsystem.R

class OrbitEmptyState @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : LinearLayout(context, attrs) {

    private val iconContainer: FrameLayout
    private val icon: ImageView
    private val title: TextView
    private val reason: TextView
    private val action: OrbitButton

    init {
        orientation = VERTICAL
        gravity = Gravity.CENTER
        val p = resources.getDimensionPixelSize(R.dimen.orbit_space_24)
        setPadding(p, p, p, p)

        // 1. Circular Badge Icon Container
        val badgeSize = (resources.displayMetrics.density * 64).toInt()
        val iconSize = (resources.displayMetrics.density * 28).toInt()

        iconContainer = FrameLayout(context).apply {
            background = context.getDrawable(R.drawable.bg_empty_state_badge)
            layoutParams = LayoutParams(badgeSize, badgeSize).apply {
                gravity = Gravity.CENTER_HORIZONTAL
            }
        }

        icon = ImageView(context).apply {
            layoutParams = FrameLayout.LayoutParams(iconSize, iconSize).apply {
                gravity = Gravity.CENTER
            }
            setColorFilter(context.getColor(R.color.care_pink))
            importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
        }
        iconContainer.addView(icon)
        addView(iconContainer)

        // 2. Title Text
        val titleTopMargin = (resources.displayMetrics.density * 16).toInt()
        title = TextView(context).apply {
            setTextAppearance(R.style.Orbit_Text_Title)
            setTextColor(context.getColor(R.color.care_text_primary))
            gravity = Gravity.CENTER
            textAlignment = TEXT_ALIGNMENT_CENTER
            paint.isFakeBoldText = true
            textSize = 18f
            layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
                topMargin = titleTopMargin
                gravity = Gravity.CENTER_HORIZONTAL
            }
        }
        addView(title)
        ViewCompat.setAccessibilityHeading(title, true)

        // 3. Reason / Description Body Text
        val reasonTopMargin = (resources.displayMetrics.density * 8).toInt()
        val maxReasonWidth = (resources.displayMetrics.density * 300).toInt()
        reason = TextView(context).apply {
            setTextAppearance(R.style.Orbit_Text_Body)
            setTextColor(context.getColor(R.color.care_text_secondary))
            gravity = Gravity.CENTER
            textAlignment = TEXT_ALIGNMENT_CENTER
            textSize = 13.5f
            setLineSpacing(resources.displayMetrics.density * 3f, 1.0f)
            maxWidth = maxReasonWidth
            layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
                topMargin = reasonTopMargin
                gravity = Gravity.CENTER_HORIZONTAL
            }
        }
        addView(reason)

        // 4. Primary Action Button
        val actionTopMargin = (resources.displayMetrics.density * 20).toInt()
        action = OrbitButton(context).apply {
            layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
                topMargin = actionTopMargin
                gravity = Gravity.CENTER_HORIZONTAL
            }
            visibility = GONE
        }
        addView(action)
    }

    fun bind(
        @DrawableRes iconResource: Int,
        emptyTitle: CharSequence,
        truthfulReason: CharSequence
    ) {
        icon.setImageResource(iconResource)
        title.text = emptyTitle
        reason.text = truthfulReason
    }

    fun setPrimaryAction(text: CharSequence?, listener: OnClickListener?) {
        action.setText(text ?: "")
        action.setOnClickListener(listener)
        action.visibility = if (text.isNullOrBlank()) GONE else VISIBLE
    }
}
