// oxlint-disable max-lines
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Cpu,
  Gauge,
  Key,
  KeyRound,
  Link2,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features - All-in-One SEO Workspace | SeoTool.im" },
      {
        name: "description",
        content:
          "Explore SeoTool.im's full SEO suite: Keyword Research & KGR, Local Map Geo-Grid, Rank Tracking, Technical Site Audit, Backlinks, AI Brand Visibility, and BYOK wholesale data.",
      },
      {
        property: "og:title",
        content: "Features - All-in-One SEO Workspace | SeoTool.im",
      },
      {
        property: "og:description",
        content:
          "Explore SeoTool.im's full SEO suite: Keyword Research & KGR, Local Map Geo-Grid, Rank Tracking, Technical Site Audit, Backlinks, AI Brand Visibility, and BYOK wholesale data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://seotool.im/features" },
    ],
  }),
  component: FeaturesPage,
});

const CORE_FEATURES = [
  {
    icon: KeyRound,
    badge: "Keyword Intelligence",
    title: "Keyword Research & KGR",
    description:
      "Find low-competition opportunities and high-intent commercial terms with instant volume, CPC, and intent metrics.",
    bullets: [
      "Keyword Golden Ratio (KGR) automated scoring",
      "Page-one SERP weakness and low-authority detection",
      "Multi-country localization (US, UK, ID, CA, AU, etc.)",
      "Search intent tags (Informational, Commercial, Transactional)",
    ],
    highlight: "Find keywords you can rank for this week",
  },
  {
    icon: MapPin,
    badge: "Local SEO Heatmaps",
    title: "Local Map Rank (Geo-Grid)",
    description:
      "Track Google Business Profile (GBP) visibility street-by-street with interactive geo-grid ranking pins.",
    bullets: [
      "Custom grid density: 3x3 (9 pins) up to 15x15 (225 pins)",
      "Flexible scan radius: 0.5 mi up to 30 mi (or 500m to 50km)",
      "Pinpoint centroid support for Service Area Businesses (SAB)",
      "Share of Local Voice (SOLV%) and average rank tracking",
    ],
    highlight: "Street-level local Google Maps rankings",
  },
  {
    icon: TrendingUp,
    badge: "Daily SERP Monitoring",
    title: "Rank Tracker",
    description:
      "Monitor daily Google organic rankings across desktop and mobile devices without artificial project caps.",
    bullets: [
      "Daily automated desktop & mobile position tracking",
      "SERP feature detection (Featured Snippets, Local Pack, AI Overviews)",
      "Historical rank trend lines and volatility alerts",
      "Location-specific search engine results (city & zip level)",
    ],
    highlight: "Real-time rank movements & SERP features",
  },
  {
    icon: Gauge,
    badge: "Technical SEO",
    title: "Site Audit & Crawler",
    description:
      "Deep technical crawler and Lighthouse performance auditor to diagnose and fix on-page issues before they hurt rankings.",
    bullets: [
      "Lighthouse Core Web Vitals profiling (LCP, FID, CLS)",
      "Broken link, redirect chain, and 404 detection",
      "Crawl budget analyzer & XML sitemap validator",
      "Categorized prioritized issues with actionable fixes",
    ],
    highlight: "Zero-latency technical health diagnostics",
  },
  {
    icon: Link2,
    badge: "Link Intelligence",
    title: "Backlinks & Link Intersect",
    description:
      "Analyze your link equity, audit toxic backlinks, and uncover high-impact link opportunities from competitors.",
    bullets: [
      "Referring domains and backlink growth timeline",
      "Anchor text distribution and link toxicity flags",
      "Competitive Link Intersect across up to 5 competitors",
      "Dofollow vs Nofollow breakdown and spam score filters",
    ],
    highlight: "Steal your competitors' best backlinks",
  },
  {
    icon: Bot,
    badge: "Next-Gen AI SEO",
    title: "AI Brand Visibility & Search",
    description:
      "Track how artificial intelligence answer engines cite, summarize, and recommend your brand to potential buyers.",
    bullets: [
      "Live tracking across ChatGPT, Claude, Gemini, and Perplexity",
      "Brand sentiment scoring and query prominence",
      "AI source citation & website reference detection",
      "AI search query explorer for dark question discovery",
    ],
    highlight: "Monitor your visibility in AI answers",
  },
  {
    icon: BarChart3,
    badge: "First-Party Data",
    title: "Google Search Console & GA4",
    description:
      "Direct OAuth integration with Google Search Console and GA4 to analyze verified clicks, impressions, and user behaviour.",
    bullets: [
      "Dark query detection: uncover terms bringing unmapped clicks",
      "CTR and position trends mapped to organic traffic",
      "URL inspection integration for instant indexing status",
      "No sampling: 100% first-party verified performance data",
    ],
    highlight: "Uncover hidden revenue queries from GSC",
  },
  {
    icon: Cpu,
    badge: "Autonomous Agents",
    title: "Jet AI Assistant & MCP Protocol",
    description:
      "Bring SEO intelligence directly into your daily workspace and coding environments via Model Context Protocol.",
    bullets: [
      "Jet AI in-app conversational assistant for page teardowns",
      "Native MCP Server support for Claude Desktop and Cursor IDE",
      "Automated prompt workflows for content briefs and audits",
      "Custom LLM endpoint support (OpenAI, PesatRouter, Claude)",
    ],
    highlight: "Control your SEO from Claude & Cursor",
  },
  {
    icon: Key,
    badge: "Wholesale Rates",
    title: "BYOK (Bring Your Own Keys)",
    description:
      "Connect your DataForSEO and AI provider credentials once in Settings to run unlimited queries at pure wholesale cost.",
    bullets: [
      "0% platform markup on wholesale DataForSEO API queries",
      "Single centralized setup in Settings > BYOK Integrations",
      "No query throttling or artificial plan caps",
      "Works seamlessly across Keywords, Backlinks, Audits, and SERPs",
    ],
    highlight: "Run agency-scale queries at direct provider cost",
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Find Low-Hanging Fruit",
    description:
      "Run Keyword Research with KGR or connect Google Search Console to spot high-volume keywords with weak first-page competition.",
  },
  {
    step: "02",
    title: "Fix Technical Friction",
    description:
      "Crawl your site with the built-in Site Auditor to eliminate broken links, redirect chains, and Core Web Vitals bottlenecks.",
  },
  {
    step: "03",
    title: "Dominate Local & Maps",
    description:
      "Launch a Geo-Grid scan to track your Google Business Profile rankings block-by-block and increase your Share of Local Voice.",
  },
  {
    step: "04",
    title: "Track Daily & Benchmark AI",
    description:
      "Automate daily desktop/mobile rank checks while monitoring how ChatGPT, Perplexity, and Gemini cite your domain.",
  },
] as const;

