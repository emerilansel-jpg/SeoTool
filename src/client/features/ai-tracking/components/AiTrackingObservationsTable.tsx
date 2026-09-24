import { useState } from "react";
import { Bot, ChevronDown, ChevronUp, ExternalLink, Globe } from "lucide-react";
import type { AiTrackingObservationItem } from "@/types/schemas/ai-tracking";

interface Props {
  observations: AiTrackingObservationItem[];
}

const PLATFORM_LABELS: Record<string, string> = {
  chat_gpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  claude: "Claude",
};

export function AiTrackingObservationsTable({ observations }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-base-300 bg-base-100 p-4 sm:p-6 shadow-sm">
      <div>
        <h3 className="font-semibold text-base text-base-content">
          Recent AI Observations
        </h3>
        <p className="text-xs text-base-content/60">
          Live answers, detected numbered-list positions, and citations.
        </p>
      </div>

      <div className="space-y-3">
        {observations.map((obs) => {
          const isExpanded = expandedId === obs.id;
          return (
            <div
              key={obs.id}
              className="rounded-lg border border-base-200 bg-base-200/20 overflow-hidden transition-all"
            >
              <div
                className="p-3 sm:p-3.5 cursor-pointer hover:bg-base-200/40 select-none space-y-2 sm:space-y-0"
                onClick={() => setExpandedId(isExpanded ? null : obs.id)}
              >
                {/* Desktop layout: 1 line */}
                <div className="hidden sm:flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="badge badge-sm badge-outline gap-1 font-medium shrink-0">
                      <Bot className="size-3" />
                      {PLATFORM_LABELS[obs.platform] || obs.platform}
                    </div>
                    <span className="font-medium text-xs text-base-content truncate max-w-md">
                      {obs.prompt}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {obs.brandMentioned ? (
                      <span className="badge badge-success badge-xs font-semibold">
                        Mentioned{" "}
                        {obs.position != null ? `(#${obs.position})` : ""}
                      </span>
                    ) : (
                      <span className="badge badge-ghost badge-xs text-base-content/40">
                        Not mentioned
                      </span>
                    )}
                    <span className="text-[11px] text-base-content/50">
                      {obs.observedAt ? obs.observedAt.slice(0, 10) : ""}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? "Collapse observation"
                          : "Expand observation"
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-3.5" />
                      ) : (
                        <ChevronDown className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile layout: 2 structured lines */}
                <div className="sm:hidden space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="badge badge-xs badge-outline gap-1 font-medium">
                        <Bot className="size-2.5" />
                        {PLATFORM_LABELS[obs.platform] || obs.platform}
                      </div>
                      {obs.brandMentioned ? (
                        <span className="badge badge-success badge-xs font-semibold text-[10px]">
                          Mentioned{" "}
                          {obs.position != null ? `(#${obs.position})` : ""}
                        </span>
                      ) : (
                        <span className="badge badge-ghost badge-xs text-base-content/40 text-[10px]">
                          Not mentioned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-base-content/50">
                        {obs.observedAt ? obs.observedAt.slice(0, 10) : ""}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="size-3.5 text-base-content/50" />
                      ) : (
                        <ChevronDown className="size-3.5 text-base-content/50" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-base-content leading-snug line-clamp-2">
                    {obs.prompt}
                  </p>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-base-200 bg-base-100 p-4 space-y-4 text-xs">
                  {obs.evidence && (
                    <div className="rounded-lg bg-base-200/50 p-3">
                      <span className="font-semibold text-base-content block mb-1">
                        Brand Extraction Evidence:
                      </span>
                      <p className="text-base-content/80 italic">
                        &quot;{obs.evidence}&quot;
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="badge badge-xs badge-info">
                          {obs.sentiment} sentiment
                        </span>
                        {obs.position != null && (
                          <span className="badge badge-xs badge-primary">
                            List position #{obs.position}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {obs.citations.length > 0 && (
                    <div>
                      <span className="font-semibold text-base-content block mb-2">
                        Citations ({obs.citations.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {obs.citations.map((c) => (
                          <a
                            key={c.url}
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 rounded border border-base-200 p-2 hover:bg-base-200/50 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Globe className="size-3 shrink-0 text-base-content/50" />
                              <span className="truncate text-base-content">
                                {c.title || c.domain}
                              </span>
                            </div>
                            <ExternalLink className="size-3 shrink-0 text-base-content/40" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {obs.responseText && (
                    <div>
                      <span className="font-semibold text-base-content block mb-1">
                        Full AI Response:
                      </span>
                      <div className="rounded bg-base-200/30 p-3 font-mono text-[11px] whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                        {obs.responseText}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {observations.length === 0 && (
          <div className="py-8 text-center text-sm text-base-content/50">
            No observations recorded yet. Run tracking to see AI responses.
          </div>
        )}
      </div>
    </div>
  );
}
