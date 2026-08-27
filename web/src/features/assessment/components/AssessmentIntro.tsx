import {
  SparklesIcon,
  Activity02Icon,
  UserCircleIcon,
  HeartCheckIcon,
  DnaIcon,
  SecurityCheckIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Button, Alert, AlertDescription, Badge } from "../../../shared/ui";
import { ModelInputConstellation } from "./ModelInputConstellation";

interface AssessmentIntroProps {
  onStart: () => void;
}

export function AssessmentIntro({ onStart }: AssessmentIntroProps) {
  const stageHighlights = [
    {
      step: "01",
      title: "Personal Baseline",
      desc: "Age and pregnancy history",
      icon: UserCircleIcon,
    },
    {
      step: "02",
      title: "Clinical Signals",
      desc: "Glucose and blood pressure",
      icon: Activity02Icon,
    },
    {
      step: "03",
      title: "Body & Metabolic",
      desc: "Skin thickness, insulin, BMI",
      icon: HeartCheckIcon,
    },
    {
      step: "04",
      title: "History Context",
      desc: "Diabetes pedigree score",
      icon: DnaIcon,
    },
    {
      step: "05",
      title: "Review Ledger",
      desc: "Confirm 8 canonical inputs",
      icon: SparklesIcon,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-2">
      {/* 1. Header & Hero */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--primary)]/30 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5"
          >
            Clinical Risk Evaluation
          </Badge>
          <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
            Model v1.0.0
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
          Gestational Diabetes Risk Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
          Follow a guided, 5-stage Assessment Path covering 8 evidence-based maternal biometric indicators. You will have a complete review ledger to verify all inputs before running the model.
        </p>
      </div>

      {/* 2. 5-Stage Path Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {stageHighlights.map((stage) => (
          <div
            key={stage.step}
            className="p-3 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-1.5 transition-colors hover:border-[var(--primary)]/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[var(--primary)]">
                {stage.step}
              </span>
              <AppIcon icon={stage.icon} size="xs" className="text-[var(--muted-foreground)]" />
            </div>
            <div className="font-extrabold text-xs text-[var(--foreground)]">
              {stage.title}
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)] leading-tight">
              {stage.desc}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Model Topology Preview */}
      <ModelInputConstellation />

      {/* 4. Non-Diagnostic Educational Notice */}
      <Alert className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
        <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)] shrink-0 mt-0.5" />
        <AlertDescription className="text-[11px] leading-relaxed">
          <strong>Educational Notice:</strong> This clinical risk evaluation estimates probability bands for educational awareness and care timeline planning. It does not provide an automated diagnosis or substitute for your obstetrician's medical advice.
        </AlertDescription>
      </Alert>

      {/* 5. Start CTA */}
      <div className="pt-2">
        <Button
          onClick={onStart}
          className="w-full sm:w-auto h-11 px-8 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-extrabold text-sm shadow-md shadow-[var(--primary)]/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
        >
          <span>Begin Assessment Path</span>
          <AppIcon icon={ArrowRight01Icon} size="xs" />
        </Button>
      </div>
    </div>
  );
}
