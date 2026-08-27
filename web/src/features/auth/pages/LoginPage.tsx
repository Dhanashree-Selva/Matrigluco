import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { AuthSecurityNote } from "../components/AuthSecurityNote";
import { loginSchema, LoginFormData } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useLogin";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../../app/route-paths";

export default function LoginPage() {
  useDocumentTitle("Sign in");
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    try {
      const result = await loginMutation.mutateAsync(data);
      const user = result.user;

      toast.success("Welcome back", {
        description: "Your Matrigluco workspace is ready.",
      });

      // Safe intended route redirection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const from = (location.state as any)?.from?.pathname;
      if (from && from.startsWith("/app")) {
        navigate(from, { replace: true });
      } else if (user && !user.pregnancy_week && !user.due_date) {
        navigate(routePaths.onboarding, { replace: true });
      } else {
        navigate(routePaths.app.dashboard, { replace: true });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        toast.warning("Too many sign-in attempts", {
          description: "Please try again shortly.",
        });
        setFormError("Too many sign-in attempts. Please try again shortly.");
      } else if (status === 503 || status === 502) {
        setFormError("Sign-in service is temporarily unavailable. Please try again.");
      } else {
        setFormError(
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "The email or password could not be verified. Please check your credentials."
        );
      }
    }
  };

  return (
    <AuthShell>
      <div className="space-y-4">
        <AuthFormHeader
          eyebrow="Welcome Back"
          title="Sign in to your care workspace"
          subtitle="Access your health timeline, risk assessments, and private assistant."
        />

        {formError && (
          <Alert variant="destructive" className="p-3 text-left">
            <AppIcon icon={AlertCircleIcon} size="xs" className="shrink-0 mt-0.5" />
            <AlertDescription className="text-xs">{formError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      className="h-10 bg-[var(--surface-soft)] border-[var(--border)] focus-visible:ring-[var(--primary)] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs">Password</FormLabel>
                    <Link
                      to={routePaths.auth.forgotPassword}
                      className="text-xs font-bold text-[var(--primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded-md"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordField
                      autoComplete="current-password"
                      placeholder="Enter your account password"
                      className="h-10"
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
              disabled={loginMutation.isPending}
              className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-sm cursor-pointer mt-1"
            >
              {loginMutation.isPending ? (
                <>
                  <AppIcon icon={Loading03Icon} size="xs" className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center text-xs text-[var(--muted-foreground)]">
          <span>Don't have an account? </span>
          <Link
            to={routePaths.auth.register}
            className="font-bold text-[var(--primary)] hover:underline"
          >
            Create an account
          </Link>
        </div>

        <AuthSecurityNote />
      </div>
    </AuthShell>
  );
}
