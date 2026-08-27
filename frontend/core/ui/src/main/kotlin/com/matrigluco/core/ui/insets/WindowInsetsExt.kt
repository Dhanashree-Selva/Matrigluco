package com.matrigluco.core.ui.insets

import android.view.View
import androidx.core.graphics.Insets
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

enum class InsetType { SystemBars, StatusBars, NavigationBars, Ime, SafeDrawing }

fun View.applyOrbitInsets(vararg types: InsetType, consume: Boolean = false) {
    val initial = Padding(paddingLeft, paddingTop, paddingRight, paddingBottom)
    ViewCompat.setOnApplyWindowInsetsListener(this) { view, windowInsets ->
        val combined = types.fold(Insets.NONE) { result, type -> result.max(windowInsets.getInsets(type.mask)) }
        view.setPadding(initial.left + combined.left, initial.top + combined.top, initial.right + combined.right, initial.bottom + combined.bottom)
        if (consume) WindowInsetsCompat.CONSUMED else windowInsets
    }
    requestApplyInsetsWhenAttached()
}

private val InsetType.mask: Int get() = when(this) {
    InsetType.SystemBars -> WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
    InsetType.StatusBars -> WindowInsetsCompat.Type.statusBars() or WindowInsetsCompat.Type.displayCutout()
    InsetType.NavigationBars -> WindowInsetsCompat.Type.navigationBars() or WindowInsetsCompat.Type.systemGestures()
    InsetType.Ime -> WindowInsetsCompat.Type.ime()
    InsetType.SafeDrawing -> WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout() or WindowInsetsCompat.Type.ime()
}
private data class Padding(val left:Int,val top:Int,val right:Int,val bottom:Int)
private fun Insets.max(other:Insets)=Insets.of(maxOf(left,other.left),maxOf(top,other.top),maxOf(right,other.right),maxOf(bottom,other.bottom))
private fun View.requestApplyInsetsWhenAttached(){if(isAttachedToWindow)ViewCompat.requestApplyInsets(this)else addOnAttachStateChangeListener(object:View.OnAttachStateChangeListener{override fun onViewAttachedToWindow(v:View){v.removeOnAttachStateChangeListener(this);ViewCompat.requestApplyInsets(v)};override fun onViewDetachedFromWindow(v:View)=Unit})}
