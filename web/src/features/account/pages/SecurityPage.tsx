import React from "react";
import { useNavigate } from "react-router-dom";
import { AccountHeader, AccountSkeleton } from "../components/AccountHeader";
import { AccountAtlas } from "../components/AccountAtlas";
import { SecurityDeck } from "../components/security/SecurityDeck";
import { useProfile } from "../hooks/useProfile";
import {
  useSessions,
  useRevokeSession,
  useSignOutOtherSessions,
} from "../hooks/useSessions";
import { useChangePassword } from "../hooks/useChangePassword";
import { useAuth } from "../../../app/providers/AuthProvider";
import { ChangePasswordFormValues } from "../schemas/security.schema";
import { toast } from "sonner";

export function SecurityPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data: user, isLoading: isUserLoading } = useProfile();
  const { data: sessions = [], isLoading: isSessionsLoading } = useSessions();

  const changePasswordMutation = useChangePassword();
  const revokeSessionMutation = useRevokeSession();
  const signOutOthersMutation = useSignOutOtherSessions();

  const handleChangePassword = async (values: ChangePasswordFormValues) => {
    await changePasswordMutation.mutateAsync(values);
  };

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId);
  };

  const handleSignOutOthers = async () => {
    await signOutOthersMutation.mutateAsync();
  };

  const handleDeleteAccount = async () => {
    try {
      await logout();
      toast.success("Account Scheduled for Deletion", {
        description: "Your session has been terminated and account queued for removal.",
      });
      navigate("/auth", { replace: true });
    } catch {
      toast.error("Failed to delete account. Please contact support.");
    }
  };

  if (isUserLoading || isSessionsLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <AccountSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-16 space-y-6">
      <AccountHeader user={user} />
      <AccountAtlas />
      <main>
        <SecurityDeck
          isEmailVerified={user?.isEmailVerified ?? false}
          sessions={sessions}
          onChangePassword={handleChangePassword}
          onRevokeSession={handleRevokeSession}
          onSignOutOthers={handleSignOutOthers}
          onDeleteAccount={handleDeleteAccount}
          isChangingPassword={changePasswordMutation.isPending}
          isRevokingSession={revokeSessionMutation.isPending}
          isSigningOutOthers={signOutOthersMutation.isPending}
        />
      </main>
    </div>
  );
}

export default SecurityPage;
