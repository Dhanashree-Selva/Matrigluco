import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CitationSource } from "../types/assistant.types";

interface ChatMarkdownProps {
  content: string;
  citations?: CitationSource[];
  onCitationClick?: (citationIndex: number) => void;
}

/**
 * Custom Markdown renderer tailored for MatriGluco clinical assistant.
 * Powered by react-markdown + remark-gfm with custom brand typography,
 * interactive citation pills, and clinical callout styling.
 */
export function ChatMarkdown({
  content,
  citations = [],
  onCitationClick,
}: ChatMarkdownProps) {
  // Custom text processor to render citation badges [1], [2], etc. inside text nodes
  const components = useMemo(() => {
    return {
      h1: ({ children, ...props }: any) => (
        <h3
          className="text-base sm:text-lg font-bold text-[var(--foreground)] mt-4 mb-2 first:mt-0 tracking-tight"
          {...props}
        >
          {children}
        </h3>
      ),
      h2: ({ children, ...props }: any) => (
        <h4
          className="text-sm sm:text-base font-bold text-[var(--foreground)] mt-3.5 mb-1.5 first:mt-0 tracking-tight"
          {...props}
        >
          {children}
        </h4>
      ),
      h3: ({ children, ...props }: any) => (
        <h5
          className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--primary)] mt-3 mb-1 first:mt-0"
          {...props}
        >
          {children}
        </h5>
      ),
      h4: ({ children, ...props }: any) => (
        <h6
          className="text-xs sm:text-sm font-semibold text-[var(--foreground)] mt-2.5 mb-1 first:mt-0"
          {...props}
        >
          {children}
        </h6>
      ),
      p: ({ children, ...props }: any) => (
        <p
          className="text-sm sm:text-[14.5px] leading-relaxed text-[var(--foreground)] my-2 first:mt-0 last:mb-0"
          {...props}
        >
          {children}
        </p>
      ),
      ul: ({ children, ...props }: any) => (
        <ul
          className="my-2.5 pl-5 space-y-1.5 list-disc marker:text-[var(--primary)] text-sm sm:text-[14.5px] leading-relaxed"
          {...props}
        >
          {children}
        </ul>
      ),
      ol: ({ children, ...props }: any) => (
        <ol
          className="my-2.5 pl-5 space-y-2 list-decimal marker:font-bold marker:text-[var(--primary)] text-sm sm:text-[14.5px] leading-relaxed"
          {...props}
        >
          {children}
        </ol>
      ),
      li: ({ children, ...props }: any) => (
        <li className="pl-0.5 text-[var(--foreground)] leading-relaxed" {...props}>
          {children}
        </li>
      ),
      strong: ({ children, ...props }: any) => (
        <strong
          className="font-bold text-[var(--foreground)] tracking-tight"
          {...props}
        >
          {children}
        </strong>
      ),
      em: ({ children, ...props }: any) => (
        <em className="italic text-[var(--foreground)]/90" {...props}>
          {children}
        </em>
      ),
      blockquote: ({ children, ...props }: any) => (
        <blockquote
          className="my-3 pl-3.5 py-1.5 border-l-3 border-[var(--primary)] bg-[var(--accent-soft)]/50 rounded-r-lg text-xs sm:text-[13px] text-[var(--muted-foreground)] italic leading-relaxed"
          {...props}
        >
          {children}
        </blockquote>
      ),
      hr: ({ ...props }: any) => (
        <hr className="my-4 border-[var(--border)]" {...props} />
      ),
      table: ({ children, ...props }: any) => (
        <div className="my-3 overflow-x-auto rounded-xl border border-[var(--border)] shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm border-collapse" {...props}>
            {children}
          </table>
        </div>
      ),
      thead: ({ children, ...props }: any) => (
        <thead className="bg-[var(--accent-soft)] text-[var(--foreground)] border-b border-[var(--border)] font-semibold" {...props}>
          {children}
        </thead>
      ),
      th: ({ children, ...props }: any) => (
        <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider" {...props}>
          {children}
        </th>
      ),
      td: ({ children, ...props }: any) => (
        <td className="px-3 py-2 border-b border-[var(--border)]/60 text-xs sm:text-[13px]" {...props}>
          {children}
        </td>
      ),
      code: ({ inline, className, children, ...props }: any) => {
        if (inline) {
          return (
            <code
              className="px-1.5 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] font-mono text-xs font-semibold"
              {...props}
            >
              {children}
            </code>
          );
        }
        return (
          <pre className="my-3 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        );
      },
      a: ({ href, children, ...props }: any) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)] hover:underline font-medium"
          {...props}
        >
          {children}
        </a>
      ),
      // Intercept text nodes to render interactive [1], [2] citation pills
      text: ({ children }: { children: string }) => {
        if (typeof children !== "string") return children;
        return renderTextWithCitations(children, citations, onCitationClick);
      },
    };
  }, [citations, onCitationClick]);

  if (!content) return null;

  return (
    <div className="space-y-1 text-sm sm:text-[15px] leading-relaxed text-[var(--foreground)] break-words font-sans antialiased">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Inlines interactive citation pills for [1], [2], [3] tokens in text nodes
 */
function renderTextWithCitations(
  text: string,
  citations: CitationSource[],
  onCitationClick?: (citationIndex: number) => void
): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\[(\d+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const num = parseInt(match[1], 10);
    const citation = citations.find((c) => c.sourceIndex === num);
    const label = citation ? `Source ${num}: ${citation.title}` : `Source ${num}`;

    parts.push(
      <button
        key={`cit-${match.index}`}
        type="button"
        onClick={() => onCitationClick?.(num)}
        className="inline-flex items-center justify-center font-mono font-bold text-[10px] text-[var(--primary)] bg-[var(--accent-soft)] hover:bg-[var(--primary)] hover:text-white px-1.5 py-0.5 rounded-md transition-colors mx-0.5 align-baseline cursor-pointer border border-[var(--primary)]/20 shadow-2xs"
        aria-label={label}
        title={label}
      >
        {num}
      </button>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
