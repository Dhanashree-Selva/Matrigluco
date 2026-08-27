import React, { useState, useEffect } from "react";
import { NotificationPreferences } from "./NotificationPreferences";
import { AiContextBoundary } from "./AiContextBoundary";
import {
  NotificationPreferencesRecord,
  AiConsentState,
} from "../../types/account.types";
import { Button } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { AccountSaveState } from "../AccountSaveState";
import { FloppyDiskIcon } from "@hugeicons/core-free-icons";

interface PreferenceMatrixProps {
  initialPreferences: NotificationPreferencesRecord;
  consentState: AiConsentState;
  onSavePreferences: (prefs: NotificationPreferencesRecord) => Promise<void>;
  onConsentChange: (granted: boolean) => void;
  isSavingPreferences: boolean;
  isSavingConsent: boolean;
}

export function PreferenceMatrix({
  initialPreferences,
  consentState,
  onSavePreferences,
  onConsentChange,
  isSavingPreferences,
  isSavingConsent,
}: PreferenceMatrixProps) {
  const [preferences, setPreferences] =
    useState<NotificationPreferencesRecord>(initialPreferences);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setPreferences(initialPreferences);
    setIsDirty(false);
  }, [initialPreferences]);

  const handleToggle = (
    key: keyof NotificationPreferencesRecord,
    value: boolean
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSavePreferences(preferences);
    setIsDirty(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Notification Preferences */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs space-y-6">
        <NotificationPreferences
          preferences={preferences}
          onToggle={handleToggle}
          disabled={isSavingPreferences}
        />
      </div>

      {/* AI Context Boundary */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <AiContextBoundary
          consentState={consentState}
          onConsentChange={onConsentChange}
          disabled={isSavingConsent}
        />
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs sticky bottom-4 z-10 backdrop-blur-md">
        <AccountSaveState isSaving={isSavingPreferences || isSavingConsent} />

        <div className="flex items-center gap-3 ml-auto">
          <Button
            type="submit"
            disabled={isSavingPreferences || !isDirty}
            className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 font-bold text-xs h-9 px-5 rounded-xl shadow-xs"
          >
            <AppIcon icon={FloppyDiskIcon} size="xs" className="mr-1.5" />
            Save Notification Preferences
          </Button>
        </div>
      </div>
    </form>
  );
}
