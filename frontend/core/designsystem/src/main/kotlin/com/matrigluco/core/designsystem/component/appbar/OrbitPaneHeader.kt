package com.matrigluco.core.designsystem.component.appbar

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.DrawableRes
import com.matrigluco.core.designsystem.R

/**
 * Lightweight subheader component for tablet master-detail secondary panes.
 */
class OrbitPaneHeader @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : LinearLayout(context, attrs) {

    private val titleView: TextView
    private val subtitleView: TextView
    private val actionButton: ImageButton

    init {
        orientation = HORIZONTAL
        LayoutInflater.from(context).inflate(R.layout.view_orbit_pane_header, this, true)
        titleView = findViewById(R.id.paneHeaderTitle)
        subtitleView = findViewById(R.id.paneHeaderSubtitle)
        actionButton = findViewById(R.id.paneHeaderAction)
    }

    fun bind(
        title: CharSequence,
        subtitle: CharSequence? = null,
        @DrawableRes actionIconRes: Int? = null,
        actionContentDescription: CharSequence? = null,
        onActionClick: (() -> Unit)? = null
    ) {
        titleView.text = title
        subtitleView.text = subtitle
        subtitleView.visibility = if (subtitle.isNullOrBlank()) View.GONE else View.VISIBLE

        if (actionIconRes != null && onActionClick != null) {
            actionButton.setImageResource(actionIconRes)
            actionButton.contentDescription = actionContentDescription
            actionButton.setOnClickListener { onActionClick() }
            actionButton.visibility = View.VISIBLE
        } else {
            actionButton.visibility = View.GONE
            actionButton.setOnClickListener(null)
        }
    }
}
