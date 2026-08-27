import { Badge } from "../../../../shared/ui";
import {
  DocumentCodeIcon,
  Shield01Icon,
  Tick01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ReportViewModel } from "../../types/reports.types";

interface LabSheetViewerProps {
  report: ReportViewModel;
  zoomLevel: number;
}

export function LabSheetViewer({ report, zoomLevel }: LabSheetViewerProps) {
  const isReviewed = report.reviewStatus === "reviewed";

  const getNormalRange = (key: string) => {
    switch (key.toLowerCase()) {
      case "fasting_glucose":
      case "glucose_fasting":
        return { range: "70 – 99", unit: "mg/dL" };
      case "postprandial_glucose":
      case "glucose_pp":
        return { range: "< 140", unit: "mg/dL" };
      case "glucose":
        return { range: "70 – 140", unit: "mg/dL" };
      case "hba1c":
        return { range: "4.0 – 5.6", unit: "%" };
      case "bp_systolic":
        return { range: "90 – 120", unit: "mmHg" };
      case "bp_diastolic":
        return { range: "60 – 80", unit: "mmHg" };
      case "blood_pressure":
        return { range: "< 120/80", unit: "mmHg" };
      case "bmi":
        return { range: "18.5 – 24.9", unit: "kg/m²" };
      case "insulin":
        return { range: "2.6 – 24.9", unit: "µU/mL" };
      case "platelets":
        return { range: "150 – 450", unit: "10³/µL" };
      default:
        return { range: "Standard", unit: "" };
    }
  };

  return (
    <div className="w-full flex items-center justify-center overflow-auto p-3">
      <div
        className="transition-transform duration-200 ease-out origin-top w-full max-w-[540px] bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 p-6 space-y-5 select-none font-sans"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Lab Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-pink-600 font-black text-sm tracking-wider uppercase">
              <AppIcon icon={DocumentCodeIcon} size="xs" />
              <span>MATRIGLUCO CLINICAL LABORATORY</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Accredited Clinical Pathology & Diagnostic Services • ISO 15189
            </p>
          </div>

          <div className="text-right space-y-0.5">
            <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-300">
              REPORT REF: {report.id.slice(0, 8).toUpperCase()}
            </span>
            <p className="text-[10px] text-slate-500 font-mono">
              {report.formattedDate}
            </p>
          </div>
        </div>

        {/* Patient / Specimen Meta */}
        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400">
              Document Name
            </span>
            <p className="font-bold text-slate-800 truncate">
              {report.originalFilename}
            </p>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400">
              Ingestion Date & Time
            </span>
            <p className="font-mono text-slate-800">
              {report.formattedDate} · {report.formattedTime}
            </p>
          </div>
        </div>

        {/* Results Table */}
        <div className="space-y-1.5">
          <div className="text-xs font-black uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200 flex items-center justify-between">
            <span>Biochemical Parameter</span>
            <span className="font-mono text-[10px] text-slate-400">
              Observed Value / Ref Interval
            </span>
          </div>

          {report.extractedValues.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {report.extractedValues.map((bio) => {
                const norm = getNormalRange(bio.key);
                return (
                  <div
                    key={bio.key}
                    className="py-2 flex items-center justify-between hover:bg-slate-50/80 px-1 rounded transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-800">
                        {bio.label}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400">
                        Ref: {norm.range} {norm.unit || bio.unit}
                      </span>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="font-mono font-black text-sm text-pink-600">
                        {bio.value} {bio.unit}
                      </span>
                      <span className="block text-[9px] font-bold text-emerald-600">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              No biochemical values parsed from this document yet.
            </div>
          )}
        </div>

        {/* Stamp & Verification Watermark */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1 text-emerald-700 font-bold">
            <AppIcon icon={Shield01Icon} size="xxs" />
            <span>AUTHENTICATED CLINICAL RECORD</span>
          </div>

          <div className="text-right">
            <span>STATUS: {isReviewed ? "REVIEW COMPLETED" : "PENDING VERIFICATION"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
