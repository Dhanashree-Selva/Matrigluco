import { useState } from "react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { LANDING_CONTENT } from "../content/landing-content";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <div className="space-y-4 text-center mb-12">
        <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
          Frequently Asked Questions
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          Clear answers about our technology and clinical boundaries.
        </h2>
      </div>

      <div className="space-y-3">
        {LANDING_CONTENT.faq.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.question}
              className="rounded-md bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
              >
                <span>{item.question}</span>
                <div
                  className={`w-6 h-6 rounded-md bg-[var(--surface-soft)] flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                    }`}
                >
                  <AppIcon icon={ArrowDown01Icon} size="xs" />
                </div>
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${idx}`}
                  className="px-5 pb-5 text-xs text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border-subtle)] pt-3 animate-in fade-in duration-200"
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
