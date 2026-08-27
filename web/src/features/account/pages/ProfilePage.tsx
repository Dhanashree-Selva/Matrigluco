import React from "react";
import { AccountHeader, AccountSkeleton } from "../components/AccountHeader";
import { AccountAtlas } from "../components/AccountAtlas";
import { IdentityStudio } from "../components/profile/IdentityStudio";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";
import { IdentityFormValues, CareContextFormValues } from "../schemas/profile.schema";

export function ProfilePage() {
  const { data: user, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const handleSave = async (payload: {
    identity: IdentityFormValues;
    careContext: CareContextFormValues;
  }) => {
    await updateProfileMutation.mutateAsync({
      full_name: payload.identity.fullName,
      phone: payload.identity.phone || null,
      emergency_contact: payload.identity.emergencyContact || null,
      pregnancy_week: payload.careContext.pregnancyWeek,
      expected_due_date: payload.careContext.expectedDueDate,
      previous_pregnancies: payload.careContext.previousPregnancies,
      blood_group: payload.careContext.bloodGroup,
      age: payload.careContext.age,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <AccountSkeleton />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center space-y-3">
          <h2 className="text-sm font-bold text-[var(--foreground)]">Unable to load profile</h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            There was an issue fetching your account identity. Please check your network connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-16 space-y-6">
      <AccountHeader user={user} />
      <AccountAtlas />
      <main>
        <IdentityStudio
          user={user}
          onSave={handleSave}
          isSaving={updateProfileMutation.isPending}
        />
      </main>
    </div>
  );
}

export default ProfilePage;
