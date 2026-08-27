import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft01Icon,
  Home01Icon,
  RefreshIcon,
  AlertCircleIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../components/common/AppIcon";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Button,
  ButtonGroup,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "../ui";
import { SystemStateKind } from "../illustrations/system-states/system-state.types";
import { SystemStateIllustration } from "../illustrations/system-states/SystemStateIllustration";
import { SystemStateSurface } from "./SystemStateSurface";
import { ContinuityLine } from "./ContinuityLine";
import { SystemReference } from "./SystemReference";
import { systemStateCopy } from "./systemStateCopy";

export interface SystemStateActionItem {
  label: string;
  onClick?: () => void;
  to?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  icon?: any;
  loading?: boolean;
}

export interface SystemStatePageProps {
  kind?: SystemStateKind;
  codeLabel?: string;
  headline?: string;
  description?: string;
  customIllustration?: ReactNode;
  primaryAction?: SystemStateActionItem;
  secondaryAction?: SystemStateActionItem;
  tertiaryActions?: SystemStateActionItem[];
  requestId?: string | null;
  alertNotice?: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  children?: ReactNode;
  className?: string;
  isEmbedded?: boolean;
}

export function SystemStatePage({
  kind = "not-found",
  codeLabel,
  headline,
  description,
  customIllustration,
  primaryAction,
  secondaryAction,
  tertiaryActions,
  requestId,
  alertNotice,
  children,
  className = "",
  isEmbedded = false,
}: SystemStatePageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultCopy = systemStateCopy[kind] || systemStateCopy["not-found"];
  const displayCode = codeLabel ?? defaultCopy.codeLabel;
  const displayHeadline = headline ?? defaultCopy.headline;
  const displayDescription = description ?? defaultCopy.description;

  // Safe browser back check
  const handleSafeGoBack = () => {
    if (window.history.length > 1 && location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/app/dashboard");
    }
  };

  // Default Action Fallbacks based on State Kind
  const resolvedPrimary: SystemStateActionItem = primaryAction || {
    label: defaultCopy.primaryActionLabel,
    onClick:
      kind === "unexpected-error" || kind === "service-unavailable" || kind === "maintenance"
        ? () => window.location.reload()
        : () => navigate("/app/dashboard"),
    variant: "default",
    icon:
      kind === "unexpected-error" || kind === "service-unavailable"
        ? RefreshIcon
        : Home01Icon,
  };

  const resolvedSecondary: SystemStateActionItem | undefined =
    secondaryAction !== undefined
      ? secondaryAction
      : defaultCopy.secondaryActionLabel
      ? {
          label: defaultCopy.secondaryActionLabel,
          onClick:
            defaultCopy.secondaryActionLabel === "Go back"
              ? handleSafeGoBack
              : () => navigate("/"),
          variant: "outline",
          icon:
            defaultCopy.secondaryActionLabel === "Go back"
              ? ArrowLeft01Icon
              : Home01Icon,
        }
      : undefined;

  const content = (
    <Empty
      data-slot="care-system-state"
      className={`border-0 p-0 text-left bg-transparent ${
        isEmbedded ? "max-w-3xl mx-auto py-8" : "w-full"
      }`}
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ── Left / Top Column: Narrative & Recovery Actions (5-6 cols) ── */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6 text-left">
          {/* Metadata Code Badge */}
          {displayCode && (
            <Badge
              variant="outline"
              className="px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase rounded-md border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)]"
            >
              {displayCode}
            </Badge>
          )}

          {/* Core Narrative Header */}
          <EmptyHeader className="items-start text-left max-w-none p-0 gap-3">
            <EmptyTitle className="text-left font-normal p-0 tracking-normal">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                {displayHeadline}
              </h1>
            </EmptyTitle>
            <EmptyDescription className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed max-w-lg">
              {displayDescription}
            </EmptyDescription>
          </EmptyHeader>

          {/* Technical Reference Code if available */}
          {requestId && (
            <div className="pt-1">
              <SystemReference requestId={requestId} />
            </div>
          )}

          {/* Supplemental System Alert */}
          {alertNotice && (
            <Alert className="w-full max-w-lg bg-[var(--surface-soft)] border-[var(--border)] text-xs">
              <AppIcon icon={AlertCircleIcon} size="sm" className="text-[var(--primary)] shrink-0" />
              <AlertTitle className="text-xs font-bold text-[var(--foreground)]">
                {alertNotice.title}
              </AlertTitle>
              <AlertDescription className="text-[11px] text-[var(--muted-foreground)]">
                {alertNotice.description}
              </AlertDescription>
              {alertNotice.actionLabel && alertNotice.onAction && (
                <AlertAction>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={alertNotice.onAction}
                    className="text-[11px] font-bold text-[var(--primary)] hover:bg-[var(--accent-soft)]"
                  >
                    {alertNotice.actionLabel}
                  </Button>
                </AlertAction>
              )}
            </Alert>
          )}

          {/* Recovery Actions Group */}
          <EmptyContent className="items-start max-w-none p-0 pt-2 w-full">
            <div className="flex flex-wrap items-center gap-3">
              <ButtonGroup>
                {resolvedPrimary && (
                  <Button
                    variant={resolvedPrimary.variant || "default"}
                    onClick={resolvedPrimary.onClick}
                    disabled={resolvedPrimary.loading}
                    className="h-10 px-5 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] shadow-xs rounded-md inline-flex items-center gap-2"
                  >
                    {resolvedPrimary.icon && (
                      <AppIcon
                        icon={resolvedPrimary.icon}
                        size="xs"
                        className={resolvedPrimary.loading ? "animate-spin" : ""}
                      />
                    )}
                    <span>{resolvedPrimary.label}</span>
                  </Button>
                )}

                {resolvedSecondary && (
                  <Button
                    variant={resolvedSecondary.variant || "outline"}
                    onClick={resolvedSecondary.onClick}
                    className="h-10 px-4 text-xs font-semibold border-[var(--border)] hover:bg-[var(--surface-soft)] text-[var(--foreground)] rounded-md inline-flex items-center gap-2"
                  >
                    {resolvedSecondary.icon && (
                      <AppIcon icon={resolvedSecondary.icon} size="xs" />
                    )}
                    <span>{resolvedSecondary.label}</span>
                  </Button>
                )}
              </ButtonGroup>

              {/* Tertiary Links */}
              {tertiaryActions?.map((act, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  onClick={act.onClick}
                  className="h-9 px-3 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] gap-1.5"
                >
                  <span>{act.label}</span>
                  <AppIcon icon={ArrowRight01Icon} size="xs" />
                </Button>
              ))}
            </div>
          </EmptyContent>

          {children}
        </div>

        {/* ── Right / Bottom Column: State Illustration & Continuity Line (6 cols) ── */}
        <div className="lg:col-span-6 flex items-center justify-center lg:justify-end relative">
          <ContinuityLine kind={kind} className="absolute -left-12 top-1/2 -translate-y-1/2 z-0" />
          <EmptyMedia className="relative z-10 w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[420px] aspect-square flex items-center justify-center bg-transparent">
            {customIllustration || (
              <SystemStateIllustration
                kind={kind}
                size="100%"
                className="w-full h-full max-w-[380px] max-h-[380px]"
              />
            )}
          </EmptyMedia>
        </div>
      </div>
    </Empty>
  );

  if (isEmbedded) {
    return <div className={`w-full ${className}`}>{content}</div>;
  }

  return (
    <SystemStateSurface kind={kind} className={className}>
      {content}
    </SystemStateSurface>
  );
}
