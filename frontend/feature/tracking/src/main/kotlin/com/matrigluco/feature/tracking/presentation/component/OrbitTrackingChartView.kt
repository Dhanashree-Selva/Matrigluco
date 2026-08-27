package com.matrigluco.feature.tracking.presentation.component

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.matrigluco.core.designsystem.R
import com.matrigluco.feature.tracking.presentation.ChartPoint
import kotlin.math.max
import kotlin.math.min

class OrbitTrackingChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var points: List<ChartPoint> = emptyList()
    private var unit: String = "mg/dL"

    private val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 6f
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2f
        pathEffect = DashPathEffect(floatArrayOf(8f, 8f), 0f)
    }

    private val labelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = 28f
        textAlign = Paint.Align.CENTER
    }

    private val axisLabelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = 26f
        textAlign = Paint.Align.LEFT
    }

    private val nodeCenterPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val nodeBorderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 4f
    }

    private val path = Path()
    private val fillPath = Path()

    init {
        updateColors()
    }

    private fun updateColors() {
        val pinkColor = ContextCompat.getColor(context, R.color.care_pink)
        val onSurfaceColor = ContextCompat.getColor(context, R.color.care_ink)
        val mutedColor = ContextCompat.getColor(context, R.color.care_text_muted)
        val dividerColor = ContextCompat.getColor(context, R.color.care_divider)

        linePaint.color = pinkColor
        nodeCenterPaint.color = pinkColor
        nodeBorderPaint.color = ContextCompat.getColor(context, R.color.care_surface)
        gridPaint.color = dividerColor
        labelPaint.color = onSurfaceColor
        axisLabelPaint.color = mutedColor
    }

    fun setChartData(newPoints: List<ChartPoint>, unitLabel: String) {
        this.points = newPoints
        this.unit = unitLabel
        updateAccessibilityDescription()
        invalidate()
    }

    private fun updateAccessibilityDescription() {
        if (points.isEmpty()) {
            contentDescription = "No trend readings recorded for this period."
            return
        }
        val sb = StringBuilder("Longitudinal trend: ${points.size} readings in selected scope. ")
        for (p in points) {
            sb.append("${p.formattedValue} $unit on ${p.dateLabel}. ")
        }
        contentDescription = sb.toString()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        updateColors()

        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0 || h <= 0) return

        val paddingLeft = 70f
        val paddingRight = 60f
        val paddingTop = 60f
        val paddingBottom = 70f

        val plotWidth = w - paddingLeft - paddingRight
        val plotHeight = h - paddingTop - paddingBottom

        if (points.isEmpty()) {
            // Draw empty state subtle baseline
            canvas.drawLine(paddingLeft, h / 2f, w - paddingRight, h / 2f, gridPaint)
            axisLabelPaint.textAlign = Paint.Align.CENTER
            canvas.drawText("No readings in this period", w / 2f, h / 2f - 16f, axisLabelPaint)
            return
        }

        val values = points.map { it.value }
        val rawMin = values.minOrNull() ?: 0.0
        val rawMax = values.maxOrNull() ?: 100.0

        val minY = if (rawMin == rawMax) max(0.0, rawMin - 20.0) else max(0.0, rawMin - (rawMax - rawMin) * 0.2)
        val maxY = if (rawMin == rawMax) rawMax + 20.0 else rawMax + (rawMax - rawMin) * 0.25
        val rangeY = if (maxY - minY == 0.0) 1.0 else (maxY - minY)

        // Draw 3 horizontal grid lines with Y-axis labels
        val gridSteps = 3
        axisLabelPaint.textAlign = Paint.Align.LEFT
        for (i in 0..gridSteps) {
            val stepVal = minY + (rangeY / gridSteps) * i
            val yPos = paddingTop + plotHeight - (plotHeight / gridSteps) * i
            canvas.drawLine(paddingLeft, yPos, w - paddingRight, yPos, gridPaint)
            val valStr = if (stepVal % 1.0 == 0.0) stepVal.toInt().toString() else "%.0f".format(java.util.Locale.US, stepVal)
            canvas.drawText(valStr, 12f, yPos + 8f, axisLabelPaint)
        }

        // Compute point coordinates
        val coords = points.mapIndexed { idx, point ->
            val x = if (points.size == 1) {
                paddingLeft + plotWidth / 2f
            } else {
                paddingLeft + (plotWidth / (points.size - 1)) * idx
            }
            val y = (paddingTop + plotHeight - ((point.value - minY) / rangeY) * plotHeight).toFloat()
            x to y
        }

        // Draw smooth bezier curve and gradient fill
        path.reset()
        fillPath.reset()

        if (coords.size == 1) {
            val (cx, cy) = coords[0]
            path.moveTo(cx - 30f, cy)
            path.lineTo(cx + 30f, cy)
        } else {
            path.moveTo(coords[0].first, coords[0].second)
            fillPath.moveTo(coords[0].first, paddingTop + plotHeight)
            fillPath.lineTo(coords[0].first, coords[0].second)

            for (i in 0 until coords.size - 1) {
                val (p0x, p0y) = coords[i]
                val (p1x, p1y) = coords[i + 1]
                val controlX1 = (p0x + p1x) / 2f
                val controlY1 = p0y
                val controlX2 = (p0x + p1x) / 2f
                val controlY2 = p1y

                path.cubicTo(controlX1, controlY1, controlX2, controlY2, p1x, p1y)
                fillPath.cubicTo(controlX1, controlY1, controlX2, controlY2, p1x, p1y)
            }

            fillPath.lineTo(coords.last().first, paddingTop + plotHeight)
            fillPath.close()

            // Apply Care Pink vertical gradient fill
            val pinkColor = ContextCompat.getColor(context, R.color.care_pink)
            val startColor = Color.argb(60, Color.red(pinkColor), Color.green(pinkColor), Color.blue(pinkColor))
            val endColor = Color.argb(0, Color.red(pinkColor), Color.green(pinkColor), Color.blue(pinkColor))
            fillPaint.shader = LinearGradient(0f, paddingTop, 0f, paddingTop + plotHeight, startColor, endColor, Shader.TileMode.CLAMP)

            canvas.drawPath(fillPath, fillPaint)
        }

        canvas.drawPath(path, linePaint)

        // Draw point nodes, value labels, and X-axis date labels
        labelPaint.textAlign = Paint.Align.CENTER
        for (i in coords.indices) {
            val (cx, cy) = coords[i]
            val point = points[i]

            // Node circles
            canvas.drawCircle(cx, cy, 10f, nodeBorderPaint)
            canvas.drawCircle(cx, cy, 8f, nodeCenterPaint)

            // Value label above node
            val valText = point.formattedValue
            canvas.drawText(valText, cx, cy - 18f, labelPaint)

            // Date label below X-axis
            val dateText = point.dateLabel
            canvas.drawText(dateText, cx, h - 16f, axisLabelPaint)
        }
    }
}
