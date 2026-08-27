import { useParams } from "react-router-dom";
import { TooltipProvider } from "../../../shared/ui";
import { useAssessmentResult } from "../hooks/useAssessmentResult";
import { ResultHeader } from "../components/result/ResultHeader";
import { ResultStudio } from "../components/result/ResultStudio";
import { ResultSkeleton } from "../components/result/ResultSkeleton";
import { ResultUnavailable } from "../components/result/ResultUnavailable";

export default function RiskResultPage() {
  const { id } = useParams<{ id: string }>();
  const { assessment, isLoading, isError, refetch, historyItems } = useAssessmentResult(id);

  if (isLoading) {
    return <ResultSkeleton />;
  }

  if (isError || !assessment) {
    return <ResultUnavailable onRetry={refetch} />;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 1. Compact Result Header & Breadcrumbs */}
        <ResultHeader assessment={assessment} />

        {/* 2. Balanced 2-Column Clinical Workspace */}
        <ResultStudio assessment={assessment} historyItems={historyItems} />
      </div>
    </TooltipProvider>
  );
}
