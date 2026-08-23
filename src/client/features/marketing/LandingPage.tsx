/* eslint-disable max-lines */
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  FileBarChart,
  FileSearch,
  Gauge,
  Globe,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { PricingSection } from "@/client/features/marketing/PricingSection";

const FEATURES = [
  {
    icon: Search,
    title: "Keyword Intelligence",
    tag: "Live Data",
    color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    copy: "Accurate search volumes, keyword difficulty, and intent clustering powered by DataForSEO's real-time indexes.",
  },
  {
    icon: TrendingUp,
    title: "SERP Rank Tracking",
    tag: "Daily Updates",
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    copy: "Monitor daily keyword positions across Google and Bing with volatility detection, device segmentation, and competitor moves.",
  },
  {
    icon: FileSearch,
    title: "Technical Site Audits",
    tag: "Deep Crawl",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    copy: "Automated site crawler inspecting 100+ technical SEO factors, Core Web Vitals, indexability, and broken link graphs.",
  },
  {
    icon: Link2,
    title: "Backlink Intelligence",
    tag: "Domain Graph",
    color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    copy: "Track referring domains, anchor distribution, toxic spam scores, and uncover competitor link intersect opportunities.",
  },
  {
    icon: Sparkles,
    title: "AI Visibility & Citations",
    tag: "Next-Gen GEO",
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    copy: "Track how often your brand is recommended across ChatGPT, Claude, Gemini, and Perplexity with prompt explorer trends.",
  },
  {
    icon: Gauge,
    title: "Content Quality & Gaps",
    tag: "On-Page AI",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    copy: "Score content depth, extract semantic entities, and run domain gap analyses to generate instant AI content briefs.",
  },
  {
    icon: FileBarChart,
    title: "White-Label PDF Reports",
    tag: "Automated",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    copy: "Generate client-ready, branded PDF reports on an automated schedule with custom sections and clean data charts.",
  },
  {
    icon: Bot,
    title: "Autonomous SAM Agent & MCP",
    tag: "AI First",
    color: "text-primary bg-primary/10 border-primary/20",
    copy: "Run SEO operations via our autonomous SAM agent or connect your own Claude Desktop / IDE via 36+ native MCP tools.",
  },
] as const;

const STATS = [
  { value: "36+", label: "Native MCP Agent Tools", change: "Fastest in class" },
  { value: "100%", label: "Live SERP Accuracy", change: "Real-time query" },
  {
    value: "1-Click",
    label: "Automated White-Label Reports",
    change: "Scheduled delivery",
  },
  {
    value: "PayPal",
    label: "Secure Global Subscriptions",
    change: "30-Day guarantee",
  },
] as const;

