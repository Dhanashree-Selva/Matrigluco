import React from "react";
import { Checkbox, Field, FieldContent, FieldLabel, FieldDescription } from "../../../../shared/ui";
import { AiConsentDetails } from "./AiConsentDetails";
import { AiConsentState } from "../../types/account.types";
import { AppIcon } from "../../../../components/common/AppIcon";
import { SecurityCheckIcon, InformationCircleIcon } from "@hugeicons/core-free-icons";

interface AiContextBoundaryProps {
  consentState: AiConsentState;
  onConsentChange: (granted: boolean) => void;
  disabled?: boolean;
}

export function AiContextBoundary({
  consentState,
  onConsentChange,
  disabled = false,
}: AiContextBoundaryProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
          <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)]" />
          AI Health Context Boundary
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Explicit privacy boundary governing how the MatriGluco Maternal Assistant accesses your health context.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-4">
        <Field orientation="horizontal" className="items-start gap-3">
          <Checkbox
            id="ai-health-context-consent"
            checked={consentState.isGranted}
            onCheckedChange={(checked) => onConsentChange(Boolean(checked))}
            disabled={disabled}
            className="mt-1 data-checked:bg-[var(--primary)] data-checked:border-[var(--primary)]"
          />
          <FieldContent className="space-y-1">
            <FieldLabel
              htmlFor="ai-health-context-consent"
              className="text-xs font-bold text-[var(--foreground)] cursor-pointer"
            >
              Allow MatriGluco Assistant to use authorized maternal health context
            </FieldLabel>
            <FieldDescription className="text-[11.5px] text-[var(--muted-foreground)] leading-relaxed">
              When authorized, the conversational assistant references your gestational week, glucose logs, and recent meals to generate tailored glycemic advice. When disabled, the assistant operates in zero-context mode.
            </FieldDescription>
          </FieldContent>
        </Field>

        <div className="border-t border-[var(--border)] pt-3">
          <AiConsentDetails />
        </div>

        {consentState.grantedAt && consentState.isGranted && (
          <p className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1 pt-1">
            <AppIcon icon={InformationCircleIcon} size="xxs" />
            Consent authorized on {new Date(consentState.grantedAt).toLocaleDateString()}. You can revoke this anytime.
          </p>
        )}
      </div>
    </div>
  );
}
