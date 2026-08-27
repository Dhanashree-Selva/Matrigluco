import React, { useState } from "react";
import {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
  Button,
} from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  changePasswordSchema,
  ChangePasswordFormValues,
} from "../../schemas/security.schema";
import {
  ViewIcon,
  ViewOffIcon,
  LockKeyIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

interface ChangePasswordProps {
  onSave: (values: ChangePasswordFormValues) => Promise<void>;
  isSaving: boolean;
}

export function ChangePassword({ onSave, isSaving }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof ChangePasswordFormValues, string>>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangePasswordFormValues, string>> = {};
      const issues = result.error.issues || [];
      issues.forEach((err) => {
        const field = err.path[0] as keyof ChangePasswordFormValues;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSave(result.data);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <FieldSet className="space-y-4">
      <div>
        <FieldLegend variant="legend" className="text-sm font-bold text-[var(--foreground)]">
          Password & Authentication
        </FieldLegend>
        <p className="text-xs text-[var(--muted-foreground)]">
          Update the password used to authenticate your MatriGluco account. Changing password will revoke all other active sessions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <FieldGroup className="space-y-4">
          {/* Current Password */}
          <Field data-invalid={Boolean(errors.currentPassword)}>
            <FieldLabel htmlFor="sec-current-password" className="text-xs font-semibold text-[var(--foreground)]">
              Current Password
            </FieldLabel>
            <div className="relative">
              <Input
                id="sec-current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="text-xs h-9.5 rounded-xl bg-[var(--background)] border-[var(--border)] pr-10 focus-visible:ring-[var(--primary)]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? "Hide current password" : "Show current password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1"
              >
                <AppIcon icon={showCurrent ? ViewOffIcon : ViewIcon} size="xs" />
              </button>
            </div>
            {errors.currentPassword && (
              <FieldError className="text-[11px]">{errors.currentPassword}</FieldError>
            )}
          </Field>

          {/* New Password */}
          <Field data-invalid={Boolean(errors.newPassword)}>
            <FieldLabel htmlFor="sec-new-password" className="text-xs font-semibold text-[var(--foreground)]">
              New Password
            </FieldLabel>
            <div className="relative">
              <Input
                id="sec-new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 8 chars, uppercase, lowercase, number)"
                className="text-xs h-9.5 rounded-xl bg-[var(--background)] border-[var(--border)] pr-10 focus-visible:ring-[var(--primary)]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? "Hide new password" : "Show new password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1"
              >
                <AppIcon icon={showNew ? ViewOffIcon : ViewIcon} size="xs" />
              </button>
            </div>
            <FieldDescription className="text-[11px] text-[var(--muted-foreground)]">
              Must be at least 8 characters long and contain uppercase, lowercase, and numeric characters.
            </FieldDescription>
            {errors.newPassword && (
              <FieldError className="text-[11px]">{errors.newPassword}</FieldError>
            )}
          </Field>

          {/* Confirm New Password */}
          <Field data-invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel htmlFor="sec-confirm-password" className="text-xs font-semibold text-[var(--foreground)]">
              Confirm New Password
            </FieldLabel>
            <div className="relative">
              <Input
                id="sec-confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="text-xs h-9.5 rounded-xl bg-[var(--background)] border-[var(--border)] pr-10 focus-visible:ring-[var(--primary)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1"
              >
                <AppIcon icon={showConfirm ? ViewOffIcon : ViewIcon} size="xs" />
              </button>
            </div>
            {errors.confirmPassword && (
              <FieldError className="text-[11px]">{errors.confirmPassword}</FieldError>
            )}
          </Field>
        </FieldGroup>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
            className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 font-bold text-xs h-9 px-5 rounded-xl shadow-xs"
          >
            {isSaving ? (
              <>
                <AppIcon icon={Loading03Icon} size="xs" className="animate-spin mr-1.5" />
                Updating Password…
              </>
            ) : (
              <>
                <AppIcon icon={LockKeyIcon} size="xs" className="mr-1.5" />
                Update Password
              </>
            )}
          </Button>
        </div>
      </form>
    </FieldSet>
  );
}
