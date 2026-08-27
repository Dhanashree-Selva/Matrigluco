import {
  AiBrain01Icon,
  SecurityCheckIcon,
  AlertCircleIcon,
  InformationCircleIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { Badge, Separator } from "../../../../shared/ui";
import { AssessmentDetail } from "../../types/assessment.types";
import { InputSnapshotLedger } from "./InputSnapshotLedger";
import { EvidenceThreads } from "./EvidenceThreads";
import { ExplainabilityUnavailable } from "./ExplainabilityUnavailable";

interface EvidenceLensProps {
  assessment: AssessmentDetail;
}

export function EvidenceLens({ assessment }: EvidenceLensProps) {
  const modelVersion = assessment.model?.version || "1.0.0";
  const modelKey = assessment.model?.key || "diabetes-risk";

  return (
    <div className="p-5 sm:p-6 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-6 h-full flex flex-col justify-between shadow-xs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
              <AppIcon icon={AiBrain01Icon} size="xs" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                Evidence Lens
              </h3>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Model transparency & input ledger
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)]"
          >
            {modelKey} · v{modelVersion}
          </Badge>
        </div>

        {/* Section 1: How to Interpret */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
            <AppIcon icon={InformationCircleIcon} size="xs" className="text-[var(--primary)]" />
            <span>1. How to interpret this result</span>
          </h4>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Matrigluco evaluates clinical features against verified algorithmic risk models.
            The resulting probability band estimates statistical likelihood based on the 8 provided metrics,
            serving as an educational orientation tool rather than a clinical diagnosis.
          </p>
        </div>

        <Separator className="bg-[var(--border-subtle)]" />

        {/* Section 2: Exact Inputs Snapshot */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
            <AppIcon icon={Folder01Icon} size="xs" className="text-[var(--primary)]" />
            <span>2. Inputs used by the model</span>
          </h4>
          <InputSnapshotLedger
            featuresSnapshot={
              assessment.featuresSnapshot ||
              (assessment as any).features_snapshot ||
              {}
            }
          />
        </div>

        <Separator className="bg-[var(--border-subtle)]" />

        {/* Section 3: What the Model Did Not Use */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
            <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--success)]" />
            <span>3. What the model did not use</span>
          </h4>
          <div className="p-3 rounded-md bg-[var(--surface-soft)]/70 border border-[var(--border-subtle)] space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-1.5" />
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                <strong>HbA1c & Continuous Glucose:</strong> Stored separately in your private health timeline and are <strong>not</strong> factored into this 8-feature statistical model.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-1.5" />
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                <strong>Prescriptions & Clinical Notes:</strong> Uploaded medical documents remain securely in your document vault and do not alter this calculation.
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-[var(--border-subtle)]" />

        {/* Section 4: Explainability / Contribution Analysis */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-[var(--foreground)]">
            4. Contribution & explainability
          </h4>
          {assessment.explainability ? (
            <EvidenceThreads explainability={assessment.explainability} />
          ) : (
            <ExplainabilityUnavailable />
          )}
        </div>

        <Separator className="bg-[var(--border-subtle)]" />

        {/* Section 5: Calibrated Model Limitations */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
            <AppIcon icon={AlertCircleIcon} size="xs" className="text-[var(--warning)]" />
            <span>5. Calibrated model limitations</span>
          </h4>
          <ul className="list-disc list-inside text-[11px] text-[var(--muted-foreground)] space-y-1 leading-relaxed pl-1">
            <li>Outputs depend strictly on the precision and timing of your entered measurements.</li>
            <li>Does not account for gestational week progression or acute lifestyle variations.</li>
            <li>Consult a licensed maternal health practitioner for diagnostic blood tests (OGTT, fasting plasma).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
