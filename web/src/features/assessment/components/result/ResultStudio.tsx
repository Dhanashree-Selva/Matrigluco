import { useState, useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../../shared/ui";
import { AssessmentDetail, AssessmentHistoryItem } from "../../types/assessment.types";
import { ResultHorizon } from "./ResultHorizon";
import { EvidenceLens } from "./EvidenceLens";
import { HistoricalTrajectory } from "./HistoricalTrajectory";
import { CarePath } from "./CarePath";

interface ResultStudioProps {
  assessment: AssessmentDetail;
  historyItems?: AssessmentHistoryItem[];
}

export function ResultStudio({ assessment, historyItems = [] }: ResultStudioProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (!isDesktop) {
    return (
      <div className="space-y-6">
        <ResultHorizon assessment={assessment} />
        <EvidenceLens assessment={assessment} />
        <HistoricalTrajectory
          assessment={assessment}
          historyItems={historyItems}
        />
        <CarePath assessment={assessment} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full rounded-md gap-6 items-start"
      >
        {/* Left Column: Result Horizon + Historical Trajectory + Care Path */}
        <ResizablePanel defaultSize={54} minSize={40} maxSize={65} className="space-y-6">
          <ResultHorizon assessment={assessment} />
          <HistoricalTrajectory
            assessment={assessment}
            historyItems={historyItems}
          />
          <CarePath assessment={assessment} />
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="bg-transparent hover:bg-[var(--border)] transition-colors self-stretch"
        />

        {/* Right Column: Model Transparency & Evidence Lens */}
        <ResizablePanel defaultSize={46} minSize={35} maxSize={60} className="space-y-6">
          <EvidenceLens assessment={assessment} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
