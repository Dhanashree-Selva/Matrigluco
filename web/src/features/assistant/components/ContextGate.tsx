import React, { useState } from "react";
import {
  Checkbox,
  Field,
  FieldLabel,
  FieldDescription,
  Button,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { SecurityCheckIcon } from "@hugeicons/core-free-icons";

interface ContextGateProps {
  resourceLabel?: string;
  onAcceptConsent: () => void;
  onDeclineConsent: () => void;
}

export function ContextGate({
  resourceLabel,
  onAcceptConsent,
  onDeclineConsent,
}: ContextGateProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-xs max-w-2xl mx-auto my-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0 text-[var(--primary)]">
          <AppIcon icon={SecurityCheckIcon} size="md" />
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
              Use my Matrigluco health context for this conversation?
            </h2>
            <p className="text-xs sm:text-[13px] text-[var(--muted-foreground)] leading-relaxed mt-1">
              This allows the educational assistant to reference authorized health data
              {resourceLabel ? ` (such as your ${resourceLabel})` : " (such as your latest stored risk assessment or metabolic logs)"} to provide personalized context in this dialogue.
            </p>
          </div>

          <div className="bg-[var(--accent-soft)]/50 rounded-xl p-3.5 border border-[var(--border)]/60">
            <Field className="flex items-start gap-3 space-y-0">
              <Checkbox
                id="health-context-consent-checkbox"
                checked={isChecked}
                onCheckedChange={(val) => setIsChecked(Boolean(val))}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <FieldLabel
                  htmlFor="health-context-consent-checkbox"
                  className="text-xs font-semibold text-[var(--foreground)] cursor-pointer"
                >
                  I agree to allow relevant health context for this conversation.
                </FieldLabel>
                <FieldDescription className="text-[11px] text-[var(--muted-foreground)] leading-normal">
                  You can withdraw consent at any time. Raw medical records and credentials are never transmitted externally.
                </FieldDescription>
              </div>
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              disabled={!isChecked}
              onClick={onAcceptConsent}
              size="sm"
              className="font-medium"
            >
              Continue with health context
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onDeclineConsent}
              size="sm"
            >
              Continue without health context
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
