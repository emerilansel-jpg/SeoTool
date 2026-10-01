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
    subtitle: "Managing 1 to 2 growing websites",
    badge: "Tier 1: 5,000 Credits/mo",
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
        calc: "150 pgs x 4 weeks x 2 cr",
        cost: "1,200 cr",
      },
      {
        task: "ChatGPT & Perplexity brand scans (2x/wk)",
        calc: "16 scans x 5 cr",
        cost: "80 cr",
      },
      {
        task: "Backlink analysis on 30 competitors",
        calc: "30 domains x 5 cr",
        cost: "150 cr",
      },
      {
        task: "Deep AI topic & SERP teardowns",
        calc: "10 deep reports x 20 cr",
        cost: "200 cr",
      },
    ],
    totalUsed: "3,130 credits",
    buffer: "1,870 credits left (37% safety buffer rolls over)",
  },
  {
    title: "Growth Marketer / Portfolio",
    subtitle: "Active SEO campaigns across 3 to 5 projects",
    badge: "All Access: 10,000 Credits/mo",
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
        calc: "300 pgs x 4 weeks x 2 cr",
        cost: "2,400 cr",
      },
      {
        task: "Multi-engine AI visibility tracking",
        calc: "40 checks x 5 cr",
        cost: "200 cr",
      },
      {
        task: "Backlink audits & domain gap prospecting",
        calc: "60 domains x 5 cr",
        cost: "300 cr",
      },
      {
        task: "Deep AI competitive intelligence",
        calc: "20 deep reports x 20 cr",
        cost: "400 cr",
      },
    ],
    totalUsed: "7,800 credits",
    buffer: "2,200 credits left (rolls over every month)",
  },
  {
    title: "High-Volume Agency",
    subtitle: "Dozens of client domains and automated workflows",
    badge: "Tier 4 / 5: BYOK Mode",
    allowance: "Unlimited Operations",
    icon: Briefcase,
    items: [
      {
        task: "Rank tracking for 1,000+ keywords",
        calc: "Direct DataForSEO API call",
        cost: "$0 platform fee",
      },
      {
        task: "Full-scale crawl (10,000+ pages/mo)",
        calc: "Direct crawler billing",
        cost: "$0 platform fee",
      },
      {
        task: "Continuous AI model evaluation",
        calc: "Own OpenRouter API token",
        cost: "$0 platform fee",
      },
      {
        task: "Automated white-label client reports",
        calc: "Scheduled weekly delivery",
        cost: "Included",
      },
      {
        task: "Custom MCP server agents & pipelines",
        calc: "Unlimited agent tool calls",
        cost: "Included",
      },
    ],
    totalUsed: "Zero platform credit limits",
    buffer: "Raw third-party data billed at direct wholesale rates",
  },
];

export function CreditWorkloadSimulator() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h4 className="text-lg font-bold text-base-content sm:text-xl">
          Real-World Monthly Usage Scenarios
        </h4>
        <p className="mt-1.5 text-xs sm:text-sm text-base-content/70 leading-relaxed">
          See exactly how a month of real search marketing activities fits into
          credit allowances. No surprises, no hidden caps.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {WORKLOAD_CASES.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <div
              key={scenario.title}
              className={`flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all ${
                scenario.highlight
                  ? "border-primary/50 bg-primary/[0.02] ring-1 ring-primary/30"
                  : "border-base-300 bg-base-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-base-200 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex size-9 items-center justify-center rounded-xl ${
                        scenario.highlight
                          ? "bg-primary text-primary-content"
                          : "bg-base-200 text-base-content/80"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-base-content text-sm">
                        {scenario.title}
                      </h5>
                      <p className="text-[11px] text-base-content/60">
                        {scenario.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 inline-block rounded-full bg-base-200/80 px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary">
                  {scenario.badge}
                </div>

                {/* Items breakdown */}
                <div className="mt-4 space-y-2.5">
                  {scenario.items.map((item) => (
                    <div
                      key={item.task}
                      className="flex items-start justify-between gap-3 text-xs border-b border-base-200/50 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-base-content/90 truncate">
                          {item.task}
                        </p>
                        <p className="text-[10px] text-base-content/50 font-mono">
                          {item.calc}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-primary shrink-0 text-xs">
                        {item.cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Buffer Footer */}
              <div className="mt-6 border-t border-base-200 pt-4 space-y-1 bg-base-200/30 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-base-content">
                    Total Estimated Use:
                  </span>
                  <span className="font-mono font-extrabold text-base-content text-sm">
                    {scenario.totalUsed}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="size-3.5 shrink-0" />
                  <span>{scenario.buffer}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
