package com.matrigluco.core.designsystem.component

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.content.res.use
import com.matrigluco.core.designsystem.R

enum class OrbitStatusTone { Neutral, Brand, Success, Warning, Danger, Info }

class OrbitStatusChip @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : FrameLayout(context, attrs) {
    private val label: TextView
    init {
        LayoutInflater.from(context).inflate(R.layout.view_orbit_status_chip, this, true); label = findViewById(R.id.orbit_status_label)
        context.obtainStyledAttributes(attrs, R.styleable.OrbitStatusChip).use { setStatus(OrbitStatusTone.entries[it.getInt(R.styleable.OrbitStatusChip_orbitStatusTone, 0)], it.getText(R.styleable.OrbitStatusChip_orbitStatusText) ?: "") }
    }
    fun setStatus(tone: OrbitStatusTone, text: CharSequence) {
        label.text = text
        val color = when (tone) { OrbitStatusTone.Neutral -> R.color.care_text_secondary; OrbitStatusTone.Brand -> R.color.care_pink_strong; OrbitStatusTone.Success -> R.color.care_success; OrbitStatusTone.Warning -> R.color.care_warning; OrbitStatusTone.Danger -> R.color.care_danger; OrbitStatusTone.Info -> R.color.care_info }
        label.setTextColor(ContextCompat.getColor(context, color))
        label.background = GradientDrawable().apply { cornerRadius = resources.getDimension(R.dimen.orbit_radius_pill); setColor(ContextCompat.getColor(context, R.color.care_surface_soft)); setStroke(resources.getDimensionPixelSize(R.dimen.orbit_divider), ContextCompat.getColor(context, color)) }
        label.contentDescription = null
    }
}
