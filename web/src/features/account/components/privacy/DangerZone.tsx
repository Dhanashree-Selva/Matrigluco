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
import { AlertCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons";

interface DangerZoneProps {
  onDeleteAccount: () => Promise<void>;
  isDeleting?: boolean;
}

export function DangerZone({ onDeleteAccount, isDeleting = false }: DangerZoneProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    await onDeleteAccount();
    setIsOpen(false);
  };

  return (
    <div className="p-6 rounded-3xl bg-[var(--card)] border border-red-500/20 dark:border-red-500/30 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <AppIcon icon={AlertCircleIcon} size="xs" />
            Danger Zone
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Permanent account actions. Deleting your account will schedule removal of all health measurements, consultation history, and authentication sessions.
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setIsOpen(true)}
          disabled={isDeleting}
          className="text-xs font-bold rounded-xl h-9 px-4 shrink-0"
        >
          Delete Account
        </Button>
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="rounded-3xl p-6 bg-[var(--card)] border-[var(--border)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-red-600 dark:text-red-400">
              Permanently delete your account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-2">
              This action cannot be undone. All clinical assessments, glucose logs, uploaded lab reports, and doctor consultation notes associated with your account will be permanently queued for deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="text-xs font-semibold rounded-xl"
            >
              Keep Account
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 text-xs font-bold rounded-xl"
            >
              {isDeleting ? (
                <>
                  <AppIcon icon={Loading03Icon} size="xxs" className="animate-spin mr-1" />
                  Deleting Account…
                </>
              ) : (
                "Yes, Delete My Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
