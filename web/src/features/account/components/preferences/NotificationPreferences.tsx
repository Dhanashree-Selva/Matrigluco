import React from "react";
import { NotificationPreferenceRow } from "./NotificationPreferenceRow";
import { NotificationPreferencesRecord } from "../../types/account.types";
import { FieldSet, FieldLegend } from "../../../../shared/ui";

interface NotificationPreferencesProps {
  preferences: NotificationPreferencesRecord;
  onToggle: (key: keyof NotificationPreferencesRecord, value: boolean) => void;
  disabled?: boolean;
}

export function NotificationPreferences({
  preferences,
  onToggle,
  disabled = false,
}: NotificationPreferencesProps) {
  return (
    <FieldSet className="space-y-6">
      <div>
        <FieldLegend variant="legend" className="text-sm font-bold text-[var(--foreground)]">
          Clinical Alerts & Reminders
        </FieldLegend>
        <p className="text-xs text-[var(--muted-foreground)]">
          Control how and when you receive critical care reminders and health summary updates.
        </p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {/* Consultation Reminders */}
        <NotificationPreferenceRow
          id="pref-consultations"
          label="Consultation Reminders"
          description="Advance notifications regarding upcoming doctor appointments, clinician messages, and preparation reminders."
          checked={preferences.consultationRemindersEnabled}
          onCheckedChange={(val) => onToggle("consultationRemindersEnabled", val)}
          disabled={disabled}
        />

        {/* Risk Notifications */}
        <NotificationPreferenceRow
          id="pref-risk"
          label="Gestational Risk & Glycemic Alerts"
          description="Immediate alerts when logged blood glucose measurements exceed safe trimester thresholds."
          checked={preferences.riskNotificationsEnabled}
          onCheckedChange={(val) => onToggle("riskNotificationsEnabled", val)}
          disabled={disabled}
        />

        {/* Daily Summary */}
        <NotificationPreferenceRow
          id="pref-daily-summary"
          label="Daily Metabolic Summary"
          description="Evening digests consolidating daily meals, logged glucose records, and maternal wellness trends."
          checked={preferences.dailySummaryNotificationsEnabled}
          onCheckedChange={(val) => onToggle("dailySummaryNotificationsEnabled", val)}
          disabled={disabled}
        />

        {/* Email Channel */}
        <NotificationPreferenceRow
          id="pref-email-channel"
          label="Email Notification Channel"
          description="Receive clinical reminders and consultation confirmations directly at your registered email address."
          checked={preferences.emailNotificationsEnabled}
          onCheckedChange={(val) => onToggle("emailNotificationsEnabled", val)}
          disabled={disabled}
        />
      </div>
    </FieldSet>
  );
}
