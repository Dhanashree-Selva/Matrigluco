import React from "react";
import { AppIcon } from "../../../components/common/AppIcon";
import { SparklesIcon, DocumentCodeIcon, Activity02Icon, HelpCircleIcon } from "@hugeicons/core-free-icons";
import { QuestionPromptItem } from "../types/assistant.types";

const STARTER_PROMPTS: QuestionPromptItem[] = [
  {
    id: "prompt-assessment",
    category: "ASSESSMENT",
    categoryLabel: "Risk Assessment",
    question: "How do I understand my gestational diabetes risk estimate?",
    description: "Learn how maternal factors, glucose, and metabolic markers are evaluated.",
  },
  {
    id: "prompt-reports",
    category: "REPORTS",
    categoryLabel: "Report Terminology",
    question: "What is the difference between Fasting Blood Sugar and HbA1c?",
    description: "Understand standard clinical lab biomarkers and their biological reference ranges.",
  },
  {
    id: "prompt-tracking",
    category: "TRACKING",
    categoryLabel: "Health Logs",
    question: "What daily lifestyle and dietary factors influence glucose levels?",
    description: "Explore curated nutritional and physical activity guidance for pregnancy.",
  },
  {
    id: "prompt-prepare",
    category: "PREPARE",
    categoryLabel: "Doctor Discussion",
    question: "What questions should I prepare for my next prenatal checkup?",
    description: "Get structured suggestions on discussing your readings with your care team.",
  },
];

interface QuestionDeckProps {
  onSelectPrompt: (question: string) => void;
}

export function QuestionDeck({ onSelectPrompt }: QuestionDeckProps) {
  const getIcon = (category: QuestionPromptItem["category"]) => {
    switch (category) {
      case "ASSESSMENT":
        return <AppIcon icon={SparklesIcon} size="xs" className="text-[var(--primary)]" />;
      case "REPORTS":
        return <AppIcon icon={DocumentCodeIcon} size="xs" className="text-[var(--primary)]" />;
      case "TRACKING":
        return <AppIcon icon={Activity02Icon} size="xs" className="text-[var(--primary)]" />;
      case "PREPARE":
        return <AppIcon icon={HelpCircleIcon} size="xs" className="text-[var(--primary)]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto w-full pt-2">
      {STARTER_PROMPTS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectPrompt(item.question)}
          className="text-left p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent-soft)] hover:border-[var(--primary)]/40 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[var(--accent-soft)] flex items-center justify-center">
                {getIcon(item.category)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                {item.categoryLabel}
              </span>
            </div>
            <h3 className="text-xs sm:text-[13px] font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-snug">
              {item.question}
            </h3>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 mt-2 leading-relaxed">
            {item.description}
          </p>
        </button>
      ))}
    </div>
  );
}
