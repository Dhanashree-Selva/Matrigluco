package com.matrigluco.core.designsystem.component

import android.content.Context
import android.util.AttributeSet
import android.widget.FrameLayout
import androidx.annotation.DrawableRes
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBar
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarAction
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarMode
import com.matrigluco.core.designsystem.icon.OrbitIcon

/**
 * Legacy compatibility wrapper that forwards to the canonical OrbitAppBar.
 */
class OrbitTopBar @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : FrameLayout(context, attrs) {

    val delegate: OrbitAppBar = OrbitAppBar(context, attrs).also {
        addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))
    }

    private var currentTitle: CharSequence = ""
    private var currentSubtitle: CharSequence? = null
    private var currentNavVisible: Boolean = false
    private var currentNavListener: OnClickListener? = null
    private var currentActions = mutableListOf<OrbitAppBarAction>()

    fun setTitle(value: CharSequence) {
        currentTitle = value
        update()
    }

    fun setSubtitle(value: CharSequence?) {
        currentSubtitle = value
        update()
    }

    fun setNavigationVisible(visible: Boolean) {
        currentNavVisible = visible
        update()
    }

    fun setNavigationOnClickListener(listener: OnClickListener?) {
        currentNavListener = listener
        update()
    }

    fun setAction(@DrawableRes icon: Int, description: CharSequence, listener: OnClickListener?) {
        currentActions.clear()
        if (listener != null) {
            currentActions.add(
                OrbitAppBarAction.Custom(
                    id = "legacy_action",
                    iconRes = icon,
                    contentDescription = description,
                    onClick = { listener.onClick(this) }
                )
            )
        }
        update()
    }

    fun setAction(icon: OrbitIcon, description: CharSequence, listener: OnClickListener?) =
        setAction(icon.drawableRes, description, listener)

    fun clearAction() {
        currentActions.clear()
        update()
    }

    fun setScrolled(scrolled: Boolean) {
        delegate.setScrolled(scrolled)
    }

    private fun update() {
        delegate.render(
            OrbitAppBarConfig(
                mode = if (currentNavVisible) OrbitAppBarMode.DETAIL else OrbitAppBarMode.ROOT,
                title = currentTitle,
                subtitle = currentSubtitle,
                showBack = currentNavVisible,
                onBackClick = { currentNavListener?.onClick(this) },
                actions = currentActions.toList()
            )
        )
    }
}
