package com.matrigluco.core.designsystem.component

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.matrigluco.core.designsystem.R

class OrbitTimelineItem @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {
    private val marker = OrbitTimelineMarker(context); private val title = text(R.style.Orbit_Text_LabelStrong); private val supporting = text(R.style.Orbit_Text_BodyMuted); private val timestamp = text(R.style.Orbit_Text_Caption); private val exactValue = text(R.style.Orbit_Text_LabelStrong)
    init { orientation=HORIZONTAL; gravity=Gravity.TOP; descendantFocusability=FOCUS_BLOCK_DESCENDANTS;isFocusable=true;importantForAccessibility=IMPORTANT_FOR_ACCESSIBILITY_YES;marker.importantForAccessibility=IMPORTANT_FOR_ACCESSIBILITY_NO; addView(marker, LayoutParams(resources.getDimensionPixelSize(R.dimen.orbit_space_32), LayoutParams.MATCH_PARENT)); addView(LinearLayout(context).apply { orientation=VERTICAL; addView(title); addView(supporting); addView(exactValue); addView(timestamp) }, LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f)); val v=resources.getDimensionPixelSize(R.dimen.orbit_space_12); setPadding(0,v,0,v) }
    fun bind(itemTitle: CharSequence, supportingText: CharSequence, eventTime: CharSequence, value: CharSequence? = null) { title.text=itemTitle; supporting.text=supportingText; timestamp.text=eventTime; exactValue.text=value; exactValue.visibility=if(value.isNullOrBlank()) GONE else VISIBLE; contentDescription=listOfNotNull(itemTitle,supportingText,value,eventTime).joinToString(", ") }
    private fun text(style: Int)=TextView(context).apply { setTextAppearance(style) }
}

private class OrbitTimelineMarker(context: Context) : android.view.View(context) {
    private val rail=Paint(Paint.ANTI_ALIAS_FLAG).apply { color=ContextCompat.getColor(context,R.color.care_border); strokeWidth=resources.getDimension(R.dimen.orbit_rail_width) }
    private val dot=Paint(Paint.ANTI_ALIAS_FLAG).apply { color=ContextCompat.getColor(context,R.color.care_pink) }
    override fun onDraw(canvas: Canvas) { val x=if(layoutDirection==LAYOUT_DIRECTION_RTL) width*0.25f else width*0.5f; canvas.drawLine(x,0f,x,height.toFloat(),rail); canvas.drawCircle(x,resources.getDimension(R.dimen.orbit_space_12),resources.getDimension(R.dimen.orbit_space_4),dot) }
}
