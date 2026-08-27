import { Link } from "react-router-dom";
import {
  Compass01Icon,
  Activity01Icon,
  UserCheck01Icon,
  AiBrain01Icon,
  ArrowRight02Icon,
  Folder01Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { Button, Badge } from "../../../../shared/ui";
import { AssessmentDetail } from "../../types/assessment.types";

interface CarePathProps {
  assessment: AssessmentDetail;
}

export function CarePath({ assessment }: CarePathProps) {
  return (
    <section
      aria-labelledby="care-path-title"
      className="p-5 sm:p-6 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-4 shadow-xs"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <AppIcon icon={Compass01Icon} size="xs" className="text-[var(--primary)] shrink-0" />
          <h3
            id="care-path-title"
            className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]"
          >
            Care Path — What You Can Do Next
          </h3>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          Calm, non-prescriptive recommendations for continuous maternal wellness observation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Step 1: Review inputs */}
        <div className="p-4 rounded-md bg-[var(--surface-soft)]/70 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center">
              <AppIcon icon={Folder01Icon} size="xs" />
            </div>
            <h4 className="text-xs font-bold text-[var(--foreground)]">
              1. Review Inputs
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Verify the exact 8 metrics used for this calculation in the Evidence Lens.
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              Immutable snapshot
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-[var(--border)]">
              8 features
            </Badge>
          </div>
        </div>

        {/* Step 2: Continue tracking */}
        <div className="p-4 rounded-md bg-[var(--surface-soft)]/70 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center">
              <AppIcon icon={Activity01Icon} size="xs" />
            </div>
            <h4 className="text-xs font-bold text-[var(--foreground)]">
              2. Track Telemetry
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Log daily fasting glucose, diastolic blood pressure, and weight in your health ledger.
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            asChild
            className="h-7 text-xs font-semibold border-[var(--border)] w-full justify-between hover:bg-[var(--card)] hover:text-[var(--primary)] transition-colors"
          >
            <Link to="/app/tracking">
              <span>Go to Tracking</span>
              <AppIcon icon={ArrowRight02Icon} size="xs" />
            </Link>
          </Button>
        </div>

        {/* Step 3: Discuss with Clinician */}
        <div className="p-4 rounded-md bg-[var(--surface-soft)]/70 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center">
              <AppIcon icon={UserCheck01Icon} size="xs" />
            </div>
            <h4 className="text-xs font-bold text-[var(--foreground)]">
              3. Consult Clinician
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Discuss these educational estimates with your obstetrician or maternal care specialist.
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            asChild
            className="h-7 text-xs font-semibold border-[var(--border)] w-full justify-between hover:bg-[var(--card)] hover:text-[var(--primary)] transition-colors"
          >
            <Link to="/app/consultations">
              <span>Consultations</span>
              <AppIcon icon={ArrowRight02Icon} size="xs" />
            </Link>
          </Button>
        </div>

        {/* Step 4: Ask Matrigluco Assistant */}
        <div className="p-4 rounded-md bg-[var(--surface-soft)]/70 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center">
              <AppIcon icon={AiBrain01Icon} size="xs" />
            </div>
            <h4 className="text-xs font-bold text-[var(--foreground)]">
              4. Ask Questions
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Ask your private AI assistant for educational maternal glucose explanations.
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            asChild
            className="h-7 text-xs font-semibold border-[var(--border)] w-full justify-between hover:bg-[var(--card)] hover:text-[var(--primary)] transition-colors"
          >
            <Link to={`/app/assistant?resourceType=assessment&resourceId=${assessment.id}`}>
              <span>Ask About Result</span>
              <AppIcon icon={ArrowRight02Icon} size="xs" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
