import { Bot, Sparkles, X } from "lucide-react";
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
    <div className="flex flex-col gap-6 rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Model Filter Column */}
        <div className="flex flex-col justify-between">
          <div className="mb-2 flex items-center gap-1.5">
            <p className="text-sm font-medium tracking-tight text-base-content/70">
              AI Models
            </p>
            <span className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-[11px] font-semibold text-warning-content">
              <span className="size-1.5 rounded-full bg-warning animate-pulse" />
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
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              className={`btn btn-xs rounded-lg ${isAllSelected ? "btn-primary" : "btn-outline"}`}
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
                  className={`btn btn-xs rounded-lg gap-1.5 ${active ? "btn-primary" : "btn-outline"}`}
                  onClick={() => onSelectPlatform(active ? "all" : platform)}
                >
                  <Bot className="size-3" />
                  {PLATFORM_LABELS[platform] ?? platform}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visibility Score Column */}
        <div className="flex flex-col justify-between border-base-300 lg:border-l lg:pl-6">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium tracking-tight text-base-content/70">
              Visibility Score
            </p>
            <span className="text-xs text-base-content/50">
              brand appearance %
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold tracking-tight text-base-content">
                {kpi.visibilityScore}%
              </div>
              <span className="badge badge-success badge-sm font-semibold">
                {kpi.brandMentions} mentions
              </span>
            </div>
            <div className="h-8 w-16">
              <svg viewBox="0 0 64 32" className="size-full overflow-visible">
                <defs>
                  <linearGradient
                    id="gradient-emerald"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop
                      offset="100%"
                      stopColor="#10b981"
                      stopOpacity="0.05"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 16 L 16 12 L 32 18 L 48 8 L 64 4 L 64 32 L 0 32 Z"
                  fill="url(#gradient-emerald)"
                />
                <path
                  d="M 0 16 L 16 12 L 32 18 L 48 8 L 64 4"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Reputation Column */}
        <div className="flex flex-col justify-between border-base-300 lg:border-l lg:pl-6">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium tracking-tight text-base-content/70">
              Brand Reputation
            </p>
            <span className="text-xs text-base-content/50">
              sentiment health
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold tracking-tight text-base-content">
                {kpi.brandReputationScore}
              </div>
              <span className="badge badge-primary badge-sm font-semibold inline-flex items-center gap-1">
                <Sparkles className="size-3" />
                Index
              </span>
            </div>
            <div className="h-8 w-16">
              <svg viewBox="0 0 64 32" className="size-full overflow-visible">
                <defs>
                  <linearGradient
                    id="gradient-blue"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop
                      offset="100%"
                      stopColor="#3b82f6"
                      stopOpacity="0.05"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 20 L 16 14 L 32 16 L 48 10 L 64 6 L 64 32 L 0 32 Z"
                  fill="url(#gradient-blue)"
                />
                <path
                  d="M 0 20 L 16 14 L 32 16 L 48 10 L 64 6"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
