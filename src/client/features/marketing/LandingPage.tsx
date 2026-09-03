/* eslint-disable max-lines */
import { Link } from "@tanstack/react-router";
import * as React from "react";
import {
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileBarChart,
  FileSearch,
  Gauge,
  Globe,
  Link2,
  ListChecks,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { Reveal } from "@/client/features/marketing/useReveal";

/* ---------------------------------- shared --------------------------------- */

function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`pointer-events-none absolute text-primary ${className ?? ""}`}
    >
      <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12C7.5 10.2 11.1 6.6 12 0z" />
    </svg>
  );
}

function MonoLabel({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      className={`pointer-events-none absolute hidden font-mono text-[10px] uppercase tracking-widest text-base-content/30 lg:block ${className ?? ""}`}
    >
      [ {children} ]
    </span>
  );
}

function SectionLabel({ index, total, label }: { index: string; total: string; label: string }) {
  return (
    <div className="border-y border-base-300 bg-base-100">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex items-center gap-3 border-l-2 border-primary py-4 pl-4">
          <span className="font-mono text-xs uppercase tracking-widest text-base-content/40">
            [
            <span className="text-primary font-bold">
              {" "}
              {index}{" "}
            </span>
            / {total} ]{" "}
            <span className="mx-2 text-base-content/20">·</span> {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function WindowDots() {
  return (
    <span className="flex items-center gap-1.5" aria-hidden="true">
      <span className="size-2.5 rounded-full border border-base-300 bg-base-100" />
      <span className="size-2.5 rounded-full border border-base-300 bg-base-100" />
      <span className="size-2.5 rounded-full border border-base-300 bg-base-100" />
    </span>
  );
}

/* ------------------------------- announcement ------------------------------ */

function AnnouncementBar() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 md:px-6">
      <Link
        to="/pricing"
        className="block rounded-xl bg-primary px-5 py-3 text-center text-sm font-medium text-white shadow-[inset_0_-6px_12px_rgba(0,0,0,0.12)] transition-transform hover:scale-[0.995]"
      >
        Founder cohort: first 10 members lock $29/month forever.{" "}
        <span className="font-semibold underline underline-offset-2">
          See pricing
        </span>{" "}
        <ArrowRight className="inline size-3.5" />
      </Link>
    </div>
  );
}

/* ----------------------------------- hero ---------------------------------- */

const DEMO_TABS = [
  { label: "Keywords", icon: Search },
  { label: "Ranks", icon: TrendingUp },
  { label: "Audit", icon: FileSearch },
  { label: "Backlinks", icon: Link2 },
] as const;

function DemoWidget() {
  const [active, setActive] = React.useState(0);

  return (
    <div className="fc-shadow mx-auto mt-12 w-full max-w-xl rounded-2xl border border-base-300 bg-base-100 p-3 text-left">
      <div className="flex items-center gap-2.5 px-2 py-2.5">
        <Globe className="size-4 shrink-0 text-base-content/40" />
        <span className="flex-1 truncate text-base text-base-content/40">
          yourdomain.com
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 rounded-xl bg-base-200/80 p-1.5">
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {DEMO_TABS.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active === i
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/50 hover:text-base-content"
              }`}
            >
              <tab.icon
                className={`size-3.5 ${active === i ? "text-primary" : ""}`}
              />
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105 active:scale-95"
          aria-label="Run analysis"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-base-300">
      <div className="grid-cells relative mx-auto w-full max-w-6xl border-x border-base-300">
        {/* decorative faded pixel clusters */}
        <div className="pixel-decor absolute top-16 left-10 hidden size-24 opacity-70 lg:block" />
        <div className="pixel-decor absolute top-44 left-24 hidden size-16 opacity-50 lg:block" />
        <div className="pixel-decor absolute right-16 bottom-56 hidden size-20 opacity-60 lg:block" />
        <div className="pixel-decor absolute right-32 bottom-72 hidden size-12 opacity-40 lg:block" />

        <Sparkle className="top-[224px] left-[248px] hidden size-5 lg:block" />
        <Sparkle className="top-[224px] right-[248px] hidden size-5 lg:block" />
        <Sparkle className="bottom-[300px] left-[112px] hidden size-4 opacity-70 lg:block" />

        <MonoLabel className="top-6 left-6">200 OK</MonoLabel>
        <MonoLabel className="top-6 right-6">live data</MonoLabel>
        <MonoLabel className="bottom-6 left-6">.json</MonoLabel>
        <MonoLabel className="right-6 bottom-6">.pdf</MonoLabel>

        <div className="relative mx-auto w-full max-w-4xl px-4 pt-16 pb-24 text-center md:px-6 md:pt-24 md:pb-28">
          <div className="hero-rise hero-rise-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 py-1.5 pr-1.5 pl-4 text-xs font-medium text-base-content/70">
              All-in-one SEO platform, powered by live SERP data
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                <ChevronRight className="size-3" />
              </span>
            </span>
          </div>

          <h1 className="hero-rise hero-rise-2 mt-6 text-5xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Turn search data into{" "}
            <span className="text-primary">rankings that compound</span>
          </h1>

          <p className="hero-rise hero-rise-3 mx-auto mt-6 max-w-2xl text-base text-base-content/70 md:text-lg">
            SeoTool.im unifies keyword research, daily rank tracking, site
            audits, backlinks, and AI visibility in one workspace.{" "}
            <strong className="rounded-sm bg-base-200 px-1 font-semibold text-base-content">
              Covered by a 30-day money-back guarantee.
            </strong>
          </p>

          <div className="hero-rise hero-rise-4 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {signedIn ? (
              <Link
                to="/projects"
                className="btn btn-md gap-2 rounded-[10px] border-0 bg-primary px-5 font-semibold text-white shadow-[inset_0_-6px_12px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03]"
              >
                Open Dashboard
              </Link>
            ) : (
              <Link
                to="/sign-up"
                search={{ redirect: "/subscribe" }}
                className="btn btn-md gap-2 rounded-[10px] border-0 bg-primary px-5 font-semibold text-white shadow-[inset_0_-6px_12px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03]"
              >
                Start for free
              </Link>
            )}
            <Link
              to="/pricing"
              className="btn btn-md rounded-[10px] border-0 bg-base-200 px-5 font-semibold text-base-content transition-transform hover:scale-[1.03]"
            >
              See live pricing
            </Link>
          </div>

          <div className="hero-rise hero-rise-4 mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-base-content/40">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              No credit card to start
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              PayPal verified checkout
            </span>
          </div>

          <div className="hero-rise hero-rise-4">
            <DemoWidget />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- browser mockup ------------------------------ */

function BrowserMockup() {
  return (
    <section className="border-b border-base-300 bg-base-200/40">
      <div className="mx-auto w-full max-w-6xl border-x border-base-300 px-4 py-14 md:px-6">
        <Reveal>
          <div className="grid overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm lg:grid-cols-2">
            {/* dashboard skeleton */}
            <div className="border-b border-base-300 lg:border-r lg:border-b-0">
              <div className="flex items-center gap-3 border-b border-base-300 px-4 py-3">
                <WindowDots />
                <div className="ml-2 flex flex-1 items-center gap-2 rounded-md border border-base-300 bg-base-200/50 px-3 py-1 text-xs text-base-content/40">
                  <Globe className="size-3" />
                  app.seotool.im/projects/yourdomain
                </div>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex gap-3">
                  <div className="h-16 flex-1 rounded-lg border border-base-300 bg-base-200/40" />
                  <div className="h-16 flex-1 rounded-lg border border-base-300 bg-base-200/40" />
                  <div className="h-16 flex-1 rounded-lg border border-primary/30 bg-primary/[0.06]" />
                </div>
                <div className="space-y-2 rounded-lg border border-base-300 p-4">
                  <div className="h-2.5 w-3/4 rounded-full bg-base-300/80" />
                  <div className="h-2.5 w-full rounded-full bg-base-300/50" />
                  <div className="h-2.5 w-5/6 rounded-full bg-base-300/50" />
                  <div className="h-2.5 w-2/3 rounded-full bg-base-300/30" />
                </div>
                <div className="flex justify-center pt-1">
                  <span className="soft-pulse inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-1.5 font-mono text-xs text-base-content/60 shadow-sm">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Analyzing 214 pages...
                  </span>
                </div>
              </div>
            </div>

            {/* json output */}
            <div className="relative font-mono text-xs leading-relaxed">
              <MonoLabel className="top-3 right-4">.json</MonoLabel>
              <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
                <WindowDots />
              </div>
              <div className="p-5 text-base-content/70">
                <p>
                  <span className="mr-3 text-base-content/30">1</span>
                  <span className="text-primary">[</span>
                </p>
                <p>
                  <span className="mr-3 text-base-content/30">2</span>
                  {"  {"}
                </p>
                <p>
                  <span className="mr-3 text-base-content/30">3</span>
                  {"    "}
                  <span className="text-base-content/50">"url"</span>:{" "}
                  <span className="text-primary">"https://yourdomain.com"</span>,
                </p>
                <p>
                  <span className="mr-3 text-base-content/30">4</span>
                  {"    "}
                  <span className="text-base-content/50">"health"</span>:{" "}
                  <span className="text-primary">94</span>,
                </p>
                <p>
                  <span className="mr-3 text-base-content/30">5</span>
                  {"    "}
                  <span className="text-base-content/50">"issues"</span>:{" "}
                  <span className="text-primary">"fixed: 38"</span>,
                </p>
                <p>
                  <span className="mr-3 text-base-content/30">6</span>
                  {"    "}
                  <span className="text-base-content/50">"rank"</span>: {"{"}{" "}
                  <span className="text-base-content/50">"kw"</span>:{" "}
                  <span className="text-primary">"+18"</span> {"}"},
                </p>
                <p>
                  <span className="mr-3 text-base-content/30">7</span>
                  {"    "}
                  <span className="text-base-content/50">"report"</span>:{" "}
                  <span className="text-primary">"client-ready.pdf"</span>
                </p>
                <p>
                  <span className="mr-3 text-base-content/30">8</span>
                  {"  {"}
                </p>
                <p>
                  <span className="mr-3 text-base-content/30">9</span>
                  <span className="text-primary">]</span>
                  <span className="caret-blink ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 bg-primary" />
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- logo cells ------------------------------- */

const INTEGRATIONS = [
  "DataForSEO",
  "Google Search Console",
  "GA4",
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Bing",
  "PayPal",
  "MCP",
] as const;

function LogoCells() {
  return (
    <section className="border-b border-base-300 bg-base-200/40">
      <div className="mx-auto w-full max-w-6xl border-x border-base-300">
        <div className="grid items-stretch md:grid-cols-[1fr_2.2fr]">
          <div className="flex items-center border-b border-base-300 p-8 md:border-r md:border-b-0">
            <p className="text-lg font-semibold tracking-tight text-balance">
              Plugs into{" "}
              <span className="text-primary">the tools you already use</span>
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {INTEGRATIONS.map((name) => (
              <div
                key={name}
                className="group relative flex min-h-24 items-center justify-center border-r border-b border-base-300 p-4"
              >
                <span className="text-center text-sm font-semibold text-base-content/45 transition-colors group-hover:text-base-content">
                  {name}
                </span>
                <ChevronRight className="absolute right-2 bottom-2 size-3 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ product cells ------------------------------ */

const PRODUCT_CELLS = [
  {
    icon: Search,
    title: "Search",
    copy: "Live search volumes, difficulty scores, and intent clustering from real-time SERP indexes.",
  },
  {
    icon: TrendingUp,
    title: "Track",
    copy: "Daily rank positions across Google and Bing with volatility detection and competitor moves.",
  },
  {
    icon: FileSearch,
    title: "Audit",
    copy: "Full site crawls across 100+ technical factors, Core Web Vitals, and indexability.",
  },
] as const;

function ProductCells() {
  return (
    <section className="border-b border-base-300 bg-base-200/40">
      <div className="mx-auto w-full max-w-6xl border-x border-base-300 px-4 pt-14 pb-16 md:px-6">
        <div className="grid overflow-hidden rounded-2xl border border-base-300 bg-base-200/60 md:grid-cols-3">
          {PRODUCT_CELLS.map((cell, i) => (
            <div
              key={cell.title}
              className={`flex flex-col items-center p-8 text-center ${
                i === 0
                  ? "bg-base-100 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.12)]"
                  : "border-base-300 not-last:border-b md:not-last:border-r md:not-last:border-b-0"
              }`}
            >
              <cell.icon className="size-6 text-base-content/70" />
              <h3 className="mt-4 text-base font-bold">{cell.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                {cell.copy}
              </p>
              <Link
                to="/pricing"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Learn more <ChevronRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- agent section ----------------------------- */

const AGENT_ACTIONS = [
  { icon: FileSearch, label: "Audit" },
  { icon: TrendingUp, label: "Track" },
  { icon: Search, label: "Research" },
  { icon: ListChecks, label: "Brief" },
  { icon: FileBarChart, label: "Report" },
  { icon: Sparkles, label: "Monitor" },
  { icon: Link2, label: "Backlinks" },
  { icon: Bell, label: "Alerts" },
] as const;

function AgentSection() {
  return (
    <section className="border-b border-base-300">
      <div className="mx-auto w-full max-w-6xl border-x border-base-300 px-4 py-20 md:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-base-content/70">
            <span className="text-base-content/30">«</span>
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="size-3.5" />
            </span>
            Agent Ready
            <span className="text-base-content/30">»</span>
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            Easily connect with your{" "}
            <span className="text-primary">AI agents</span>
          </h2>
          <p className="mt-4 text-base text-base-content/60">
            Connect SeoTool.im to Claude Desktop, your IDE, or any MCP client in
            minutes. 36+ native tools, one workspace.
          </p>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          <Reveal delay={1}>
            <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
              <div className="flex items-center justify-between border-b border-base-300 px-4 py-2.5">
                <WindowDots />
                <div className="flex items-center gap-1 text-xs">
                  <span className="rounded-md bg-base-200 px-2.5 py-1 font-semibold text-base-content">
                    Skill
                  </span>
                  <span className="rounded-md px-2.5 py-1 text-base-content/50">
                    MCP
                  </span>
                </div>
              </div>
              <div className="p-4 font-mono text-xs text-base-content/70">
                <span className="text-base-content/40">$ </span>npx -y{" "}
                <span className="text-primary">seotool-mcp</span> init --all
              </div>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
              <div className="flex items-center justify-between border-b border-base-300 px-4 py-2.5">
                <WindowDots />
                <span className="rounded-md bg-base-200 px-2.5 py-1 text-xs font-semibold text-base-content">
                  cURL
                </span>
              </div>
              <div className="p-4 font-mono text-xs text-base-content/70">
                <span className="text-primary">curl</span> -s
                seotool.im/agent-onboarding
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12" delay={1}>
          <div className="grid overflow-hidden rounded-2xl border border-base-300 sm:grid-cols-4">
            {AGENT_ACTIONS.map((action) => (
              <div
                key={action.label}
                className="flex flex-col items-center gap-3 border-base-300 bg-base-100 p-6 transition-colors hover:bg-base-200/50"
              >
                <span className="flex size-10 items-center justify-center rounded-lg border border-base-300 bg-base-200/50 text-base-content/70">
                  <action.icon className="size-4.5" />
                </span>
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ hard stuff bento --------------------------- */

function HardStuff() {
  return (
    <section id="features" className="border-b border-base-300 bg-base-200/40">
      <div className="mx-auto w-full max-w-6xl border-x border-base-300 px-4 py-20 md:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            We handle the <span className="text-primary">hard stuff</span>
          </h2>
          <p className="mt-4 text-base text-base-content/60">
            Live data plumbing, crawling, scheduling, and formatting. So you
            ship strategy, not spreadsheets.
          </p>
        </Reveal>

        <div className="mt-12 grid overflow-hidden rounded-2xl border border-base-300 bg-base-100 md:grid-cols-2">
          {/* cell 1: reports */}
          <div className="border-b border-base-300 p-8 md:border-r">
            <div className="flex items-center gap-2 text-sm font-medium text-base-content/60">
              <FileBarChart className="size-4" /> White-label PDF
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight">
              <span className="font-bold">Reports on autopilot.</span>{" "}
              <span className="font-normal text-base-content/60">
                Branded, scheduled, client-ready PDFs delivered without you
                touching a spreadsheet.
              </span>
            </h3>
            <div className="mt-6 rounded-xl border border-base-300 p-5">
              <div className="space-y-2">
                <div className="h-2.5 w-2/5 rounded-full bg-base-300/70" />
                <div className="h-2.5 w-4/5 rounded-full bg-base-300/40" />
                <div className="h-2.5 w-3/5 rounded-full bg-base-300/40" />
              </div>
              <div className="mt-4 flex justify-center">
                <span className="soft-pulse inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3.5 py-1.5 font-mono text-xs text-base-content/60 shadow-sm">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Generating report...
                </span>
              </div>
            </div>
          </div>

          {/* cell 2: rank chart */}
          <div className="border-b border-base-300 p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-base-content/60">
              <TrendingUp className="size-4" /> Daily rank tracking
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight">
              <span className="font-bold">Every position, every day.</span>{" "}
              <span className="font-normal text-base-content/60">
                Google and Bing positions with volatility detection across
                devices and locations.
              </span>
            </h3>
            <div className="mt-6 rounded-xl border border-base-300 p-5">
              <svg viewBox="0 0 320 80" className="h-20 w-full" aria-hidden="true">
                <polyline
                  points="0,64 40,58 80,60 120,48 160,42 200,30 240,26 280,18 320,12"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="320" cy="12" r="4" fill="var(--color-primary)" />
              </svg>
              <div className="mt-2 flex justify-between font-mono text-xs text-base-content/40">
                <span>pos #27</span>
                <span className="text-primary">pos #3</span>
              </div>
            </div>
          </div>

          {/* cell 3: keyword intelligence */}
          <div className="border-b border-base-300 p-8 md:border-r">
            <div className="flex items-center gap-2 text-sm font-medium text-base-content/60">
              <Search className="size-4" /> Keyword intelligence
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight">
              <span className="font-bold">Volumes you can trust.</span>{" "}
              <span className="font-normal text-base-content/60">
                Difficulty, intent, and clustering from DataForSEO real-time
                indexes, not stale databases.
              </span>
            </h3>
            <div className="mt-6 space-y-2">
              {[
                { kw: "seo audit tool", vol: "4.4K", kd: 34 },
                { kw: "rank tracker", vol: "2.9K", kd: 41 },
                { kw: "ai visibility", vol: "1.8K", kd: 22 },
              ].map((row) => (
                <div
                  key={row.kw}
                  className="flex items-center gap-3 rounded-lg border border-base-300 px-3.5 py-2.5"
                >
                  <span className="flex-1 truncate font-mono text-xs">
                    {row.kw}
                  </span>
                  <span className="font-mono text-xs text-base-content/50">
                    {row.vol}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                    KD {row.kd}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* cell 4: ai visibility */}
          <div className="p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-base-content/60">
              <Sparkles className="size-4" /> AI visibility
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight">
              <span className="font-bold">Own the answers.</span>{" "}
              <span className="font-normal text-base-content/60">
                Track how ChatGPT, Claude, Gemini, and Perplexity recommend your
                brand, prompt by prompt.
              </span>
            </h3>
            <div className="mt-6 space-y-2.5">
              {[
                { name: "ChatGPT", dot: "platform-dot-chatgpt", score: 74 },
                { name: "Claude", dot: "platform-dot-claude", score: 61 },
                { name: "Gemini", dot: "platform-dot-gemini", score: 58 },
                {
                  name: "Perplexity",
                  dot: "platform-dot-perplexity",
                  score: 49,
                },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className={`size-2 rounded-full ${p.dot}`} />
                  <span className="flex-1 text-sm font-medium">{p.name}</span>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-base-300">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${p.score}%` }}
                    />
                  </div>
                  <span className="w-9 text-right font-mono text-xs text-base-content/50">
                    {p.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- stats band ------------------------------ */

const STATS = [
  { value: "36+", label: "MCP agent tools" },
  { value: "100+", label: "Technical audit factors" },
  { value: "4", label: "AI platforms tracked" },
  { value: "Daily", label: "Rank data refresh" },
] as const;

function StatsBand() {
  return (
    <section className="border-b border-base-300">
      <div className="mx-auto w-full max-w-6xl border-x border-base-300">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="border-base-300 p-8 not-last:border-b md:not-last:border-r md:not-last:border-b-0"
            >
              <div className="font-mono text-4xl font-bold tracking-tight md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-base-content/50">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- pricing teaser ---------------------------- */

const COHORTS = [
  { label: "Founder 10", price: "$29" },
  { label: "Early 20", price: "$39" },
  { label: "Growth 50", price: "$49" },
  { label: "Public", price: "$59" },
] as const;

function PricingTeaser({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="border-b border-base-300 bg-base-200/40">
      <div className="mx-auto w-full max-w-6xl border-x border-base-300 px-4 py-20 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
              Pricing that rewards{" "}
              <span className="text-primary">early believers</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-base-content/60">
              One membership unlocks the whole platform. Early cohorts lock a
              lower monthly rate forever. When a cohort fills, the price rises
              for the next one. Your rate never increases while you stay
              active.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {signedIn ? (
                <Link
                  to="/subscribe"
                  className="btn btn-md gap-2 rounded-[10px] border-0 bg-primary px-5 font-semibold text-white shadow-[inset_0_-6px_12px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03]"
                >
                  Claim your rate
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  to="/sign-up"
                  search={{ redirect: "/subscribe" }}
                  className="btn btn-md gap-2 rounded-[10px] border-0 bg-primary px-5 font-semibold text-white shadow-[inset_0_-6px_12px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.03]"
                >
                  Claim your rate
                  <ArrowRight className="size-4" />
                </Link>
              )}
              <Link
                to="/pricing"
                className="btn btn-md rounded-[10px] border-0 bg-base-200 px-5 font-semibold text-base-content transition-transform hover:scale-[1.03]"
              >
                Compare cohorts
              </Link>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="grid overflow-hidden rounded-2xl border border-base-300 bg-base-100 sm:grid-cols-2">
              {COHORTS.map((c, i) => (
                <div
                  key={c.label}
                  className={`p-6 ${i === 0 ? "bg-primary/[0.04]" : ""} ${
                    i % 2 === 0 ? "border-base-300 sm:border-r" : ""
                  } ${i < 2 ? "border-b border-base-300" : ""}`}
                >
                  <div className="text-xs font-medium text-base-content/50">
                    {c.label}
                  </div>
                  <div className="mt-1 font-mono text-3xl font-bold tracking-tight">
                    {c.price}
                    <span className="text-xs font-normal text-base-content/40">
                      /mo
                    </span>
                  </div>
                  {i === 0 ? (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      <Gauge className="size-3" /> Open now
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------ faq ---------------------------------- */

const FAQ_ITEMS = [
  {
    question: "What is SeoTool.im?",
    answer:
      "An all-in-one SEO platform that combines keyword research, daily rank tracking, technical site audits, backlink intelligence, AI visibility monitoring, and white-label reporting in a single workspace.",
  },
  {
    question: "How does progressive pricing work?",
    answer:
      "Early members lock in a lower monthly rate forever. As each cohort fills, the price rises for the next group. Your rate never increases while your membership stays active.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your billing page and your access continues through the end of the current period. Cancelling means you give up your locked-in cohort rate.",
  },
  {
    question: "Is there a money-back guarantee?",
    answer:
      "Every membership is covered by a 30-day money-back guarantee, handled through PayPal verified checkout.",
  },
  {
    question: "Do you support AI agents?",
    answer:
      "Run the autonomous SAM agent inside the app, or connect your own Claude Desktop and IDE via 36+ native MCP tools.",
  },
] as const;

function FaqSection() {
  return (
    <section className="border-b border-base-300">
      <div className="mx-auto w-full max-w-3xl px-4 py-20 md:px-6">
        <Reveal>
          <h2 className="text-center text-4xl font-extrabold tracking-tight md:text-5xl">
            Frequently asked <span className="text-primary">questions</span>
          </h2>
          <div className="mt-10 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group border-base-300 not-last:border-b"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-bold">
                  {item.question}
                  <ChevronDown className="size-4 shrink-0 text-base-content/40 transition-transform group-open:rotate-45" />
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed text-base-content/60">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------- cta band ------------------------------- */

function CtaBand({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="border-b border-base-300 bg-base-200/40">
      <div className="mx-auto w-full max-w-6xl border-x border-base-300 px-4 py-20 md:px-6">
        <Reveal>
          <div className="grid-cells-light relative overflow-hidden rounded-2xl bg-primary p-8 text-white md:p-16">
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-balance sm:text-5xl">
                Your competitors are still guessing.{" "}
                <span className="text-white/70">Stop guessing with them.</span>
              </h2>
              <p className="mt-4 text-sm text-white/80 sm:text-base">
                Start for free, upgrade when the data convinces you. Every
                membership is covered by the 30-day money-back guarantee.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {signedIn ? (
                  <Link
                    to="/projects"
                    className="btn btn-md gap-2 rounded-[10px] border-0 bg-white px-6 font-bold text-slate-900 transition-transform hover:scale-[1.03]"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/sign-up"
                    search={{ redirect: "/subscribe" }}
                    className="btn btn-md gap-2 rounded-[10px] border-0 bg-white px-6 font-bold text-slate-900 transition-transform hover:scale-[1.03]"
                  >
                    Start for free
                  </Link>
                )}
                <Link
                  to="/pricing"
                  className="btn btn-md rounded-[10px] border border-white/40 bg-transparent px-6 font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------- json-ld -------------------------------- */

function LandingJsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SeoTool.im",
    url: "https://seotool.im",
    logo: "https://seotool.im/transparent-logo.png",
  };
  const app = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SeoTool.im",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "All-in-one SEO platform with keyword research, daily rank tracking, site audits, backlink intelligence, AI visibility monitoring, and white-label reporting.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "29",
      highPrice: "59",
      priceCurrency: "USD",
      offerCount: "4",
    },
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}

/* ----------------------------------- page ---------------------------------- */

export function LandingPage() {
  const { signedIn } = useMarketingSession();

  return (
    <MarketingChrome
      signedIn={signedIn}
      announcement={<AnnouncementBar />}
    >
      <LandingJsonLd />
      <Hero signedIn={signedIn} />
      <BrowserMockup />
      <LogoCells />
      <SectionLabel index="01" total="05" label="Core features" />
      <ProductCells />
      <SectionLabel index="02" total="05" label="Power your agent" />
      <AgentSection />
      <SectionLabel index="03" total="05" label="Features" />
      <HardStuff />
      <SectionLabel index="04" total="05" label="By the numbers" />
      <StatsBand />
      <SectionLabel index="05" total="05" label="Pricing" />
      <PricingTeaser signedIn={signedIn} />
      <FaqSection />
      <CtaBand signedIn={signedIn} />
    </MarketingChrome>
  );
}
