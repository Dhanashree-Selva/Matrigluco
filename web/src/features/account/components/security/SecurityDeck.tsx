import React from "react";
import { TrustStrip } from "./TrustStrip";
import { ChangePassword } from "./ChangePassword";
import { SessionConstellation } from "./SessionConstellation";
import { PrivacyMap } from "../privacy/PrivacyMap";
import { DangerZone } from "../privacy/DangerZone";
import { SessionRecord } from "../../types/account.types";
import { ChangePasswordFormValues } from "../../schemas/security.schema";

interface SecurityDeckProps {
  isEmailVerified: boolean;
  sessions: SessionRecord[];
  onChangePassword: (values: ChangePasswordFormValues) => Promise<void>;
  onRevokeSession: (sessionId: string) => void;
  onSignOutOthers: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  isChangingPassword?: boolean;
  isRevokingSession?: boolean;
  isSigningOutOthers?: boolean;
  isDeletingAccount?: boolean;
}

export function SecurityDeck({
  isEmailVerified,
  sessions,
  onChangePassword,
  onRevokeSession,
  onSignOutOthers,
  onDeleteAccount,
  isChangingPassword = false,
  isRevokingSession = false,
  isSigningOutOthers = false,
  isDeletingAccount = false,
}: SecurityDeckProps) {
  return (
    <div className="space-y-8">
      {/* Trust Strip */}
      <TrustStrip
        isEmailVerified={isEmailVerified}
        activeSessionsCount={sessions.length}
      />

      {/* Change Password Section */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <ChangePassword
          onSave={onChangePassword}
          isSaving={isChangingPassword}
        />
      </div>

      {/* Active Sessions Constellation */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <SessionConstellation
          sessions={sessions}
          onRevokeSession={onRevokeSession}
          onSignOutOthers={onSignOutOthers}
          isRevokingSession={isRevokingSession}
          isSigningOutOthers={isSigningOutOthers}
        />
      </div>

      {/* Data & Privacy Map */}
      <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <PrivacyMap />
      </div>

      {/* Danger Zone */}
      <DangerZone
        onDeleteAccount={onDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </div>
  );
}
