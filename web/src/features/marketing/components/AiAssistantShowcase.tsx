import { AiBrain01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

export function AiAssistantShowcase() {
  return (
    <section id="assistant" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Chat Visual Representation */}
        <div className="lg:col-span-6 order-2 lg:order-1 space-y-4">
          <div className="p-6 sm:p-8 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[var(--primary)] text-white flex items-center justify-center">
                  <AppIcon icon={AiBrain01Icon} size="xs" />
                </div>
                <p className="text-xs font-bold text-[var(--foreground)]">Local Maternal Health Assistant</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] font-semibold">
                llama.cpp local
              </span>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-md bg-[var(--surface-soft)] text-[var(--foreground)] max-w-[85%] ml-auto">
                <p className="font-semibold">What is the recommended fasting glucose level for gestational diabetes?</p>
              </div>

              <div className="p-4 rounded-md bg-[var(--accent-soft)]/40 border border-[var(--primary)]/15 text-[var(--foreground)] space-y-2 max-w-[90%]">
                <p className="font-semibold text-[var(--primary)] text-[11px] uppercase tracking-wider">
                  Clinical Education Guidance
                </p>
                <p className="leading-relaxed">
                  According to standard maternal guidelines, the target for fasting blood glucose during pregnancy is typically <strong>below 95 mg/dL</strong>.
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] border-t border-[var(--primary)]/15 pt-2">
                  Reference: ACOG Practice Bulletin No. 190 · Non-diagnostic educational context.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Narrative */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
            <AppIcon icon={AiBrain01Icon} size="xs" />
            <span>Local AI Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
            Ask for context without sending private questions to the cloud.
          </h2>

          <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            When enabled, Matrigluco executes a quantized local LLM through llama.cpp on your dedicated backend server, grounded with curated maternal health literature.
          </p>

          <div className="p-4 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] space-y-1.5 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)]" />
              <span>Medical Safety Boundaries</span>
            </div>
            <p className="leading-relaxed">
              The assistant provides clinical education, dietary ideas, and parameter explanations. It does not provide medical diagnoses, prescribe medication, or replace emergency care.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
