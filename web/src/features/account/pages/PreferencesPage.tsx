import React from "react";
import { AccountHeader, AccountSkeleton } from "../components/AccountHeader";
import { AccountAtlas } from "../components/AccountAtlas";
import { PreferenceMatrix } from "../components/preferences/PreferenceMatrix";
import { useProfile } from "../hooks/useProfile";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks/useNotificationPreferences";
import { useAiConsent } from "../hooks/useAiConsent";
import { NotificationPreferencesRecord } from "../types/account.types";

export function PreferencesPage() {
  const { data: user, isLoading: isUserLoading } = useProfile();
  const {
    data: preferences,
    isLoading: isPrefsLoading,
    isError: isPrefsError,
  } = useNotificationPreferences();

  const updatePrefsMutation = useUpdateNotificationPreferences();
  const { consentState, isPending: isSavingConsent, setConsent } = useAiConsent();

  const handleSavePreferences = async (newPrefs: NotificationPreferencesRecord) => {
    await updatePrefsMutation.mutateAsync({
      consultation_reminders_enabled: newPrefs.consultationRemindersEnabled,
      risk_notifications_enabled: newPrefs.riskNotificationsEnabled,
      daily_summary_notifications_enabled: newPrefs.dailySummaryNotificationsEnabled,
      email_notifications_enabled: newPrefs.emailNotificationsEnabled,
    });
  };

  if (isUserLoading || isPrefsLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <AccountSkeleton />
      </div>
    );
  }

  const currentPrefs: NotificationPreferencesRecord = preferences || {
    consultationRemindersEnabled: true,
    riskNotificationsEnabled: true,
    dailySummaryNotificationsEnabled: false,
    emailNotificationsEnabled: true,
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-16 space-y-6">
      <AccountHeader user={user} />
      <AccountAtlas />
      <main>
        <PreferenceMatrix
          initialPreferences={currentPrefs}
          consentState={consentState}
          onSavePreferences={handleSavePreferences}
          onConsentChange={setConsent}
          isSavingPreferences={updatePrefsMutation.isPending}
          isSavingConsent={isSavingConsent}
        />
      </main>
    </div>
  );
}

export default PreferencesPage;
