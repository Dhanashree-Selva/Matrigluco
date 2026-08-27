import { ReportViewModel } from "../../types/reports.types";
import { SourceViewer } from "./SourceViewer";
import { ExtractionLedger } from "./ExtractionLedger";
import { ProvenanceDock } from "./ProvenanceDock";
import { ProcessingDisclosure } from "./ProcessingDisclosure";

interface EvidenceSplitProps {
  report: ReportViewModel;
}

export function EvidenceSplit({ report }: EvidenceSplitProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Source Document Viewer (55% width on desktop) */}
      <div className="lg:col-span-7 space-y-4">
        <SourceViewer report={report} />
      </div>

      {/* Right Column: Structured Extraction Review & Provenance (45% width on desktop) */}
      <div className="lg:col-span-5 space-y-4">
        <ExtractionLedger report={report} />
        <ProvenanceDock report={report} />
        <ProcessingDisclosure />
      </div>
    </div>
  );
}
