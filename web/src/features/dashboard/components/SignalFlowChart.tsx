import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Activity02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  Button,
  ToggleGroup,
  ToggleGroupItem,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../shared/ui";
import { TrendPointVM } from "../types/dashboard.types";
import { AskAboutThisAction } from "./AskAboutThisAction";

export interface SignalFlowChartProps {
  points: TrendPointVM[];
  metricName?: string;
  unit?: string;
  onMetricChange?: (metric: string) => void;
  period?: "7d" | "30d";
  onPeriodChange?: (period: "7d" | "30d") => void;
  className?: string;
}

export function SignalFlowChart({
  points = [],
  metricName = "glucose",
  unit = "mg/dL",
  onMetricChange,
  period = "7d",
  onPeriodChange,
  className = "",
}: SignalFlowChartProps) {
  const navigate = useNavigate();
  const hasEnoughData = points.length >= 2;

  const chartConfig = {
    value: {
      label: metricName === "glucose" ? "Blood Glucose" : "Maternal Weight",
      color: "var(--primary)",
    },
  };

  const latestPoint = points.length > 0 ? points[points.length - 1] : null;
  const previousPoint = points.length > 1 ? points[points.length - 2] : null;

  return (
    <Card
      data-slot="signal-story"
      className={`rounded-md border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col justify-between ${className}`}
    >
      {/* Header with Metric & Period Selector ToggleGroups */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-bold text-[var(--foreground)] tracking-tight">
            Metabolic Flow & Trends
          </CardTitle>
          <CardDescription className="text-xs text-[var(--muted-foreground)]">
            {points.length} readings recorded over selected period
          </CardDescription>
        </div>

        <CardAction className="flex flex-wrap items-center gap-2 self-start sm:self-center justify-self-start sm:justify-self-end">
          {/* Metric Selector ToggleGroup */}
          {onMetricChange && (
            <ToggleGroup
              type="single"
              value={metricName}
              onValueChange={(val) => val && onMetricChange(val)}
              className="bg-[var(--surface-soft)] p-0.5 rounded-md border border-[var(--border)]"
            >
              <ToggleGroupItem
                value="glucose"
                className="px-2.5 py-1 text-xs font-bold rounded-md data-[state=on]:bg-[var(--primary)] data-[state=on]:text-[var(--primary-foreground)] text-[var(--muted-foreground)] cursor-pointer"
              >
                Glucose
              </ToggleGroupItem>
              <ToggleGroupItem
                value="weight"
                className="px-2.5 py-1 text-xs font-bold rounded-md data-[state=on]:bg-[var(--primary)] data-[state=on]:text-[var(--primary-foreground)] text-[var(--muted-foreground)] cursor-pointer"
              >
                Weight
              </ToggleGroupItem>
            </ToggleGroup>
          )}

          {/* Period Selector ToggleGroup */}
          {onPeriodChange && (
            <ToggleGroup
              type="single"
              value={period}
              onValueChange={(val) => val && onPeriodChange(val as "7d" | "30d")}
              className="bg-[var(--surface-soft)] p-0.5 rounded-md border border-[var(--border)]"
            >
              <ToggleGroupItem
                value="7d"
                className="px-2 py-1 text-[11px] font-bold rounded-md data-[state=on]:bg-[var(--primary)] data-[state=on]:text-[var(--primary-foreground)] text-[var(--muted-foreground)] cursor-pointer"
              >
                7D
              </ToggleGroupItem>
              <ToggleGroupItem
                value="30d"
                className="px-2 py-1 text-[11px] font-bold rounded-md data-[state=on]:bg-[var(--primary)] data-[state=on]:text-[var(--primary-foreground)] text-[var(--muted-foreground)] cursor-pointer"
              >
                30D
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </CardAction>
      </CardHeader>

      {/* Chart Canvas or Calm Empty State */}
      <CardContent className="pt-2">
        {!hasEnoughData ? (
          <div className="h-56 flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-md bg-[var(--surface-soft)]/50 border border-dashed border-[var(--border)]">
            <div className="w-10 h-10 rounded-md bg-[var(--card)] text-[var(--primary)] flex items-center justify-center shadow-2xs">
              <AppIcon icon={Activity02Icon} size="md" />
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="text-xs font-bold text-[var(--foreground)]">
                Not enough readings to show trend
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Record 2 or more measurements over your chosen period to observe longitudinal glycemic stability.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => navigate("/track")}
              className="h-8 px-3 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] cursor-pointer"
            >
              <AppIcon icon={PlusSignIcon} size="xs" />
              <span>Add Reading</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <ChartContainer
              config={chartConfig}
              className="min-h-[220px] sm:min-h-[260px] w-full outline-none focus:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_svg]:outline-none"
            >
              <LineChart
                accessibilityLayer
                data={points}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                className="outline-none focus:outline-none"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(val) => (
                        <span className="font-bold text-[var(--primary)]">
                          {val} {unit}
                        </span>
                      )}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ fill: "var(--primary)", r: 3.5, strokeWidth: 1, stroke: "var(--card)" }}
                  activeDot={{ fill: "var(--primary)", r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                />
              </LineChart>
            </ChartContainer>

            {/* Objective Textual Narrative & Ask About This */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              <p>
                {points.length} measurements recorded in the last {period === "7d" ? "7" : "30"} days.
                {latestPoint && (
                  <> Latest: <strong className="text-[var(--foreground)]">{latestPoint.value} {unit}</strong> ({latestPoint.formattedDate}).</>
                )}
                {previousPoint && latestPoint && (
                  <> Previous: {previousPoint.value} {unit}.</>
                )}
              </p>

              <AskAboutThisAction contextTopic={`${metricName} trend over ${period}`} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
