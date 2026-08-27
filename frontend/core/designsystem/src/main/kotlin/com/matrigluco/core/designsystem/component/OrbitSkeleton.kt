package com.matrigluco.core.designsystem.component

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.content.Context
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.matrigluco.core.designsystem.R
import com.matrigluco.core.designsystem.motion.OrbitMotion

/** A non-semantic loading surface. The parent must expose the loading announcement. */
class OrbitSkeleton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {
    private var pulse: ObjectAnimator? = null

    init {
        background = ContextCompat.getDrawable(context, R.drawable.orbit_skeleton_surface)
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
        alpha = 0.72f
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (!OrbitMotion.animationsEnabled(context)) return
        pulse = ObjectAnimator.ofFloat(this, ALPHA, 0.58f, 0.88f).apply {
            duration = OrbitMotion.duration(context, OrbitMotion.Emphasis.Emphasized) * 4
            repeatMode = ValueAnimator.REVERSE
            repeatCount = ValueAnimator.INFINITE
            start()
        }
    }

    override fun onDetachedFromWindow() {
        pulse?.cancel()
        pulse = null
        super.onDetachedFromWindow()
    }
}
