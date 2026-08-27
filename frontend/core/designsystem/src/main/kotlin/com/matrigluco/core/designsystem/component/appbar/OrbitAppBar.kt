package com.matrigluco.core.designsystem.component.appbar

import android.content.Context
import android.content.res.ColorStateList
import android.text.Editable
import android.text.TextWatcher
import android.util.AttributeSet
import android.util.TypedValue
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import com.matrigluco.core.designsystem.R

/**
 * The canonical, responsive, accessible Matrigluco top app bar.
 */
class OrbitAppBar @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : LinearLayout(context, attrs) {

    private val navContainer: FrameLayout
    private val backButton: ImageButton
    private val brandMark: ImageView
    private val titleContainer: LinearLayout
    private val eyebrowRow: LinearLayout
    private val eyebrowView: TextView
    private val badgeView: TextView
    private val titleView: TextView
    private val subtitleView: TextView
    private val searchContainer: LinearLayout
    private val searchInput: EditText
    private val searchClear: ImageButton
    private val actionsContainer: LinearLayout
    private val dividerView: View
    private val accentStripView: View

    private var currentConfig: OrbitAppBarConfig = OrbitAppBarConfig.hidden()
    private var searchWatcher: TextWatcher? = null

    init {
        orientation = VERTICAL
        setBackgroundColor(ContextCompat.getColor(context, R.color.care_background))
        LayoutInflater.from(context).inflate(R.layout.view_orbit_app_bar, this, true)

        navContainer = findViewById(R.id.appBarNavContainer)
        backButton = findViewById(R.id.appBarBack)
        brandMark = findViewById(R.id.appBarBrandMark)
        titleContainer = findViewById(R.id.appBarTitleContainer)
        eyebrowRow = findViewById(R.id.appBarEyebrowRow)
        eyebrowView = findViewById(R.id.appBarEyebrow)
        badgeView = findViewById(R.id.appBarBadge)
        titleView = findViewById(R.id.appBarTitle)
        subtitleView = findViewById(R.id.appBarSubtitle)
        searchContainer = findViewById(R.id.appBarSearchContainer)
        searchInput = findViewById(R.id.appBarSearchInput)
        searchClear = findViewById(R.id.appBarSearchClear)
        actionsContainer = findViewById(R.id.appBarActionsContainer)
        dividerView = findViewById(R.id.appBarDivider)
        accentStripView = findViewById(R.id.appBarAccentStrip)
    }

    fun render(config: OrbitAppBarConfig) {
        currentConfig = config
        if (config.mode == OrbitAppBarMode.HIDDEN) {
            visibility = View.GONE
            return
        }
        visibility = View.VISIBLE

        when (config.mode) {
            OrbitAppBarMode.ROOT -> {
                backButton.visibility = View.GONE
                brandMark.visibility = View.VISIBLE
                searchContainer.visibility = View.GONE
                titleContainer.visibility = View.VISIBLE

                bindEyebrow(config.eyebrow, config.badgeText)
                titleView.text = config.title
                bindSubtitle(config.subtitle)
            }
            OrbitAppBarMode.DETAIL, OrbitAppBarMode.ACCOUNT -> {
                backButton.visibility = if (config.showBack) View.VISIBLE else View.GONE
                brandMark.visibility = View.GONE
                searchContainer.visibility = View.GONE
                titleContainer.visibility = View.VISIBLE

                bindEyebrow(config.eyebrow, config.badgeText)
                titleView.text = config.title
                bindSubtitle(config.subtitle)
            }
            OrbitAppBarMode.FLOW -> {
                backButton.visibility = if (config.showBack) View.VISIBLE else View.GONE
                brandMark.visibility = View.GONE
                searchContainer.visibility = View.GONE
                titleContainer.visibility = View.VISIBLE

                bindEyebrow(config.eyebrow, config.badgeText)
                titleView.text = config.title
                bindSubtitle(config.subtitle)
            }
            OrbitAppBarMode.SEARCH -> {
                backButton.visibility = View.VISIBLE
                brandMark.visibility = View.GONE
                titleContainer.visibility = View.GONE
                searchContainer.visibility = View.VISIBLE

                setupSearchInput(config)
            }
            OrbitAppBarMode.IMMERSIVE -> {
                backButton.visibility = View.VISIBLE
                brandMark.visibility = View.GONE
                searchContainer.visibility = View.GONE
                titleContainer.visibility = View.VISIBLE

                eyebrowRow.visibility = View.GONE
                titleView.text = config.title
                bindSubtitle(config.subtitle)
            }
            OrbitAppBarMode.MINIMAL -> {
                backButton.visibility = if (config.showBack) View.VISIBLE else View.GONE
                brandMark.visibility = View.VISIBLE
                searchContainer.visibility = View.GONE
                titleContainer.visibility = View.VISIBLE

                eyebrowRow.visibility = View.GONE
                titleView.text = config.title
                subtitleView.visibility = View.GONE
            }
            OrbitAppBarMode.HIDDEN -> Unit
        }

        // Configure Back navigation
        backButton.setOnClickListener {
            config.onBackClick?.invoke()
        }

        // Configure Actions
        renderActions(config.actions)

        // Accessibility announcement
        ViewCompat.setAccessibilityHeading(titleView, true)
    }

