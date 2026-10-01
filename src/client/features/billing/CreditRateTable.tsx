import { Zap, Key, Search, FileText, Link2, Sparkles, Brain } from "lucide-react";

export interface RateCardItem {
  icon: typeof Search;
  action: string;
  cost: number;
  unit: string;
  description: string;
  badge?: string;
}

export const CREDIT_RATE_ITEMS: RateCardItem[] = [
  {
    icon: Search,
    action: "Track 1 Keyword",
    cost: 1,
    unit: "credit / day",
    description: "Daily automated search rank tracking on Google desktop and mobile.",
    badge: "Light",
  },
  {
    icon: FileText,
    action: "Audit 1 Web Page",
    cost: 2,
    unit: "credits / page",
    description: "Technical crawler check, Core Web Vitals, metadata, and on-page errors.",
    badge: "Light",
  },
  {
    icon: Link2,
    action: "Check 1 Backlink Profile",
    cost: 5,
    unit: "credits / domain",
    description: "Domain authority scores, referring domains, anchor text, and link equity.",
    badge: "Standard",
  },
  {
    icon: Sparkles,
    action: "AI Brand Visibility (1 Engine)",
    cost: 5,
    unit: "credits / query",
    description: "Scan brand mentions and citations on ChatGPT or Perplexity AI.",
    badge: "Standard",
  },
  {
    icon: Brain,
    action: "Deep Multi-AI Research",
    cost: 20,
    unit: "credits / analysis",
    description: "Multi-AI consensus (ChatGPT + Claude + Perplexity) combined with live SERP data.",
    badge: "Deep",
  },
];

export function CreditRateTable() {
  return (
    <div className="space-y-6">
      {/* Rate rule header banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-base-content">
              Transparent Credit System
            </h4>
            <p className="text-xs text-base-content/70">
              Credits work like mobile prepaid balance. Balance only deducts when
              you run actions, and unused credits roll over every month.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-primary/30 bg-base-100 px-3 py-1.5 font-mono text-xs font-bold text-primary shadow-xs">
          1,000 Credits = $1.00 USD
        </div>
      </div>

      {/* Rate Table */}
      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table table-md w-full">
          <thead className="bg-base-200/60 text-xs uppercase tracking-wider text-base-content/70">
            <tr>
              <th className="py-3.5 pl-4 sm:pl-6">Action / Feature</th>
              <th className="py-3.5 text-center">Cost</th>
              <th className="py-3.5 pr-4 sm:pr-6">What You Get</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-sm">
            {CREDIT_RATE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <tr
                  key={item.action}
                  className="hover:bg-base-200/30 transition-colors"
                >
                  <td className="py-4 pl-4 sm:pl-6 font-medium text-base-content">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-base-200 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base-content">
                            {item.action}
                          </span>
                          {item.badge ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.badge === "Deep"
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                  : item.badge === "Standard"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="font-mono text-base font-extrabold text-primary">
                      {item.cost}
                    </div>
                    <div className="text-[11px] text-base-content/50">
                      {item.unit}
                    </div>
                  </td>
                  <td className="py-4 pr-4 sm:pr-6 text-xs leading-relaxed text-base-content/70">
                    {item.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* BYOK Callout */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Key className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-bold text-base-content">
                  Heavy Agency or Enterprise? Use BYOK Mode
                </h5>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                  UNLIMITED DATA
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-base-content/70">
                Connect your personal DataForSEO and OpenRouter API keys. Raw data
                is billed directly to your own provider accounts at $0 platform
                markup, so high-volume agencies can scale to millions of queries
                without credit limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
