package com.matrigluco.core.designsystem.component

import android.content.Context
import android.util.AttributeSet
import android.util.TypedValue
import androidx.appcompat.widget.AppCompatImageButton
import androidx.core.widget.ImageViewCompat
import com.matrigluco.core.designsystem.R
import com.matrigluco.core.designsystem.icon.OrbitIcon

enum class OrbitIconButtonVariant { Quiet, Brand, Destructive }

class OrbitIconButton @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : AppCompatImageButton(context, attrs) {
    var variant = OrbitIconButtonVariant.Quiet
        set(value) { field = value; applyTint() }
    init {
        minimumWidth = resources.getDimensionPixelSize(R.dimen.orbit_touch_target)
        minimumHeight = resources.getDimensionPixelSize(R.dimen.orbit_touch_target)
        val padding = resources.getDimensionPixelSize(R.dimen.orbit_space_12)
        setPadding(padding, padding, padding, padding)
        scaleType = ScaleType.CENTER_INSIDE
        val selectable = TypedValue()
        context.theme.resolveAttribute(androidx.appcompat.R.attr.selectableItemBackgroundBorderless, selectable, true)
        setBackgroundResource(selectable.resourceId)
        isFocusable = true
        applyTint()
    }
    fun setIcon(icon: OrbitIcon) { setImageResource(icon.drawableRes) }
    fun setActionDescription(description: CharSequence) { contentDescription = description }
    private fun applyTint() {
        val tint = when (variant) {
            OrbitIconButtonVariant.Quiet -> R.color.orbit_icon_action_tint
            OrbitIconButtonVariant.Brand -> R.color.orbit_icon_navigation_tint
            OrbitIconButtonVariant.Destructive -> R.color.orbit_icon_destructive_tint
        }
        ImageViewCompat.setImageTintList(this, androidx.core.content.ContextCompat.getColorStateList(context, tint))
    }
}
