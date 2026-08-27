import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Button,
} from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { Logout03Icon, Loading03Icon } from "@hugeicons/core-free-icons";

interface SignOutOtherSessionsProps {
  onSignOutOthers: () => Promise<void>;
  isSigningOut: boolean;
  disabled?: boolean;
}

export function SignOutOtherSessions({
  onSignOutOthers,
  isSigningOut,
  disabled = false,
}: SignOutOtherSessionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    await onSignOutOthers();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={disabled || isSigningOut}
        className="text-xs font-semibold rounded-xl border-[var(--border)] hover:bg-[var(--accent-soft)]"
      >
        <AppIcon icon={Logout03Icon} size="xs" className="mr-1.5" />
        Sign Out of Other Sessions
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="rounded-3xl p-6 bg-[var(--card)] border-[var(--border)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-[var(--foreground)]">
              Sign out of other sessions?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-2">
              This will revoke access on all other browsers and mobile devices where your account is currently signed in. Your current browser session will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-2">
            <AlertDialogCancel
              disabled={isSigningOut}
              className="text-xs font-semibold rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isSigningOut}
              className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 text-xs font-bold rounded-xl"
            >
              {isSigningOut ? (
                <>
                  <AppIcon icon={Loading03Icon} size="xxs" className="animate-spin mr-1" />
                  Signing Out…
                </>
              ) : (
                "Sign Out Others"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
