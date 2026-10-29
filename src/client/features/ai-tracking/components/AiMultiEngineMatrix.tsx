import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Bot,
  Link2,
  Minus,
} from "lucide-react";
import type { LlmCitationMetric } from "@/types/schemas/ai-tracking";

interface Props {
  llmMetrics: LlmCitationMetric[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

const PLATFORM_CONFIG: Record<
  string,
  { name: string; tag: string; badgeClass: string }
> = {
  chat_gpt: {
    name: "ChatGPT",
    tag: "OpenAI GPT-5",
    badgeClass: "badge-success badge-soft",
  },
  perplexity: {
    name: "Perplexity",
    tag: "Sonar Reasoning",
    badgeClass: "badge-info badge-soft",
  },
  gemini: {
    name: "Gemini",
    tag: "Google 2.5 Pro",
    badgeClass: "badge-primary badge-soft",
  },
  claude: {
    name: "Claude",
    tag: "Sonnet 4.5",
    badgeClass: "badge-warning badge-soft",
  },
};

export function AiMultiEngineMatrix({
  llmMetrics,
  selectedPlatform,
  onSelectPlatform,
}: Props) {
  if (llmMetrics.length === 0) return null;

  return (
    <div className="rounded-2xl border border-base-300/80 bg-base-100 p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-base-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-base-content">
              Frontier Engine Matrix
            </h3>
            <span className="badge badge-neutral badge-sm font-semibold">
              4 Engine Comparison
            </span>
          </div>
          <p className="text-xs text-base-content/60">
            Side-by-side visibility, citation rates, and top recommendation
            picks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {llmMetrics.map((m) => {
          const cfg = PLATFORM_CONFIG[m.platform] || {
            name: m.platform,
            tag: "AI Model",
            badgeClass: "badge-ghost",
          };
          const isSelected = selectedPlatform === m.platform;

          let statusLabel = "Emerging";
          let statusBadge = "badge-neutral badge-soft";
          if (m.mentionRatePercent >= 60) {
            statusLabel = "Dominant";
            statusBadge = "badge-success badge-soft";
          } else if (
            m.mentionRatePercent >= 30 &&
            m.citationRatePercent === 0
          ) {
            statusLabel = "Citation Gap";
            statusBadge = "badge-warning badge-soft";
          } else if (m.mentionRatePercent === 0) {
            statusLabel = "Blind Spot";
            statusBadge = "badge-error badge-soft";
          } else if (m.mentionRatePercent >= 30) {
            statusLabel = "Active Presence";
            statusBadge = "badge-info badge-soft";
          }

          return (
            <div
              key={m.platform}
              onClick={() => onSelectPlatform(isSelected ? "all" : m.platform)}
              className={`rounded-xl border p-4 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20"
                  : "border-base-300/80 bg-base-100 hover:border-primary/40 hover:bg-base-200/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-base-200 font-bold text-xs text-base-content">
                      <Bot className="size-3.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-base-content">
                        {cfg.name}
                      </h4>
                      <p className="text-[10px] text-base-content/50">
                        {cfg.tag}
                      </p>
                    </div>
                  </div>
                  <span className={`badge badge-xs font-bold ${statusBadge}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-base-200">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase text-base-content/50">
                      Mention Rate
                    </p>
                    <p className="text-base font-bold text-base-content">
                      {m.mentionRatePercent}%
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase text-base-content/50 flex items-center gap-1">
                      <Link2 className="size-2.5" /> Citations
                    </p>
                    <p className="text-base font-bold text-base-content">
                      {m.citationRatePercent}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-base-200 text-base-content/70">
                <div
                  className="flex items-center gap-1 text-[11px]"
                  title="Primary recommendation position #1 frequency"
                >
                  <Award className="size-3 text-warning" />
                  <span>Pick #1:</span>
                  <span className="font-bold text-base-content">
                    {m.primaryPickPercent ?? 0}%
                  </span>
                </div>

                <div className="flex items-center gap-0.5 font-medium text-[11px]">
                  {m.trendDeltaPercent > 0 ? (
                    <span className="text-success inline-flex items-center">
                      <ArrowUpRight className="size-3" /> +{m.trendDeltaPercent}
                      %
                    </span>
                  ) : m.trendDeltaPercent < 0 ? (
                    <span className="text-error inline-flex items-center">
                      <ArrowDownRight className="size-3" />{" "}
                      {m.trendDeltaPercent}%
                    </span>
                  ) : (
                    <span className="text-base-content/40 inline-flex items-center">
                      <Minus className="size-3" /> 0%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
