import React from "react";
import { Empty, EmptyTitle, EmptyDescription, Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { AiBrain01Icon } from "@hugeicons/core-free-icons";
import { AiAvailabilityStatus } from "../types/assistant.types";
import { Link } from "react-router-dom";
import { routePaths } from "../../../app/route-paths";

interface AssistantUnavailableProps {
  status: AiAvailabilityStatus;
}

export function AssistantUnavailable({ status }: AssistantUnavailableProps) {
  const isPreparing = status === "loading";
  const isDisabled = status === "disabled";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] border border-[var(--border)] flex items-center justify-center mb-4 text-[var(--muted-foreground)]">
        <AppIcon icon={AiBrain01Icon} size="lg" className="text-[var(--primary)]" />
      </div>

      <EmptyTitle className="text-lg font-bold text-[var(--foreground)]">
        {isPreparing
          ? "Preparing Local Assistant…"
          : isDisabled
          ? "Local AI Assistant Is Disabled"
          : "Assistant Temporarily Unavailable"}
      </EmptyTitle>

      <EmptyDescription className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
        {isPreparing
          ? "The local offline model runtime is loading into memory. You can continue using your tracking, assessments, and reports in the meantime."
          : isDisabled
          ? "The offline AI model runtime is turned off in this environment configuration. All your maternal health tracking, clinical reports, and risk assessments remain fully accessible."
          : "The local AI runtime is currently unreachable. Please ensure the backend server has loaded the model artifact."}
      </EmptyDescription>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link to={routePaths.app.dashboard}>
          <Button variant="outline" size="sm">
            Go to Dashboard
          </Button>
        </Link>
        <Link to={routePaths.app.assessment}>
          <Button size="sm">
            View Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}
