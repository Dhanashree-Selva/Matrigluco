import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import {
  Mail01Icon,
  ArrowLeft01Icon,
  AlertCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
  Alert,
  AlertDescription,
  toast,
} from "../../../shared/ui";
import { AuthShell } from "../components/AuthShell";
import { AuthFormHeader } from "../components/AuthFormHeader";
import { AuthStatusState } from "../components/AuthStatusState";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "../schemas/auth.schema";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../../app/route-paths";

export default function ForgotPasswordPage() {
  useDocumentTitle("Forgot password");
  const forgotMutation = useForgotPassword();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setFormError(null);
    try {
      await forgotMutation.mutateAsync(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success("Reset instructions requested", {
        description: "If an eligible account matches that email, reset instructions will be sent.",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        setFormError("Too many password reset requests. Please try again shortly.");
      } else {
        // Non-enumerating generic success fallback to prevent user enumeration
        setSubmittedEmail(data.email);
        setIsSubmitted(true);
      }
    }
  };

  return (
    <AuthShell showBrandPanel={false}>
      {isSubmitted ? (
        <AuthStatusState
          icon={Mail01Icon}
          eyebrow="Instructions Sent"
          title="Check your email"
          description={`If an eligible account matches ${submittedEmail}, instructions to reset your password have been sent.`}
          action={
            <Button
              asChild
              className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/20"
            >
              <Link
                to={routePaths.auth.login}
                className="flex items-center justify-center gap-2"
              >
                <AppIcon icon={ArrowLeft01Icon} size="xs" />
                <span>Back to Sign In</span>
              </Link>
            </Button>
          }
          secondaryAction={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Try a different email address
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <AuthFormHeader
            eyebrow="Recover Access"
            title="Reset your password"
            subtitle="Enter your account email. If it matches an eligible account, Matrigluco will send password-reset instructions."
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="h-11 bg-[var(--surface-soft)] border-[var(--border)] focus-visible:ring-[var(--primary)] text-sm"
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
                disabled={forgotMutation.isPending}
                className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/20 cursor-pointer"
              >
                {forgotMutation.isPending ? (
                  <>
                    <AppIcon icon={Loading03Icon} size="xs" className="animate-spin" />
                    <span>Sending instructions…</span>
                  </>
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </Button>
            </form>
          </Form>

          <div className="pt-2 text-center text-xs text-[var(--muted-foreground)]">
            <Link
              to={routePaths.auth.login}
              className="inline-flex items-center gap-1.5 font-bold text-[var(--primary)] hover:underline"
            >
              <AppIcon icon={ArrowLeft01Icon} size="xs" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
