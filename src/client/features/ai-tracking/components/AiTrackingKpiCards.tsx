import { Bot, ThumbsUp, X } from "lucide-react";
import type {
  AiTrackingKpi,
  AiTrackingPlatform,
} from "@/types/schemas/ai-tracking";

interface Props {
  kpi: AiTrackingKpi;
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  availablePlatforms: AiTrackingPlatform[];
}

const PLATFORM_LABELS: Record<string, string> = {
  chat_gpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  claude: "Claude",
};

export function AiTrackingKpiCards({
  kpi,
  selectedPlatform,
  onSelectPlatform,
  availablePlatforms,
}: Props) {
  const isAllSelected = selectedPlatform === "all";

  return (
    <div className="flex flex-col gap-4 sm:gap-6 rounded-2xl border border-base-300/80 bg-base-100 p-4 sm:p-6 shadow-2xs">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Model Filter Column */}
        <div className="flex flex-col justify-between">
          <div className="mb-2 flex items-center gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              AI Models
            </p>
            <span className="flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
              {isAllSelected
                ? "All Selected"
                : PLATFORM_LABELS[selectedPlatform] || selectedPlatform}
            </span>
            {!isAllSelected && (
              <button
                type="button"
                className="btn btn-circle btn-ghost btn-xs text-error"
                title="Clear model filter"
                onClick={() => onSelectPlatform("all")}
              >
                <X className="size-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
            <button
              type="button"
              className={`btn btn-sm sm:btn-xs min-h-[32px] sm:min-h-[28px] rounded-xl font-semibold shadow-2xs px-3 sm:px-2.5 ${isAllSelected ? "btn-primary shadow-xs" : "btn-outline border-base-300"}`}
              onClick={() => onSelectPlatform("all")}
            >
              All
            </button>
            {availablePlatforms.map((platform) => {
              const active = selectedPlatform === platform;
              return (
                <button
                  key={platform}
                  type="button"
                  className={`btn btn-sm sm:btn-xs min-h-[32px] sm:min-h-[28px] gap-1.5 rounded-xl font-semibold shadow-2xs px-3 sm:px-2.5 ${active ? "btn-primary shadow-xs" : "btn-outline border-base-300"}`}
                  onClick={() => onSelectPlatform(active ? "all" : platform)}
                >
                  <Bot className="size-3.5 sm:size-3" />
                  {PLATFORM_LABELS[platform] ?? platform}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mention Coverage Column */}
        <div className="flex flex-col justify-between border-t border-base-200/80 pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-6">
          <div className="mb-1 sm:mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium tracking-tight text-base-content/70">
              Mention Coverage
            </p>
            <span className="text-xs text-base-content/50">
              tracked responses
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
              {kpi.mentionCoveragePercent}%
            </div>
            <p className="mt-1 text-xs text-base-content/60 leading-relaxed">
              <span className="font-semibold text-base-content">
                {kpi.brandMentions} of {kpi.totalResponses}
              </span>{" "}
              tracked responses mention your brand.
            </p>
          </div>
        </div>

        {/* Positive Mentions Column */}
        <div className="flex flex-col justify-between border-t border-base-200/80 pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-6">
          <div className="mb-1 sm:mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium tracking-tight text-base-content/70">
              Positive Mentions
            </p>
            <ThumbsUp className="size-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
              {kpi.positiveMentionPercent}%
            </div>
            <p className="mt-1 text-xs text-base-content/60 leading-relaxed">
              <span className="font-semibold text-base-content">
                {kpi.positiveMentions} of {kpi.brandMentions}
              </span>{" "}
              tracked mentions classified positive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
