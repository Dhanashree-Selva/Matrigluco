import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "./AppIcon";
import { cn } from "../../lib/utils";

export interface MedicalDisclaimerProps {
  className?: string;
}

export function MedicalDisclaimer({ className = "" }: MedicalDisclaimerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--muted-foreground)] text-xs leading-relaxed",
        className
      )}
    >
      <AppIcon icon={AlertCircleIcon} size="xs" className="text-[var(--primary)] mt-0.5 shrink-0" />
      <div>
        <span className="font-bold text-[var(--foreground)]">Clinical Research Advisory: </span>
        Matrigluco provides machine learning risk estimations based on population datasets. This system does not replace direct clinical diagnosis, laboratory testing, or physician consultation. Always review abnormal results with your obstetric healthcare team.
      </div>
    </div>
  );
}
