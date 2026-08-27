package com.matrigluco.core.ui.layout

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout
import com.matrigluco.core.designsystem.R

open class OrbitPageContainer @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {
    protected open val maximumWidthResource = R.dimen.orbit_page_max_width

    init { orientation = VERTICAL }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val available = MeasureSpec.getSize(widthMeasureSpec)
        val max = resources.getDimensionPixelSize(maximumWidthResource)
        val boundedWidth = ContentWidthPolicy.boundedWidth(available, max)
        val bounded = if (boundedWidth < available) MeasureSpec.makeMeasureSpec(boundedWidth, MeasureSpec.EXACTLY) else widthMeasureSpec
        super.onMeasure(bounded, heightMeasureSpec)
    }
}

class OrbitFormContainer @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : OrbitPageContainer(context, attrs) {
    override val maximumWidthResource = R.dimen.orbit_form_max_width
}

class OrbitChatContainer @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : OrbitPageContainer(context, attrs) {
    override val maximumWidthResource = R.dimen.orbit_chat_max_width
}

object ContentWidthPolicy {
    fun boundedWidth(availableWidth: Int, maximumWidth: Int): Int = availableWidth.coerceAtMost(maximumWidth)
}
