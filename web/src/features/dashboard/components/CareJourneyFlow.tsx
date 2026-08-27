import {
  Activity02Icon,
  AiBrain01Icon,
  DocumentCodeIcon,
  SparklesIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../shared/ui";

export interface CareJourneyFlowProps {
  hasAssessments?: boolean;
  hasMeasurements?: boolean;
  hasConsultations?: boolean;
  className?: string;
}

export function CareJourneyFlow({
  hasAssessments = false,
  hasMeasurements = false,
  hasConsultations = false,
  className = "",
}: CareJourneyFlowProps) {
  const steps = [
    {
      id: "track",
      title: "1. Track Daily",
      desc: "Glucose & vitals logging",
      icon: Activity02Icon,
      active: hasMeasurements,
    },
    {
      id: "assess",
      title: "2. Assess Risk",
      desc: "Clinical ML evaluation",
      icon: AiBrain01Icon,
      active: hasAssessments,
    },
    {
      id: "understand",
      title: "3. Understand",
      desc: "Trends & lab OCR reports",
      icon: DocumentCodeIcon,
      active: hasAssessments || hasMeasurements,
    },
    {
      id: "ask",
      title: "4. Consult & Ask",
      desc: "Care team & AI guidance",
      icon: SparklesIcon,
      active: hasConsultations,
    },
  ];

  return (
    <Card
      data-slot="care-flow"
      className={`rounded-md border border-[var(--border)] bg-[var(--card)] shadow-xs ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-[var(--foreground)] tracking-tight">
          Product Care Journey
        </CardTitle>
        <CardDescription className="text-xs text-[var(--muted-foreground)]">
          How continuous monitoring connects into clinical understanding
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3.5 rounded-md border flex items-center justify-between gap-3 ${
                step.active
                  ? "bg-[var(--accent-soft)]/60 border-[var(--border-pink)] text-[var(--foreground)]"
                  : "bg-[var(--surface-soft)]/50 border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                    step.active
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--card)] text-[var(--muted-foreground)]"
                  }`}
                >
                  <AppIcon icon={step.icon} size="xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)]">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {step.desc}
                  </p>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <AppIcon
                  icon={ArrowRight01Icon}
                  size="xs"
                  className="hidden lg:block text-[var(--border)] shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
