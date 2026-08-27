import React from "react";
import { AppLogo } from "../../../shared/brand/AppLogo";
import { AssistantSafetyNote } from "./AssistantSafetyNote";
import { QuestionDeck } from "./QuestionDeck";
import { ContextGate } from "./ContextGate";

interface CareDeskProps {
  showContextGate: boolean;
  resourceLabel?: string;
  onAcceptConsent: () => void;
  onDeclineConsent: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export function CareDesk({
  showContextGate,
  resourceLabel,
  onAcceptConsent,
  onDeclineConsent,
  onSelectPrompt,
}: CareDeskProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-3xl mx-auto w-full my-auto text-center">
      <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-4">
        <AppLogo size={28} />
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
        Matrigluco Educational Care Desk
      </h2>
      <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 max-w-md mx-auto leading-relaxed">
        Explore clinical concepts, understand lab terminology, and learn how maternal metabolic factors interact during pregnancy.
      </p>

      <div className="w-full text-left mt-6">
        <AssistantSafetyNote />

        {showContextGate && (
          <ContextGate
            resourceLabel={resourceLabel}
            onAcceptConsent={onAcceptConsent}
            onDeclineConsent={onDeclineConsent}
          />
        )}

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] text-center mb-3">
            Suggested Educational Inquiries
          </p>
          <QuestionDeck onSelectPrompt={onSelectPrompt} />
        </div>
      </div>
    </div>
  );
}
