package com.matrigluco.core.designsystem.component

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.annotation.DrawableRes
import androidx.core.content.ContextCompat
import androidx.core.content.res.use
import androidx.core.view.ViewCompat
import com.matrigluco.core.designsystem.R
import com.matrigluco.core.designsystem.icon.OrbitIcon

enum class OrbitButtonVariant { Primary, Secondary, Quiet, Destructive }

class OrbitButton @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {
    private val progress: ProgressBar
    private val leading: ImageView
    private val label: TextView
    private var actionEnabled = true
    var variant = OrbitButtonVariant.Primary
        set(value) { field = value; render() }
    var isLoading = false
        private set

    init {
        orientation = HORIZONTAL; gravity = Gravity.CENTER
        minimumHeight = resources.getDimensionPixelSize(R.dimen.orbit_button_min_height)
        val horizontal = resources.getDimensionPixelSize(R.dimen.orbit_space_20)
        setPadding(horizontal, 0, horizontal, 0)
        LayoutInflater.from(context).inflate(R.layout.view_orbit_button, this, true)
        progress = findViewById(R.id.orbit_button_progress); leading = findViewById(R.id.orbit_button_leading); label = findViewById(R.id.orbit_button_label)
        context.obtainStyledAttributes(attrs, R.styleable.OrbitButton).use {
            variant = OrbitButtonVariant.entries[it.getInt(R.styleable.OrbitButton_orbitVariant, 0)]
            label.text = it.getText(R.styleable.OrbitButton_orbitText) ?: ""
            val icon = it.getResourceId(R.styleable.OrbitButton_orbitLeadingIcon, 0); if (icon != 0) setLeadingIcon(icon)
            setLoading(it.getBoolean(R.styleable.OrbitButton_orbitLoading, false))
        }
        contentDescription = label.text
        label.importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
        isClickable = true; isFocusable = true; render()
    }

    fun setText(text: CharSequence) { label.text = text; contentDescription = text }
    fun text(): CharSequence = label.text
    fun setLoading(loading: Boolean, announcement: CharSequence = context.getString(R.string.orbit_loading)) {
        val changedToLoading = loading && !isLoading
        isLoading = loading; progress.visibility = if (loading) View.VISIBLE else View.GONE
        leading.visibility = if (loading || leading.drawable == null) View.GONE else View.VISIBLE
        isEnabled = actionEnabled && !loading
        ViewCompat.setStateDescription(this, if (loading) announcement else null)
        if (changedToLoading) announceForAccessibility(announcement)
        render()
    }
    override fun setEnabled(enabled: Boolean) { actionEnabled = enabled; super.setEnabled(enabled && !isLoading); render() }
    fun setLeadingIcon(@DrawableRes icon: Int) { leading.setImageResource(icon); leading.visibility = if (isLoading) View.GONE else View.VISIBLE }
    fun setLeadingIcon(icon: OrbitIcon) = setLeadingIcon(icon.drawableRes)

    private fun render() {
        val (fill, text, stroke) = when (variant) {
            OrbitButtonVariant.Primary -> Triple(R.color.care_pink, R.color.care_on_accent, R.color.care_pink)
            OrbitButtonVariant.Secondary -> Triple(R.color.care_surface_elevated, R.color.care_pink_strong, R.color.care_pink_border)
            OrbitButtonVariant.Quiet -> Triple(android.R.color.transparent, R.color.care_pink_strong, android.R.color.transparent)
            OrbitButtonVariant.Destructive -> Triple(R.color.care_danger, R.color.care_on_accent, R.color.care_danger)
        }
        val actualFill = if (isEnabled) fill else R.color.care_disabled_surface
        val actualText = if (isEnabled) text else R.color.care_disabled_text
        background = GradientDrawable().apply { shape = GradientDrawable.RECTANGLE; cornerRadius = resources.getDimension(R.dimen.orbit_radius_md); setColor(ContextCompat.getColor(context, actualFill)); setStroke(resources.getDimensionPixelSize(R.dimen.orbit_divider), ContextCompat.getColor(context, stroke)) }
        label.setTextColor(ContextCompat.getColor(context, actualText)); leading.imageTintList = ContextCompat.getColorStateList(context, actualText)
    }
    override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo) {
        super.onInitializeAccessibilityNodeInfo(info)
        info.className = android.widget.Button::class.java.name
        info.text = null
        info.contentDescription = label.text
    }
}