    private fun bindEyebrow(eyebrow: CharSequence?, badgeText: CharSequence?) {
        val hasEyebrow = !eyebrow.isNullOrBlank()
        val hasBadge = !badgeText.isNullOrBlank()
        if (hasEyebrow || hasBadge) {
            eyebrowRow.visibility = View.VISIBLE
            eyebrowView.text = eyebrow ?: ""
            eyebrowView.visibility = if (hasEyebrow) View.VISIBLE else View.GONE
            badgeView.text = badgeText ?: ""
            badgeView.visibility = if (hasBadge) View.VISIBLE else View.GONE
        } else {
            eyebrowRow.visibility = View.GONE
        }
    }

    private fun bindSubtitle(subtitle: CharSequence?) {
        if (!subtitle.isNullOrBlank()) {
            subtitleView.text = subtitle
            subtitleView.visibility = View.VISIBLE
        } else {
            subtitleView.visibility = View.GONE
        }
    }

    private fun setupSearchInput(config: OrbitAppBarConfig) {
        searchWatcher?.let { searchInput.removeTextChangedListener(it) }
        searchInput.hint = config.searchHint ?: context.getString(R.string.orbit_search_hint)
        if (searchInput.text.toString() != (config.searchQuery ?: "")) {
            searchInput.setText(config.searchQuery ?: "")
        }
        searchClear.visibility = if (searchInput.text.isNullOrEmpty()) View.GONE else View.VISIBLE
        searchClear.setOnClickListener {
            searchInput.text = null
            config.onSearchQueryChange?.invoke("")
        }

        val watcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val text = s?.toString().orEmpty()
                searchClear.visibility = if (text.isEmpty()) View.GONE else View.VISIBLE
                config.onSearchQueryChange?.invoke(text)
            }
            override fun afterTextChanged(s: Editable?) {}
        }
        searchWatcher = watcher
        searchInput.addTextChangedListener(watcher)
    }

    private fun renderActions(actions: List<OrbitAppBarAction>) {
        actionsContainer.removeAllViews()
        if (actions.isEmpty()) {
            actionsContainer.visibility = View.GONE
            return
        }
        actionsContainer.visibility = View.VISIBLE

        for (action in actions) {
            when (action) {
                is OrbitAppBarAction.Notifications -> {
                    val frame = createActionTouchFrame()
                    val icon = createActionImageView(R.drawable.ic_huge_notification_24)
                    frame.addView(icon)

                    if (action.unreadCount > 0) {
                        val badge = createNotificationBadgeDot()
                        frame.addView(badge)
                        frame.contentDescription = "Notifications, ${action.unreadCount} unread"
                    } else {
                        frame.contentDescription = "Notifications"
                    }

                    frame.setOnClickListener { action.onClick() }
                    actionsContainer.addView(frame)
                }
                is OrbitAppBarAction.Search -> {
                    val frame = createActionTouchFrame()
                    val icon = createActionImageView(R.drawable.ic_huge_search_24)
                    frame.addView(icon)
                    frame.contentDescription = "Search"
                    frame.setOnClickListener { action.onClick() }
                    actionsContainer.addView(frame)
                }
                is OrbitAppBarAction.Filter -> {
                    val frame = createActionTouchFrame()
                    val icon = createActionImageView(R.drawable.ic_huge_filter_24)
                    if (action.isFiltered) {
                        icon.imageTintList = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.care_pink))
                        val badge = createNotificationBadgeDot()
                        frame.addView(badge)
                        frame.contentDescription = "Filter active"
                    } else {
                        frame.contentDescription = "Filter readings"
                    }
                    frame.addView(icon)
                    frame.setOnClickListener { action.onClick() }
                    actionsContainer.addView(frame)
                }
                is OrbitAppBarAction.More -> {
                    val frame = createActionTouchFrame()
                    val icon = createActionImageView(R.drawable.ic_huge_more_horizontal_24)
                    frame.addView(icon)
                    frame.contentDescription = "More options"
                    frame.setOnClickListener { action.onClick() }
                    actionsContainer.addView(frame)
                }
                is OrbitAppBarAction.Close -> {
                    val frame = createActionTouchFrame()
                    val icon = createActionImageView(R.drawable.ic_huge_close_24)
                    frame.addView(icon)
                    frame.contentDescription = "Close"
                    frame.setOnClickListener { action.onClick() }
                    actionsContainer.addView(frame)
                }
                is OrbitAppBarAction.Profile -> {
                    val frame = createActionTouchFrame()
                    if (action.initials.isNullOrBlank()) {
                        val icon = createActionImageView(R.drawable.ic_huge_user_24)
                        frame.addView(icon)
                    } else {
                        val initialsView = TextView(context).apply {
                            text = action.initials.take(2).uppercase()
                            textSize = 12f
                            gravity = Gravity.CENTER
                            setTextColor(ContextCompat.getColor(context, R.color.care_pink))
                            setBackgroundResource(R.drawable.orbit_soft_surface)
                            layoutParams = FrameLayout.LayoutParams(
                                resources.getDimensionPixelSize(R.dimen.orbit_space_32),
                                resources.getDimensionPixelSize(R.dimen.orbit_space_32)
                            ).apply { gravity = Gravity.CENTER }
                        }
                        frame.addView(initialsView)
                    }
                    frame.contentDescription = "Account profile"
                    frame.setOnClickListener { action.onClick() }
                    actionsContainer.addView(frame)
                }
                is OrbitAppBarAction.Custom -> {
                    val frame = createActionTouchFrame()
                    val icon = createActionImageView(action.iconRes)
                    frame.addView(icon)
                    frame.contentDescription = action.contentDescription
                    frame.setOnClickListener { action.onClick() }
                    actionsContainer.addView(frame)
                }
                is OrbitAppBarAction.ActionText -> {
                    val textView = TextView(context).apply {
                        text = action.text
                        textSize = 14f
                        setTextColor(ContextCompat.getColor(context, R.color.care_pink))
                        gravity = Gravity.CENTER
                        minHeight = resources.getDimensionPixelSize(R.dimen.orbit_touch_target)
                        setPadding(
                            resources.getDimensionPixelSize(R.dimen.orbit_space_12),
                            0,
                            resources.getDimensionPixelSize(R.dimen.orbit_space_12),
                            0
                        )
                        val outValue = TypedValue()
                        context.theme.resolveAttribute(android.R.attr.selectableItemBackgroundBorderless, outValue, true)
                        setBackgroundResource(outValue.resourceId)
                        setOnClickListener { action.onClick() }
                    }
                    actionsContainer.addView(textView)
                }
            }
        }
    }

    private fun createActionTouchFrame(): FrameLayout {
        val targetSize = resources.getDimensionPixelSize(R.dimen.orbit_touch_target)
        return FrameLayout(context).apply {
            layoutParams = LinearLayout.LayoutParams(targetSize, targetSize)
            val outValue = TypedValue()
            context.theme.resolveAttribute(android.R.attr.selectableItemBackgroundBorderless, outValue, true)
            setBackgroundResource(outValue.resourceId)
            isFocusable = true
        }
    }

    private fun createActionImageView(iconRes: Int): ImageView {
        val iconSize = resources.getDimensionPixelSize(R.dimen.orbit_icon_size)
        return ImageView(context).apply {
            layoutParams = FrameLayout.LayoutParams(iconSize, iconSize).apply {
                gravity = Gravity.CENTER
            }
            setImageResource(iconRes)
            imageTintList = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.care_ink))
            importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
        }
    }

    private fun createNotificationBadgeDot(): View {
        val dotSize = resources.getDimensionPixelSize(R.dimen.orbit_space_8)
        return View(context).apply {
            layoutParams = FrameLayout.LayoutParams(dotSize, dotSize).apply {
                gravity = Gravity.TOP or Gravity.END
                topMargin = resources.getDimensionPixelSize(R.dimen.orbit_space_8)
                rightMargin = resources.getDimensionPixelSize(R.dimen.orbit_space_8)
                marginEnd = resources.getDimensionPixelSize(R.dimen.orbit_space_8)
            }
            background = ContextCompat.getDrawable(context, R.drawable.orbit_soft_surface)?.mutate()?.apply {
                setTint(ContextCompat.getColor(context, R.color.care_pink))
            }
            importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
        }
    }

    fun setScrolled(isScrolled: Boolean) {
        dividerView.visibility = if (isScrolled) View.VISIBLE else View.GONE
        elevation = if (isScrolled) resources.getDimension(R.dimen.orbit_elevation_lifted) else 0f
    }
}
