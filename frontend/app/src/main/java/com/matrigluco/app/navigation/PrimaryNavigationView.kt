package com.matrigluco.app.navigation

import android.content.Context
import android.graphics.Typeface
import android.util.AttributeSet
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.widget.AppCompatImageView
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.widget.ImageViewCompat
import com.matrigluco.app.R
import com.matrigluco.core.designsystem.R as DesignR

class PrimaryNavigationView @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {
    private var selected: PrimaryDestination? = null
    private var listener: ((PrimaryDestination) -> Unit)? = null
    init { gravity = Gravity.CENTER; importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_YES }

    fun bind(destinations: List<PrimaryDestination>, vertical: Boolean, onSelected: (PrimaryDestination) -> Unit) {
        listener = onSelected; orientation = if (vertical) VERTICAL else HORIZONTAL; removeAllViews()
        destinations.forEach { destination ->
            val item = LinearLayout(context).apply {
                tag = destination; orientation = VERTICAL; gravity = Gravity.CENTER; isClickable = true; isFocusable = true
                minimumWidth = resources.getDimensionPixelSize(DesignR.dimen.orbit_touch_target); minimumHeight = resources.getDimensionPixelSize(DesignR.dimen.orbit_touch_target)
                background = ContextCompat.getDrawable(context, R.drawable.orbit_primary_navigation_item)
                val icon = AppCompatImageView(context).apply { setImageResource(destination.icon.drawableRes); importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO; layoutParams = LayoutParams(resources.getDimensionPixelSize(DesignR.dimen.orbit_icon_size), resources.getDimensionPixelSize(DesignR.dimen.orbit_icon_size)) }
                val label = TextView(context).apply { text = context.getString(destination.label); setTextAppearance(DesignR.style.Orbit_Text_Caption); gravity = Gravity.CENTER; importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO; setPadding(0, resources.getDimensionPixelSize(DesignR.dimen.orbit_space_4), 0, 0) }
                addView(icon); addView(label); contentDescription = context.getString(destination.label); setOnClickListener { listener?.invoke(destination) }
            }
            addView(item, if (vertical) LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT) else LayoutParams(0, LayoutParams.MATCH_PARENT, 1f))
        }
        renderSelection()
    }

    fun setSelected(destination: PrimaryDestination?) { selected = destination; renderSelection() }
    private fun renderSelection() {
        children().forEach { item ->
            val isCurrent = item.tag == selected
            item.isSelected = isCurrent
            ViewCompat.setStateDescription(item, context.getString(if (isCurrent) R.string.nav_selected else R.string.nav_not_selected))
            val icon = (item as LinearLayout).getChildAt(0) as AppCompatImageView
            val label = item.getChildAt(1) as TextView
            label.setTypeface(label.typeface, if (isCurrent) Typeface.BOLD else Typeface.NORMAL)
            ImageViewCompat.setImageTintList(icon, ContextCompat.getColorStateList(context, if (isCurrent) DesignR.color.care_pink else DesignR.color.care_text_secondary))
            ViewCompat.setAccessibilityHeading(item, false)
        }
    }
    private fun children(): Sequence<View> = sequence { for (index in 0 until childCount) yield(getChildAt(index)) }
}