function FeaturesPage() {
  const { signedIn } = useMarketingSession();

  return (
    <MarketingChrome signedIn={signedIn}>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-base-300/80 bg-base-200/40 py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              Full-Stack SEO Workspace
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-base-content sm:text-5xl lg:text-6xl lg:leading-[1.12]">
              All the tools you need to rank #1, in one workspace
            </h1>
            <p className="mt-5 text-base leading-relaxed text-base-content/70 sm:text-lg">
              From local map grids and keyword golden ratio to technical site audits
              and multi-AI brand visibility — discover how SeoTool.im replaces
              dozens of expensive, fragmented subscriptions.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {signedIn ? (
                <Link
                  to="/projects"
                  className="btn btn-primary gap-2 rounded-xl px-6 font-bold shadow-md shadow-primary/20"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  to="/sign-up"
                  search={{ redirect: "/subscribe" }}
                  className="btn btn-primary gap-2 rounded-xl px-6 font-bold shadow-md shadow-primary/20"
                >
                  <span>Start for free</span>
                  <ArrowRight className="size-4" />
                </Link>
              )}
              <Link
                to="/pricing"
                className="btn btn-outline border-base-300 rounded-xl px-6 font-semibold hover:bg-base-200"
              >
                View Pricing & Lifetime Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Comprehensive Toolkit
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl">
              Nine Essential SEO Capabilities
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-base-content/70 sm:text-base">
              Every feature is built for speed, accuracy, and enterprise scalability with zero artificial limits.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group flex flex-col justify-between rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
                        <Icon className="size-5" />
                      </div>
                      <span className="rounded-full bg-base-200 px-2.5 py-0.5 text-[11px] font-semibold text-base-content/70">
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-base-content">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-base-content/70">
                      {feature.description}
                    </p>

                    <div className="mt-4 space-y-2 border-t border-base-200 pt-4">
                      {feature.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-2 text-xs text-base-content/80">
                          <CheckCircle2 className="size-3.5 shrink-0 text-success mt-0.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-base-200/80 pt-3">
                    <span className="text-[11px] font-semibold text-primary">
                      {feature.highlight} &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section className="border-y border-base-300/80 bg-base-200/30 py-16 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Actionable Growth
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl">
              From Discovery to Page #1
            </h2>
            <p className="mt-3 text-sm text-base-content/70">
              How search marketers and agencies use SeoTool.im to systematically climb Google rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm"
              >
                <span className="font-mono text-3xl font-black text-primary/30">
                  {step.step}
                </span>
                <h3 className="mt-3 text-base font-bold text-base-content">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-base-content/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Callout */}
      <section className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-base-100 to-base-200/60 p-8 shadow-sm md:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Zap className="size-3" />
                  Cost & Transparency
                </span>
                <h3 className="mt-4 text-2xl font-black tracking-tight text-base-content sm:text-3xl">
                  Stop paying $400+/month for fragmented SEO toolkits
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-base-content/70">
                  Most teams subscribe to separate tools for keyword research, backlink checking,
                  local map grids, and technical crawls. SeoTool.im brings all of them into a
                  single dashboard with lifetime options and permanent credit rollover.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-base-content/80">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-success" />
                    <span>No expiring monthly credits</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-success" />
                    <span>BYOK wholesale option</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-success" />
                    <span>Lifetime Deal available</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-base-200 pb-3">
                  <span className="text-xs font-bold text-base-content/60">Traditional Legacy Stack</span>
                  <span className="font-mono text-xs font-bold text-error">$399 - $899 / mo</span>
                </div>
                <div className="space-y-2 text-xs text-base-content/70">
                  <div className="flex justify-between">
                    <span>Ahrefs / Semrush (Keywords & Links)</span>
                    <span className="font-mono">$129+/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Falcon / BrightLocal (Map Grid)</span>
                    <span className="font-mono">$79+/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Site Crawler & Auditing Tools</span>
                    <span className="font-mono">$99+/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Search Visibility Trackers</span>
                    <span className="font-mono">$99+/mo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-primary/20 pt-3 text-primary">
                  <span className="text-sm font-bold">SeoTool.im All-in-One</span>
                  <span className="font-mono text-sm font-black">From $1/mo or One-Time LTD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="border-t border-base-300 bg-base-200/40">
        <div className="mx-auto w-full max-w-6xl border-x border-base-300 px-4 py-16 md:px-6 md:py-20">
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white md:p-14">
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Ready to outrank your competitors?
              </h2>
              <p className="mt-3 text-sm text-white/80 sm:text-base">
                Start with a free account today. Upgrade with lifetime access or flexible rollover credits when you are ready.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {signedIn ? (
                  <Link
                    to="/projects"
                    className="btn btn-md gap-2 rounded-xl border-0 bg-white px-6 font-bold text-slate-900 transition-transform hover:scale-[1.03]"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/sign-up"
                    search={{ redirect: "/subscribe" }}
                    className="btn btn-md gap-2 rounded-xl border-0 bg-white px-6 font-bold text-slate-900 transition-transform hover:scale-[1.03]"
                  >
                    Start for free
                  </Link>
                )}
                <Link
                  to="/pricing"
                  className="btn btn-md rounded-xl border border-white/40 bg-transparent px-6 font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
