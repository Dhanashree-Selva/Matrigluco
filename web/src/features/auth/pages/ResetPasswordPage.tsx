import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Loading03Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Alert,
  AlertDescription,
  toast,
} from "../../../shared/ui";
import { AuthShell } from "../components/AuthShell";
import { AuthFormHeader } from "../components/AuthFormHeader";
import { AuthStatusState } from "../components/AuthStatusState";
import { PasswordField } from "../components/PasswordField";
import { PasswordStrength } from "../components/PasswordStrength";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "../schemas/auth.schema";
import { useResetPassword } from "../hooks/useResetPassword";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../../app/route-paths";

export default function ResetPasswordPage() {
  useDocumentTitle("Reset password");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const resetMutation = useResetPassword();
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");

  if (!token) {
    return (
      <AuthShell showBrandPanel={false}>
        <AuthStatusState
          icon={AlertCircleIcon}
          variant="danger"
          eyebrow="Invalid Reset Request"
          title="Reset link invalid or missing"
          description="This password reset link does not contain a valid security token or has already been used."
          action={
            <Button
              asChild
              className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/20"
            >
              <Link
                to={routePaths.auth.forgotPassword}
                className="flex items-center justify-center gap-2"
              >
                <span>Request New Reset Link</span>
              </Link>
            </Button>
          }
          secondaryAction={
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <Link to={routePaths.auth.login}>
                Return to Sign In
              </Link>
            </Button>
          }
        />
      </AuthShell>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setFormError(null);
    try {
      await resetMutation.mutateAsync({
        token,
        new_password: data.password,
      });
      setIsSuccess(true);
      toast.success("Password updated", {
        description: "You can now sign in with your new password.",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400 || status === 404 || status === 422) {
        setFormError(
          "This password reset link is invalid or has expired. Please request a new link."
        );
      } else {
        setFormError(
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to reset password. Please try again or request a new link."
        );
      }
    }
  };

  return (
    <AuthShell showBrandPanel={false}>
      {isSuccess ? (
        <AuthStatusState
          icon={CheckmarkCircle02Icon}
          variant="success"
          eyebrow="Security Updated"
          title="Password updated successfully"
          description="Your password has been changed. You can now sign in using your new credentials."
          action={
            <Button
              asChild
              className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/20"
            >
              <Link
                to={routePaths.auth.login}
                className="flex items-center justify-center gap-2"
              >
                <span>Sign In Now</span>
                <AppIcon icon={ArrowRight01Icon} size="xs" />
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <AuthFormHeader
            eyebrow="Create New Password"
            title="Set your new password"
            subtitle="Choose a strong password with at least 8 characters to secure your account."
          />

          {formError && (
            <Alert variant="destructive" className="p-3.5 text-left">
              <AppIcon icon={AlertCircleIcon} size="xs" className="shrink-0 mt-0.5" />
              <AlertDescription className="text-xs">{formError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordField
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                        {...field}
                      />
                    </FormControl>
                    <PasswordStrength password={passwordValue} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <PasswordField
                        autoComplete="new-password"
                        placeholder="Repeat your new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={resetMutation.isPending}
                className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/20 cursor-pointer"
              >
                {resetMutation.isPending ? (
                  <>
                    <AppIcon icon={Loading03Icon} size="xs" className="animate-spin" />
                    <span>Updating password…</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </form>
          </Form>

          <div className="pt-2 text-center text-xs text-[var(--muted-foreground)]">
            <Link
              to={routePaths.auth.login}
              className="font-bold text-[var(--primary)] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