function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-base-300 bg-gradient-to-b from-base-100 via-base-200/40 to-base-200/80 pt-16 pb-20 md:pt-24 md:pb-32">
      {/* Background Radial Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[800px] opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-primary), #00e5ff, transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 text-center md:px-6">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
          </span>
          Next-Generation SEO Command Center
          <ChevronRight className="size-3.5 opacity-60" />
        </div>

        {/* Hero Title */}
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Dominate Organic Search with{" "}
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            Live Data & Autonomous AI
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-base-content/75 md:text-lg leading-relaxed">
          Keyword research, daily rank tracking, site audits, backlinks, AI
          visibility, and white-label client reports — all unified in one modern
          workspace with native Claude MCP support.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          {signedIn ? (
            <Link
              to="/projects"
              className="btn btn-primary btn-md gap-2 px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              Open Dashboard
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Link
              to="/sign-up"
              search={{ redirect: "/subscribe" }}
              className="btn btn-primary btn-md gap-2 px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              Start Free Trial & Subscribe
              <ArrowRight className="size-4" />
            </Link>
          )}
          <Link
            to="/pricing"
            className="btn btn-outline btn-md border-base-300 hover:border-primary hover:bg-primary/5 transition-all"
          >
            Explore Plans & Pricing
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-base-content/60">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            30-day money-back guarantee
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            PayPal verified checkout
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="size-3.5 text-emerald-500" />
            Instant access to 36+ MCP tools
          </span>
        </div>

        {/* Interactive Live Mockup Preview Widget */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-base-300/80 bg-base-100/90 p-2 shadow-2xl shadow-primary/10 backdrop-blur-xl md:p-3">
          <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 text-left md:p-6">
            {/* Top Bar of the Mockup */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  <Globe className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base-content text-sm md:text-base">
                      acme-analytics.io
                    </span>
                    <span className="badge badge-success badge-xs font-semibold">
                      Active Tracker
                    </span>
                  </div>
                  <span className="text-xs text-base-content/50">
                    Google US · Desktop & Mobile
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-outline text-xs">Live Sync</span>
                <span className="text-xs text-base-content/60">
                  Updated 5m ago
                </span>
              </div>
            </div>

            {/* Quick KPI Stats in Mockup */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-base-300 bg-base-100 p-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/50">
                  Health Score
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-500">
                    94<span className="text-xs text-base-content/40">/100</span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-500">
                    ▲ +3%
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-base-300 bg-base-100 p-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/50">
                  Tracked Keywords
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-base-content">
                    482
                  </span>
                  <span className="text-xs font-semibold text-emerald-500">
                    ▲ +18
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-base-300 bg-base-100 p-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/50">
                  Organic Clicks
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-base-content">
                    28.4K
                  </span>
                  <span className="text-xs font-semibold text-emerald-500">
                    ▲ +12%
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-base-300 bg-base-100 p-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/50">
                  AI Citations
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-cyan-500">74%</span>
                  <span className="text-xs font-semibold text-cyan-500">
                    Top 3 AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-28"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Comprehensive SEO Suite
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Everything You Need in One Unified Stack
        </h2>
        <p className="mt-3 text-base text-base-content/70">
          Replace disjointed tools and bloated spreadsheets with an integrated
          platform that shares projects, keywords, and credits seamlessly.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
          >
            <div>
              <div className="flex items-center justify-between">
                <div
                  className={`flex size-10 items-center justify-center rounded-lg border ${feature.color}`}
                >
                  <feature.icon className="size-5" />
                </div>
                <span className="badge badge-sm badge-ghost text-[10px] font-semibold text-base-content/60">
                  {feature.tag}
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-base-content group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                {feature.copy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProofRibbon() {
  return (
    <section className="border-y border-base-300 bg-base-200/50 py-14">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black tracking-tight text-primary md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-semibold text-base-content">
                {stat.label}
              </div>
              <div className="mt-0.5 text-xs text-base-content/50">
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingBlock({ signedIn }: { signedIn: boolean }) {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Transparent Pricing
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Simple, Credit-Backed Subscription Plans
          </h2>
          <p className="mt-3 text-base text-base-content/70">
            Pick the plan tailored for your SEO scale. Every tier includes
            generous monthly live data credits and risk-free money-back
            guarantee.
          </p>
        </div>
        <div className="mt-14">
          <PricingSection signedIn={signedIn} />
        </div>
      </div>
    </section>
  );
}

function CtaBand({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6 md:pb-28">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-cyan-500 p-8 text-white shadow-2xl shadow-primary/20 md:p-14">
        {/* Glow orb */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-cyan-300 opacity-20 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            30-Day Money-Back Guarantee
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Ready to Accelerate Your Organic Rankings?
          </h2>
          <p className="mt-3 text-sm text-white/85 sm:text-base leading-relaxed">
            Subscribe in seconds via PayPal. Unlock the full SEO toolkit,
            autonomous SAM AI agent, and MCP server immediately.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {signedIn ? (
              <Link
                to="/projects"
                className="btn btn-md border-0 bg-white text-slate-900 shadow-lg hover:bg-slate-100 px-6 font-bold"
              >
                Go to Dashboard
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                to="/sign-up"
                search={{ redirect: "/subscribe" }}
                className="btn btn-md border-0 bg-white text-slate-900 shadow-lg hover:bg-slate-100 px-6 font-bold"
              >
                Get Started Now
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { signedIn } = useMarketingSession();

  return (
    <MarketingChrome signedIn={signedIn}>
      <Hero signedIn={signedIn} />
      <ProofRibbon />
      <FeatureGrid />
      <PricingBlock signedIn={signedIn} />
      <CtaBand signedIn={signedIn} />
    </MarketingChrome>
  );
}
