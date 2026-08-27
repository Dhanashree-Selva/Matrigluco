import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PreferenceMatrix } from "../components/preferences/PreferenceMatrix";
import {
  NotificationPreferencesRecord,
  AiConsentState,
} from "../types/account.types";

describe("PreferenceMatrix Component", () => {
  const initialPrefs: NotificationPreferencesRecord = {
    consultationRemindersEnabled: true,
    riskNotificationsEnabled: true,
    dailySummaryNotificationsEnabled: false,
    emailNotificationsEnabled: true,
  };

  const consentState: AiConsentState = {
    isGranted: false,
    version: "maternal-ai-v1",
  };

  it("renders notification switches and AI health context checkbox", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onConsent = vi.fn();

    render(
      <PreferenceMatrix
        initialPreferences={initialPrefs}
        consentState={consentState}
        onSavePreferences={onSave}
        onConsentChange={onConsent}
        isSavingPreferences={false}
        isSavingConsent={false}
      />
    );

    expect(screen.getByText(/consultation reminders/i)).toBeInTheDocument();
    expect(screen.getByText(/gestational risk & glycemic alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/daily metabolic summary/i)).toBeInTheDocument();
    expect(
      screen.getByText(/allow matrigluco assistant to use authorized maternal health context/i)
    ).toBeInTheDocument();
  });

  it("toggles explicit AI health context consent on checkbox click", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onConsent = vi.fn();

    render(
      <PreferenceMatrix
        initialPreferences={initialPrefs}
        consentState={consentState}
        onSavePreferences={onSave}
        onConsentChange={onConsent}
        isSavingPreferences={false}
        isSavingConsent={false}
      />
    );

    const consentCheckbox = screen.getByRole("checkbox");
    expect(consentCheckbox).not.toBeChecked();
    fireEvent.click(consentCheckbox);

    expect(onConsent).toHaveBeenCalledWith(true);
  });
});
