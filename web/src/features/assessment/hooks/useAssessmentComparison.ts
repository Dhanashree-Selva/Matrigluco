import { useState, useMemo } from "react";
import { AssessmentDetail, AssessmentHistoryItem, AssessmentComparisonResult } from "../types/assessment.types";

export function useAssessmentComparison(
  currentAssessment?: AssessmentDetail,
  historyItems: AssessmentHistoryItem[] = []
) {
  // Filter out current assessment from past history
  const previousHistory = useMemo(() => {
    if (!currentAssessment) return [];
    return historyItems.filter((item) => item.id !== currentAssessment.id);
  }, [currentAssessment, historyItems]);

  // Selected previous assessment ID (defaults to the first previous assessment)
  const [selectedPreviousId, setSelectedPreviousId] = useState<string | null>(null);

  const selectedPrevious = useMemo(() => {
    if (previousHistory.length === 0) return null;
    if (selectedPreviousId) {
      const found = previousHistory.find((item) => item.id === selectedPreviousId);
      if (found) return found;
    }
    return previousHistory[0] || null;
  }, [previousHistory, selectedPreviousId]);

  const comparison: AssessmentComparisonResult = useMemo(() => {
    if (!currentAssessment) {
      return {
        currentAssessment: {} as AssessmentDetail,
        previousAssessment: null,
        probabilityDelta: null,
        isSameModelVersion: true,
        hasPrevious: false,
      };
    }

    if (!selectedPrevious) {
      return {
        currentAssessment,
        previousAssessment: null,
        probabilityDelta: null,
        isSameModelVersion: true,
        hasPrevious: false,
      };
    }

    const currProb = Number(currentAssessment.probability ?? currentAssessment.probabilityScore ?? 0);
    const prevProb = Number(selectedPrevious.probability ?? selectedPrevious.probabilityScore ?? 0);

    // Delta in percentage points: e.g. (0.62 - 0.71) * 100 = -9.0 percentage points
    const delta = Number(((currProb - prevProb) * 100).toFixed(1));

    const currVersion = currentAssessment.model?.version || "1.0.0";
    const prevVersion = selectedPrevious.modelVersion || "1.0.0";
    const isSameVersion = currVersion === prevVersion;

    return {
      currentAssessment,
      previousAssessment: selectedPrevious,
      probabilityDelta: delta,
      isSameModelVersion: isSameVersion,
      hasPrevious: true,
    };
  }, [currentAssessment, selectedPrevious]);

  return {
    comparison,
    previousHistory,
    selectedPreviousId: selectedPrevious?.id || null,
    setSelectedPreviousId,
  };
}
