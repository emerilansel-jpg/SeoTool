import { Check, ShieldCheck, TrendingUp, Briefcase } from "lucide-react";

export interface WorkloadCase {
  title: string;
  subtitle: string;
  badge: string;
  allowance: string;
  icon: typeof TrendingUp;
  items: { task: string; calc: string; cost: string }[];
  totalUsed: string;
  buffer: string;
  highlight?: boolean;
}

export const WORKLOAD_CASES: WorkloadCase[] = [
  {
    title: "Solo Founder / Freelancer",
    subtitle: "Managing 1 to 2 websites",
    badge: "5,000 Credits / mo",
    allowance: "5,000 Credits",
    icon: TrendingUp,
    items: [
      {
        task: "Daily rank tracking for 50 keywords",
        calc: "50 kw x 30 days x 1 cr",
        cost: "1,500 cr",
      },
      {
        task: "Weekly site audits (150 pages)",
        calc: "150 pgs x 4 wks x 2 cr",
        cost: "1,200 cr",
      },
      {
        task: "ChatGPT & Perplexity scans (2x/wk)",
        calc: "16 scans x 5 cr",
        cost: "80 cr",
      },
      {
        task: "Backlink checks on 30 competitors",
        calc: "30 domains x 5 cr",
        cost: "150 cr",
      },
      {
        task: "Deep AI topic & SERP teardowns",
        calc: "10 reports x 20 cr",
        cost: "200 cr",
      },
    ],
    totalUsed: "3,130 credits",
    buffer: "1,870 credits roll over (37% buffer)",
  },
  {
    title: "Growth Marketer / Portfolio",
    subtitle: "Active SEO on 3 to 5 projects",
    badge: "10,000 Credits / mo",
    allowance: "10,000 Credits",
    icon: ShieldCheck,
    highlight: true,
    items: [
      {
        task: "Daily rank tracking for 150 keywords",
        calc: "150 kw x 30 days x 1 cr",
        cost: "4,500 cr",
      },
      {
        task: "Weekly audits for 300 pages",
        calc: "300 pgs x 4 wks x 2 cr",
        cost: "2,400 cr",
      },
      {
        task: "Multi-engine AI visibility tracking",
        calc: "40 checks x 5 cr",
        cost: "200 cr",
      },
      {
        task: "Backlink audits & domain gap analysis",
        calc: "60 domains x 5 cr",
        cost: "300 cr",
      },
      {
        task: "Deep AI competitive intelligence",
        calc: "20 reports x 20 cr",
        cost: "400 cr",
      },
    ],
    totalUsed: "7,800 credits",
    buffer: "2,200 credits roll over to next month",
  },
  {
    title: "High-Volume Agency",
    subtitle: "Dozens of client domains",
    badge: "BYOK Unlimited",
    allowance: "Unlimited Operations",
    icon: Briefcase,
    items: [
      {
        task: "Rank tracking for 1,000+ keywords",
        calc: "Direct DataForSEO API",
        cost: "$0 fee",
      },
      {
        task: "Full-scale crawl (10,000+ pages/mo)",
        calc: "Direct crawler billing",
        cost: "$0 fee",
      },
      {
        task: "Continuous AI model evaluation",
        calc: "Own OpenRouter token",
        cost: "$0 fee",
      },
      {
        task: "Automated white-label client reports",
        calc: "Scheduled weekly delivery",
        cost: "Included",
      },
      {
        task: "Custom MCP server agents & pipelines",
        calc: "Unlimited tool calls",
        cost: "Included",
      },
    ],
    totalUsed: "0 platform credits",
    buffer: "Billed directly at wholesale API rates",
  },
];

export function CreditWorkloadSimulator({
  hideHeader = false,
}: {
  hideHeader?: boolean;
}) {
  return (
    <div className="space-y-6">
      {!hideHeader ? (
        <div className="text-center max-w-2xl mx-auto">
          <h4 className="text-lg font-bold text-base-content sm:text-xl">
            Real-World Monthly Usage Scenarios
          </h4>
          <p className="mt-1.5 text-xs sm:text-sm text-base-content/70 leading-relaxed">
            See exactly how a month of real search marketing activities fits
            into credit allowances. No surprises, no hidden caps.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {WORKLOAD_CASES.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <div
              key={scenario.title}
              className={`flex flex-col justify-between rounded-2xl border p-5 sm:p-6 shadow-xs transition-all ${
                scenario.highlight
                  ? "border-primary/50 bg-primary/[0.02] ring-1 ring-primary/30"
                  : "border-base-300 bg-base-100"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-base-200/80 pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        scenario.highlight
                          ? "bg-primary text-primary-content shadow-xs"
                          : "bg-base-200 text-base-content/80"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-base-content text-sm leading-snug truncate">
                        {scenario.title}
                      </h5>
                      <p className="text-xs text-base-content/60 truncate">
                        {scenario.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tier Badge */}
                <div className="mt-3.5 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                      scenario.highlight
                        ? "bg-primary/10 text-primary"
                        : "bg-base-200 text-base-content/80"
                    }`}
                  >
                    {scenario.badge}
                  </span>
                  {scenario.highlight ? (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      Recommended
                    </span>
                  ) : null}
                </div>

                {/* Items breakdown with clean typography and no truncation */}
                <div className="mt-4 space-y-2">
                  {scenario.items.map((item) => (
                    <div
                      key={item.task}
                      className="flex items-start justify-between gap-3 border-b border-base-200/40 py-2 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-base-content leading-snug">
                          {item.task}
                        </p>
                        <p className="mt-0.5 text-[10px] text-base-content/50 font-mono">
                          {item.calc}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-base-200/80 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                        {item.cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Buffer Footer */}
              <div className="mt-5 rounded-xl border border-base-200 bg-base-200/40 p-3.5 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-base-content/70">
                    Estimated Total:
                  </span>
                  <span className="font-mono text-sm font-extrabold text-base-content">
                    {scenario.totalUsed}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5 shrink-0 mt-0.5" />
                  <span className="leading-tight">{scenario.buffer}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
