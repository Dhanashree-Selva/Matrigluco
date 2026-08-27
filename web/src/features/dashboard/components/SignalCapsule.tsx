import { useNavigate } from "react-router-dom";
import {
  DropletIcon,
  Activity02Icon,
  WeightScaleIcon,
  Medicine01Icon,
  PlusSignIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  Button,
} from "../../../shared/ui";
import { SignalCapsuleVM } from "../types/dashboard.types";

export interface SignalCapsuleProps {
  signal: SignalCapsuleVM;
  className?: string;
}

export function SignalCapsule({ signal, className = "" }: SignalCapsuleProps) {
  const navigate = useNavigate();

  const getSignalIcon = (id: string) => {
    switch (id) {
      case "glucose":
        return DropletIcon;
      case "blood_pressure":
        return Activity02Icon;
      case "weight":
        return WeightScaleIcon;
      default:
        return Medicine01Icon;
    }
  };

  return (
    <Card
      size="sm"
      className={`rounded-md border border-[var(--border)] bg-[var(--card)] shadow-2xs transition-all hover:border-[var(--border-pink)] ${className}`}
    >
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-bold text-[var(--muted-foreground)] flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--surface-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
            <AppIcon icon={getSignalIcon(signal.id)} size="xs" />
          </div>
          <span>{signal.label}</span>
        </CardTitle>

        <CardAction className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
          <AppIcon icon={Clock01Icon} size="xs" className="shrink-0" />
          <span>{signal.recencyText}</span>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-1">
        {signal.isMissing ? (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[var(--muted-foreground)] italic">
              No reading recorded
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigate(signal.logPath)}
              className="h-7 px-2.5 text-[11px] font-bold border-[var(--border-pink)] text-[var(--primary)] hover:bg-[var(--accent-soft)] cursor-pointer"
            >
              <AppIcon icon={PlusSignIcon} size="xs" />
              <span>Log</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                {signal.value}
              </span>
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {signal.unit}
              </span>
            </div>

            {signal.deltaText && (
              <p className="text-[11px] text-[var(--muted-foreground)] font-medium">
                {signal.deltaText}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
