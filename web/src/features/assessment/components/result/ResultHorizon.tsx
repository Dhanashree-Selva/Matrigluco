import { Link } from "react-router-dom";
import {
  SecurityCheckIcon,
  Activity01Icon,
  ArrowRight02Icon,
  Layers01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "../../../../shared/ui";
import { AssessmentDetail, RiskBand } from "../../types/assessment.types";
import { ProbabilityPopover } from "./ProbabilityPopover";
import { ModelVersionHoverCard } from "./ModelVersionHoverCard";
import { formatProbabilityPercent, formatAssessmentDate } from "../../utils/formatters";

interface ResultHorizonProps {
  assessment: AssessmentDetail;
}

export function ResultHorizon({ assessment }: ResultHorizonProps) {
  const probability = assessment.probability ?? assessment.probabilityScore ?? 0;
  const formattedPercent = formatProbabilityPercent(probability);
  const riskBand: RiskBand = assessment.riskBand || "moderate";
  const modelVersion = assessment.model?.version || "1.0.0";
  const formattedDate = formatAssessmentDate(assessment.createdAt);

  const getRiskBandConfig = (band: RiskBand) => {
    switch (band) {
      case "low":
        return {
          title: "Low risk estimate",
          description: "Calculated metabolic profile aligns with lower risk thresholds under this model version.",
          colorClass: "text-[var(--success)]",
          borderClass: "border-[var(--success)]/20",
          softBgClass: "bg-[var(--color-success-soft)]",
        };
      case "high":
        return {
          title: "High risk estimate",
          description: "Calculated metabolic profile correlates with elevated risk markers. Clinical follow-up recommended.",
          colorClass: "text-[var(--destructive)]",
          borderClass: "border-[var(--destructive)]/20",
          softBgClass: "bg-[var(--color-danger-soft)]",
        };
      case "moderate":
      default:
        return {
          title: "Moderate risk estimate",
          description: "Calculated metabolic profile shows intermediate signals warranting continued observation.",
          colorClass: "text-[var(--warning)]",
          borderClass: "border-[var(--warning)]/20",
          softBgClass: "bg-[var(--color-warning-soft)]",
        };
    }
  };

  const config = getRiskBandConfig(riskBand);

  return (
    <section
      aria-labelledby="result-horizon-title"
      className="relative overflow-hidden p-6 sm:p-8 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-6 shadow-xs"
    >
      {/* Decorative Horizon Motif (Aesthetic Only - Non-Encoding) */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[var(--accent-soft)]/20 pointer-events-none blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-[var(--border-pink)]/40 to-transparent"
      />

      {/* 1. Primary Risk Context Landscape */}
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--muted-foreground)]">
            Risk Classification
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
          <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
            Model Output
          </span>
        </div>

        <div className="space-y-1">
          <h2
            id="result-horizon-title"
            className={`text-2xl sm:text-4xl font-black tracking-tight ${config.colorClass}`}
          >
            {config.title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>

      {/* 2. Model Probability Surface */}
      <div className="p-4 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">
              Model probability
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-[var(--foreground)]">
              {formattedPercent}
            </span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Statistical estimation evaluated from 8 verified inputs
          </p>
        </div>

        <ProbabilityPopover />
      </div>

      {/* 3. Assessment Provenance Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <AppIcon icon={Calendar03Icon} size="xs" className="text-[var(--primary)] shrink-0" />
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Date</span>
            <span className="font-semibold text-[var(--foreground)] text-xs">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AppIcon icon={Layers01Icon} size="xs" className="text-[var(--primary)] shrink-0" />
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Model</span>
            <ModelVersionHoverCard version={modelVersion} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AppIcon icon={Activity01Icon} size="xs" className="text-[var(--primary)] shrink-0" />
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Inputs</span>
            <span className="font-semibold text-[var(--foreground)] text-xs">8 canonical metrics</span>
          </div>
        </div>
      </div>

      {/* 4. Non-Diagnostic Medical Scope Alert */}
      <Alert className="p-3 bg-[var(--surface-soft)]/50 border border-[var(--border)]">
        <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <AlertTitle className="text-xs font-bold text-[var(--foreground)]">
            Non-Diagnostic Medical Notice
          </AlertTitle>
          <AlertDescription className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            {assessment.disclaimer ||
              "This algorithmic risk assessment is a research and educational prototype. It does not constitute a clinical medical diagnosis or therapeutic prescription."}
          </AlertDescription>
        </div>
      </Alert>

      {/* 5. Primary Next Action */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        <Button
          asChild
          className="h-9 px-4 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-sm"
        >
          <Link to="/app/tracking">
            <span>Continue Recording Telemetry</span>
            <AppIcon icon={ArrowRight02Icon} size="xs" className="ml-1.5" />
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="h-9 px-3 text-xs font-semibold border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <Link to="/app/assessment">
            <span>Start a New Assessment</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
