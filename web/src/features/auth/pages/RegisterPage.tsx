import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons";
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
import { PasswordField } from "../components/PasswordField";
import { PasswordStrength } from "../components/PasswordStrength";
import { AuthSecurityNote } from "../components/AuthSecurityNote";
import { registerSchema, RegisterFormData } from "../schemas/auth.schema";
import { useRegister } from "../hooks/useRegister";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../../app/route-paths";

export default function RegisterPage() {
  useDocumentTitle("Create account");
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setFormError(null);
    try {
      await registerMutation.mutateAsync({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });

      toast.success("Account created", {
        description: "Continue with your Matrigluco setup.",
      });

      // Navigate to onboarding flow after successful account creation
      navigate(routePaths.onboarding, { replace: true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setFormError("An account with this email address already exists.");
      } else if (status === 429) {
        setFormError("Too many account creation attempts. Please try again shortly.");
      } else {
        setFormError(
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to create account. Please review your details and try again."
        );
      }
    }
  };

  return (
    <AuthShell>
      <div className="space-y-3">
        <AuthFormHeader
          eyebrow="Start Your Workspace"
          title="Create your account"
          subtitle="Set up your credentials. Health context is added in onboarding."
        />

        {formError && (
          <Alert variant="destructive" className="p-2.5 text-left">
            <AppIcon icon={AlertCircleIcon} size="xs" className="shrink-0 mt-0.5" />
            <AlertDescription className="text-xs">{formError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5" noValidate>
            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem className="space-y-0.5">
                  <FormLabel className="text-xs">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Sarah Johnson"
                      className="h-9.5 bg-[var(--surface-soft)] border-[var(--border)] focus-visible:ring-[var(--primary)] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Address */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-0.5">
                  <FormLabel className="text-xs">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      className="h-9.5 bg-[var(--surface-soft)] border-[var(--border)] focus-visible:ring-[var(--primary)] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-0.5">
                  <FormLabel className="text-xs">Create Password</FormLabel>
                  <FormControl>
                    <PasswordField
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      className="h-9.5"
                      {...field}
                    />
                  </FormControl>
                  <PasswordStrength password={passwordValue} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-0.5">
                  <FormLabel className="text-xs">Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordField
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      className="h-9.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="default"
              disabled={registerMutation.isPending}
              className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-sm cursor-pointer mt-1"
            >
              {registerMutation.isPending ? (
                <>
                  <AppIcon icon={Loading03Icon} size="xs" className="animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center text-xs text-[var(--muted-foreground)]">
          <span>Already have an account? </span>
          <Link
            to={routePaths.auth.login}
            className="font-bold text-[var(--primary)] hover:underline"
          >
            Sign in
          </Link>
        </div>

        <AuthSecurityNote />
      </div>
    </AuthShell>
  );
}
