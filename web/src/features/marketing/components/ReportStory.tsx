import { DocumentCodeIcon, SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

export function ReportStory() {
  return (
    <section id="reports" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Narrative & Disclosure */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
            <AppIcon icon={DocumentCodeIcon} size="xs" />
            <span>Private OCR Processing</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
            Medical reports become structured, searchable context.
          </h2>

          <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Upload lab reports securely. Our backend processing pipeline extracts key laboratory values and attaches them directly to your health timeline for obstetric review.
          </p>

          <div className="p-4 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] space-y-2 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)]" />
              <span>Private File & External OCR Disclosure</span>
            </div>
            <p className="leading-relaxed">
              Report files are stored as private application resources behind authenticated endpoints. When OCR processing is initiated, document images are processed according to configured pipeline protocols.
            </p>
          </div>
        </div>

        {/* Right: Pipeline Visual Representation */}
        <div className="lg:col-span-6">
          <div className="p-6 sm:p-8 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <p className="text-xs font-bold text-[var(--foreground)]">Document Extraction Pipeline</p>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[var(--color-success-soft)] text-[var(--color-success)] font-bold">
                Completed
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">OGTT 75g Fasting Plasma</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">Extracted from Lab_Report_W24.pdf</p>
                </div>
                <span className="font-bold text-[var(--foreground)]">88 mg/dL</span>
              </div>

              <div className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">OGTT 2-Hour Postload</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">Extracted from Lab_Report_W24.pdf</p>
                </div>
                <span className="font-bold text-[var(--foreground)]">132 mg/dL</span>
              </div>

              <div className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">HbA1c Glycated Hemoglobin</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">Longitudinal Marker</p>
                </div>
                <span className="font-bold text-[var(--foreground)]">5.2 %</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
