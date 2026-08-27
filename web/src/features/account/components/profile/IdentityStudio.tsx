import React, { useState, useEffect } from "react";
import { AccountUser } from "../../types/account.types";
import { ProfileAvatar } from "./ProfileAvatar";
import { EmailVerificationState } from "./EmailVerificationState";
import { IdentityForm } from "./IdentityForm";
import { CareContext } from "./CareContext";
import { Button } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { AccountSaveState } from "../AccountSaveState";
import {
  identityFormSchema,
  careContextSchema,
  IdentityFormValues,
  CareContextFormValues,
} from "../../schemas/profile.schema";
import { FloppyDiskIcon } from "@hugeicons/core-free-icons";

interface IdentityStudioProps {
  user: AccountUser;
  onSave: (payload: {
    identity: IdentityFormValues;
    careContext: CareContextFormValues;
  }) => Promise<void>;
  isSaving: boolean;
}

export function IdentityStudio({
  user,
  onSave,
  isSaving,
}: IdentityStudioProps) {
  const [identityValues, setIdentityValues] = useState<IdentityFormValues>({
    fullName: user.fullName || "",
    phone: user.phone || "",
    emergencyContact: user.emergencyContact || "",
  });

  const [careValues, setCareValues] = useState<CareContextFormValues>({
    pregnancyWeek: user.pregnancyWeek ?? null,
    expectedDueDate: user.expectedDueDate || null,
    previousPregnancies: user.previousPregnancies ?? null,
    bloodGroup: user.bloodGroup || null,
    age: user.age ?? null,
  });

  const [identityErrors, setIdentityErrors] = useState<
    Partial<Record<keyof IdentityFormValues, string>>
  >({});
  const [careErrors, setCareErrors] = useState<
    Partial<Record<keyof CareContextFormValues, string>>
  >({});

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIdentityValues({
      fullName: user.fullName || "",
      phone: user.phone || "",
      emergencyContact: user.emergencyContact || "",
    });
    setCareValues({
      pregnancyWeek: user.pregnancyWeek ?? null,
      expectedDueDate: user.expectedDueDate || null,
      previousPregnancies: user.previousPregnancies ?? null,
      bloodGroup: user.bloodGroup || null,
      age: user.age ?? null,
    });
    setIsDirty(false);
  }, [user]);

  const handleIdentityChange = (key: keyof IdentityFormValues, value: string) => {
    setIdentityValues((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    if (identityErrors[key]) {
      setIdentityErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleCareChange = (key: keyof CareContextFormValues, value: any) => {
    setCareValues((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    if (careErrors[key]) {
      setCareErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate identity
    const identityResult = identityFormSchema.safeParse(identityValues);
    const careResult = careContextSchema.safeParse(careValues);

    let hasErrors = false;

    if (!identityResult.success) {
      const fieldErrors: Partial<Record<keyof IdentityFormValues, string>> = {};
      const issues = identityResult.error.issues || [];
      issues.forEach((err) => {
        const field = err.path[0] as keyof IdentityFormValues;
        if (field) fieldErrors[field] = err.message;
      });
      setIdentityErrors(fieldErrors);
      hasErrors = true;
    } else {
      setIdentityErrors({});
    }

    if (!careResult.success) {
      const fieldErrors: Partial<Record<keyof CareContextFormValues, string>> = {};
      const issues = careResult.error.issues || [];
      issues.forEach((err) => {
        const field = err.path[0] as keyof CareContextFormValues;
        if (field) fieldErrors[field] = err.message;
      });
      setCareErrors(fieldErrors);
      hasErrors = true;
    } else {
      setCareErrors({});
    }

    if (hasErrors) return;

    await onSave({
      identity: identityResult.data,
      careContext: careResult.data,
    });
    setIsDirty(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Identity Studio Overview */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)]">Identity Studio</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Manage your patient profile, communication credentials, and care identifiers.
          </p>
        </div>

        <div className="w-full">
          <ProfileAvatar fullName={identityValues.fullName} email={user.email} />
        </div>

        <div className="border-t border-[var(--border)] pt-6">
          <IdentityForm
            values={identityValues}
            errors={identityErrors}
            onChange={handleIdentityChange}
          />
        </div>
      </div>

      {/* Maternal Care Context Section */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <CareContext
          values={careValues}
          errors={careErrors}
          onChange={handleCareChange}
        />
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs sticky bottom-4 z-10 backdrop-blur-md">
        <AccountSaveState isSaving={isSaving} />

        <div className="flex items-center gap-3 ml-auto">
          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 font-bold text-xs h-9 px-5 rounded-xl shadow-xs"
          >
            <AppIcon icon={FloppyDiskIcon} size="xs" className="mr-1.5" />
            Save Profile Changes
          </Button>
        </div>
      </div>
    </form>
  );
}
