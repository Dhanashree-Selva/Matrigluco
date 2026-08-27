package com.matrigluco.core.designsystem.motion

import android.animation.ValueAnimator
import android.content.Context
import android.provider.Settings
import com.matrigluco.core.designsystem.R

object OrbitMotion {
    fun animationsEnabled(context: Context): Boolean = runCatching { Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) > 0f }.getOrDefault(true)
    fun duration(context: Context, emphasis: Emphasis = Emphasis.Standard): Long = if (!animationsEnabled(context)) 0L else context.resources.getInteger(when(emphasis){Emphasis.Fast->R.integer.orbit_motion_fast;Emphasis.Standard->R.integer.orbit_motion_standard;Emphasis.Emphasized->R.integer.orbit_motion_emphasized}).toLong()
    enum class Emphasis { Fast, Standard, Emphasized }
}
