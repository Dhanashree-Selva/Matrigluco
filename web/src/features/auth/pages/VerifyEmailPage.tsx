import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Loading03Icon,
  ArrowRight01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Button, Input, toast } from "../../../shared/ui";
import { AuthShell } from "../components/AuthShell";
import { AuthStatusState } from "../components/AuthStatusState";
import { useVerifyEmail, useResendVerification } from "../hooks/useVerifyEmail";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../../app/route-paths";

export default function VerifyEmailPage() {
  useDocumentTitle("Verify email");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (token && !attemptedRef.current) {
      attemptedRef.current = true;
      verifyMutation.mutate(
        { token },
        {
          onSuccess: () => {
            toast.success("Email verified", {
              description: "Your email address has been confirmed.",
            });
          },
        }
      );
    }
  }, [token, verifyMutation]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    try {
      await resendMutation.mutateAsync({ email: resendEmail });
      setResendSent(true);
      toast.success("Verification email requested", {
        description: "If the account is eligible, another verification email will be sent.",
      });
    } catch {
      // Non-enumerating fallback
      setResendSent(true);
      toast.success("Verification email requested", {
        description: "If the account is eligible, another verification email will be sent.",
      });
    }
  };

  if (!token) {
    return (
      <AuthShell showBrandPanel={false}>
        {resendSent ? (
          <AuthStatusState
            icon={Mail01Icon}
            eyebrow="Verification Sent"
            title="Check your inbox"
            description={`If an unverified account matches ${resendEmail}, a new verification link has been sent.`}
            action={
              <Button
                asChild
                className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/20"
              >
                <Link to={routePaths.auth.login}>
                  <span>Return to Sign In</span>
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center border border-[var(--primary)]/20 shadow-xs">
                <AppIcon icon={Mail01Icon} size="md" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                Verify your email address
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-sm mx-auto">
                Please follow the verification link sent to your email inbox, or enter your address below to request a new link.
              </p>
            </div>

            <form onSubmit={handleResend} className="space-y-4 max-w-sm mx-auto text-left">
              <div className="space-y-1.5">
                <label
                  htmlFor="resend-email"
                  className="block text-xs font-bold text-[var(--foreground)]"
                >
                  Account Email
                </label>
                <Input
                  id="resend-email"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-11 bg-[var(--surface-soft)] border-[var(--border)] focus-visible:ring-[var(--primary)] text-sm"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={resendMutation.isPending}
                className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/20 cursor-pointer"
              >
                {resendMutation.isPending ? (
                  <>
                    <AppIcon icon={Loading03Icon} size="xs" className="animate-spin" />
                    <span>Sending link…</span>
                  </>
                ) : (
                  <span>Resend Verification Email</span>
                )}
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-[var(--muted-foreground)]">
              <Link to={routePaths.auth.login} className="font-bold text-[var(--primary)] hover:underline">
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell showBrandPanel={false}>
      {verifyMutation.isPending && (
        <AuthStatusState
          icon={Loading03Icon}
          eyebrow="Verification In Progress"
          title="Verifying your email…"
          description="Please wait a moment while we validate your security verification token."
        />
      )}

      {verifyMutation.isSuccess && (
        <AuthStatusState
          icon={CheckmarkCircle02Icon}
          variant="success"
          eyebrow="Account Confirmed"
          title="Email verified successfully"
          description="Your email address has been verified. You can now access your full health workspace."
          action={
            <Button
              asChild
              className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/20"
            >
              <Link
                to={routePaths.auth.login}
                className="flex items-center justify-center gap-2"
              >
                <span>Continue to Sign In</span>
                <AppIcon icon={ArrowRight01Icon} size="xs" />
              </Link>
            </Button>
          }
        />
      )}

      {verifyMutation.isError && (
        <AuthStatusState
          icon={AlertCircleIcon}
          variant="danger"
          eyebrow="Verification Failed"
          title="Verification link expired or invalid"
          description="This verification link is no longer valid or has already been used. Please request a new verification link."
          action={
            <Button
              asChild
              className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/20"
            >
              <Link
                to={routePaths.auth.verifyEmail}
                className="flex items-center justify-center gap-2"
              >
                <span>Request New Link</span>
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
      )}
    </AuthShell>
  );
}
