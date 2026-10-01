// oxlint-disable max-lines
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Key, Lock, Sparkles, Users, Zap } from "lucide-react";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { getPublicCohortPricing } from "@/serverFunctions/public-cohorts";
import type { EffectiveKeywordProCohort } from "@/server/features/keywords/services/KeywordProConfigService";
import { CreditPricingGuide } from "@/client/features/billing/CreditPricingGuide";

const FAQ_ITEMS = [
  {
    question: "What is a Lifetime Deal (LTD)? How does the +$10 jump work?",
    answer:
      "A Lifetime Deal means you pay once and own the tool forever. No monthly bills ever again. We reward early buyers with lower prices. As each group fills up, the price goes up by $10: Founder ($29) -> Early ($39) -> Growth ($49) -> Public ($59). Grab your spot early to lock the best price!",
  },
  {
    question: "What is BYOK (Bring Your Own Key)?",
    answer:
      "BYOK means you plug in your own API keys for DataForSEO and AI (OpenRouter, OpenAI, or Claude). We charge zero extra markup on your data. You only pay the raw, cheap provider rates (~$0.002 per scan). Crawl as much as you want without limits!",
  },
  {
    question: "What are the AppSumo Lifetime Deals?",
    answer:
      "If you want bigger limits, multiple domains, and more team seats in one go, choose from our 5 official AppSumo tiers from $37 to $399 (all one-time payments). Tier 3 ($149) is our most popular Sweet Spot with white-label client PDF reports.",
  },
  {
    question: "How does the $1/month Credit Retainer work?",
    answer:
      "Want to start tiny without an LTD? Start at just $1/month. 100% of your dollar turns into 1,000 permanent usage credits. They roll over every single month and never expire, even if you cancel your plan.",
  },
  {
    question: "Is there a money-back guarantee?",
    answer:
      "Yes! You are 100% safe. Every purchase has a full 30-day money-back guarantee. If you do not love it, tell us within 30 days and we refund every penny. No questions asked.",
  },
] as const;

const APPSUMO_TIERS = [
  {
    tier: 1,
    key: "appsumo_tier_1",
    name: "Tier 1",
    price: 37,
    target: "Solopreneur / Starter",
    domains: "1 Domain · 1 Seat",
    limits: "150 AI scans/mo · 250 pages audit · 50 keywords",
    bullets: [
      "1 Domain & 1 User Seat",
      "150 AI Visibility scans/mo",
      "250 pages technical site audit",
      "50 daily tracked keywords",
      "ChatGPT AI model support",
      "1,500 bonus data credits",
      "Lifetime updates included",
    ],
    popular: false,
  },
  {
    tier: 2,
    key: "appsumo_tier_2",
    name: "Tier 2",
    price: 79,
    target: "Freelancer / Consultant",
    domains: "5 Domains · 2 Seats",
    limits: "500 AI scans/mo + BYOK 1.5k · 1,000 pages · 200 kw",
    bullets: [
      "5 Domains & 2 User Seats",
      "500 AI scans/mo + BYOK 1.5k/mo",
      "1,000 pages technical site audit",
      "200 daily tracked keywords",
      "ChatGPT + Google Gemini models",
      "5,000 bonus data credits",
      "BYOK API Key integration enabled",
    ],
    popular: false,
  },
  {
    tier: 3,
    key: "appsumo_tier_3",
    name: "Tier 3",
    price: 149,
    target: "Growing Agency / Team",
    domains: "15 Domains · 5 Seats",
    limits: "1,200 scans/mo + BYOK 10k · 5,000 pages · 750 kw",
    bullets: [
      "15 Domains & 5 User Seats",
      "1,200 AI scans/mo + BYOK 10k/mo",
      "5,000 pages technical site audit",
      "750 daily tracked keywords",
      "ChatGPT, Claude, Gemini & Perplexity",
      "10,000 bonus data credits",
      "White-label PDF reports & CSV export",
    ],
    popular: true,
  },
  {
    tier: 4,
    key: "appsumo_tier_4",
    name: "Tier 4",
    price: 249,
    target: "Full Digital Agency",
    domains: "50 Domains · 15 Seats",
    limits: "BYOK Unlimited (3 Workers) · 20k pages · 2.5k kw",
    bullets: [
      "50 Domains & 15 User Seats",
      "BYOK Unlimited scans (3 workers)",
      "20,000 pages technical site audit",
      "2,500 daily tracked keywords",
      "Full White-label Client Reports",
      "25,000 bonus data credits",
      "Full REST API & Webhook automation",
    ],
    popular: false,
  },
  {
    tier: 5,
    key: "appsumo_tier_5",
    name: "Tier 5",
    price: 399,
    target: "Enterprise / Reseller",
    domains: "150 Domains · 50 Seats",
    limits: "BYOK True Unlimited (10 Workers) · 50k pages",
    bullets: [
      "150 Domains & 50 User Seats",
      "BYOK True Unlimited (10 workers)",
      "50,000 pages technical site audit",
      "5,000 daily tracked keywords",
      "Custom CNAME Portal & White-label",
      "50,000 bonus data credits",
      "Priority 24/7 SLA & Roadmap input",
    ],
    popular: false,
  },
];

type LoaderData = {
  cohorts: EffectiveKeywordProCohort[];
};

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & Lifetime Deals - SeoTool.im" },
      {
        name: "description",
        content:
          "SeoTool.im Lifetime Deals (LTD) & Subscriptions. Pay once, keep forever with BYOK, official AppSumo tiers, or start from $1/month.",
      },
      { property: "og:title", content: "Pricing & Lifetime Deals - SeoTool.im" },
      {
        property: "og:description",
        content:
          "Pay once, keep forever with BYOK. Official AppSumo tiers & $1/mo credit retainer.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://seotool.im/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async (): Promise<LoaderData> => {
    const cohorts = await getPublicCohortPricing();
    return { cohorts };
  },
  component: PricingPage,
});

function CohortCard({
  cohort,
  isCurrent,
  signedIn,
}: {
  cohort: EffectiveKeywordProCohort;
  isCurrent: boolean;
  signedIn: boolean;
}) {
  const priceDollars = (cohort.priceUsdCents / 100).toFixed(0);
  const spotsText =
    cohort.remaining == null
      ? "Unlimited spots"
      : cohort.remaining === 0
        ? "Sold out"
        : `${cohort.remaining} spot${cohort.remaining === 1 ? "" : "s"} left`;
  const isSoldOut = cohort.remaining != null && cohort.remaining === 0;

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
        isCurrent
          ? "border-primary shadow-lg ring-2 ring-primary/40 bg-primary/[0.03]"
          : isSoldOut
            ? "border-base-300 bg-base-200/40 opacity-60"
            : "border-base-300 bg-base-100 hover:border-primary/40 shadow-xs"
      }`}
    >
      {isCurrent ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-0.5 text-xs font-bold text-white shadow-sm">
          Active Batch
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-base-content">
            {cohort.label}
          </h3>
          <span className="inline-flex items-center gap-1 text-xs text-base-content/60 font-medium">
            <Users className="size-3" />
            {spotsText}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-base-content">
              ${priceDollars}
            </span>
            <span className="badge badge-primary badge-outline text-[11px] font-bold">
              ONE-TIME PAYMENT
            </span>
          </div>
          <span className="text-xs text-base-content/60 font-medium">
            Pay once, keep forever (Lifetime Access)
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <Key className="size-3.5" />
          <span>BYOK Mode · Zero Data Markup</span>
        </div>

        {cohort.capacity != null ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-base-content/60 mb-1">
              <span>{cohort.occupied} joined</span>
              <span>Max {cohort.capacity}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-base-300">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, (cohort.occupied / cohort.capacity) * 100)}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        <ul className="mt-5 space-y-2 text-xs text-base-content/80">
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>All 12+ SEO & audit features unlocked</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>Connect your own DataForSEO & AI API Keys</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>5,000 bonus credits on activation</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>Lifetime tool updates & engine access</span>
          </li>
        </ul>
      </div>

      <div className="mt-6">
        {isSoldOut ? (
          <button disabled className="btn btn-disabled btn-md w-full">
            Sold Out
          </button>
        ) : signedIn ? (
          <Link
            to="/subscribe"
            search={{ plan: "ltd", cohort: cohort.key }}
            className={`btn w-full btn-md font-semibold ${
              isCurrent
                ? "btn-primary shadow-md shadow-primary/20"
                : "btn-outline border-base-300 hover:border-primary hover:bg-primary/5"
            }`}
          >
            {isCurrent ? `Get Lifetime Deal (${cohort.label})` : `Choose ${cohort.label}`}
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Link
            to="/sign-up"
            search={{ redirect: `/subscribe?plan=ltd&cohort=${cohort.key}` }}
            className={`btn w-full btn-md font-semibold ${
              isCurrent
                ? "btn-primary shadow-md shadow-primary/20"
                : "btn-outline border-base-300 hover:border-primary hover:bg-primary/5"
            }`}
          >
            {isCurrent ? `Get Lifetime Deal (${cohort.label})` : `Choose ${cohort.label}`}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function PricingPage() {
  const { signedIn } = useMarketingSession();
  const { cohorts } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<"early_ltd" | "appsumo_ltd" | "retainer">("early_ltd");

  const currentCohort = cohorts.find(
    (c) => c.active && (c.capacity == null || c.occupied < c.capacity),
  );

  return (
    <MarketingChrome signedIn={signedIn}>
      <div className="grid-bg mx-auto w-full max-w-6xl px-4 pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge badge-primary badge-outline text-xs font-bold uppercase tracking-wider py-2 px-3">
            LIFETIME DEALS & TRANSPARENT PRICING
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pricing That Rewards Early Believers
          </h1>
          <p className="mt-4 text-base text-base-content/70 md:text-lg">
            Own the complete SEO workspace. Pay once (LTD with BYOK that goes up $10 per batch),
            choose an official AppSumo tier, or start easy from $1/month.
          </p>

          {/* Pricing Tabs Switcher */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-xl bg-base-200 p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("early_ltd")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all ${
                  activeTab === "early_ltd"
                    ? "bg-primary text-white shadow-sm"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <Zap className="size-4" />
                Early Believer LTD (BYOK)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("appsumo_ltd")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all ${
                  activeTab === "appsumo_ltd"
                    ? "bg-primary text-white shadow-sm"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <Sparkles className="size-4" />
                AppSumo Deals (5 Tiers)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("retainer")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all ${
                  activeTab === "retainer"
                    ? "bg-primary text-white shadow-sm"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                $1/mo Retainer & Monthly
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: Early Believer LTD (One-Time + BYOK) */}
        {activeTab === "early_ltd" && (
          <div className="mt-12">
            <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-primary/30 bg-primary/[0.04] p-5 text-center">
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                <Lock className="size-4" />
                <span>Pay Once, Keep Forever — Price Increases $10 Every Batch</span>
              </div>
              <p className="mt-2 text-xs md:text-sm text-base-content/75 leading-relaxed">
                You pay a single one-time fee for lifetime platform access. Powered by{" "}
                <strong>BYOK (Bring Your Own Key)</strong>: you connect your own DataForSEO & AI API
                keys so you only pay raw provider cost. Zero platform markup, unlimited scalability!
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cohorts.map((cohort) => (
                <CohortCard
                  key={cohort.key}
                  cohort={cohort}
                  isCurrent={cohort.key === currentCohort?.key}
                  signedIn={signedIn}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AppSumo Lifetime Deals (5 Tiers) */}
        {activeTab === "appsumo_ltd" && (
          <div className="mt-12">
            <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-secondary/30 bg-secondary/[0.03] p-5 text-center">
              <span className="badge badge-secondary badge-sm font-bold uppercase mb-1">
                Official AppSumo Proposal Tiers
              </span>
              <h3 className="text-lg font-bold text-base-content">
                Pick the Right Capacity for Your Team
              </h3>
              <p className="mt-1 text-xs md:text-sm text-base-content/70">
                All tiers are <strong>One-Time Payments</strong> for lifetime access. Tier 3 is the
                most popular Sweet Spot for SEO agencies.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5 items-stretch">
              {APPSUMO_TIERS.map((tier) => (
                <div
                  key={tier.tier}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                    tier.popular
                      ? "border-primary shadow-xl ring-2 ring-primary/40 bg-gradient-to-b from-primary/[0.04] to-base-100"
                      : "border-base-300 bg-base-100 hover:border-base-content/20 shadow-xs"
                  }`}
                >
                  {tier.popular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-cyan-500 px-3 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                      ★ SWEET SPOT
                    </div>
                  ) : null}

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-base-content">
                        {tier.name}
                      </h4>
                      <span className="badge badge-sm badge-ghost text-[10px] font-semibold">
                        LTD
                      </span>
                    </div>

                    <p className="text-[11px] text-base-content/60 mt-1 min-h-[30px]">
                      {tier.target}
                    </p>

                    <div className="mt-3 flex items-baseline gap-1 border-b border-base-200 pb-3">
                      <span className="text-3xl font-extrabold text-base-content">
                        ${tier.price}
                      </span>
                      <span className="text-[11px] text-base-content/50 font-medium">
                        / one-time
                      </span>
                    </div>

                    <div className="mt-3 text-xs font-semibold text-primary">
                      {tier.domains}
                    </div>

                    <ul className="mt-4 space-y-2 text-xs text-base-content/75">
                      {tier.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-1.5">
                          <Check className="size-3 text-success shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-3 border-t border-base-200">
                    <Link
                      to="/subscribe"
                      search={{ plan: "appsumo", tier: tier.tier }}
                      className={`btn w-full btn-sm font-bold ${
                        tier.popular ? "btn-primary shadow-sm" : "btn-outline"
                      }`}
                    >
                      Get Tier {tier.tier} (${tier.price})
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Retainer $1 & Subscriptions */}
        {activeTab === "retainer" && (
          <div className="mt-12">
            <div className="mx-auto max-w-2xl rounded-2xl border border-primary/30 bg-primary/[0.03] p-8 text-center shadow-xs">
              <span className="badge badge-primary badge-sm font-semibold">
                MICRO RETAINER
              </span>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-base-content">
                Start at $1/month — 100% Becomes Permanent Credits
              </h3>
              <p className="mt-3 text-sm text-base-content/70 leading-relaxed max-w-xl mx-auto">
                Looking for the lowest commitment? Every dollar converts 100% into 1,000 usage
                credits. Your credits roll over every month and <strong>never expire</strong>. Even
                if you cancel, your credit balance stays yours forever.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  to="/subscribe"
                  search={{ plan: "starter" }}
                  className="btn btn-primary btn-md rounded-xl font-bold shadow-md shadow-primary/20 gap-2 px-6"
                >
                  Start $1/month Retainer
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Credit Transparency */}
        <section className="mx-auto mt-20 max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Credit Transparency
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Simple Credit Rates & Usage Simulation
            </h2>
            <p className="mt-2 text-sm text-base-content/70 max-w-2xl mx-auto">
              Credits work like mobile prepaid balance. See exact costs per action or explore your
              monthly usage scenario.
            </p>
          </div>

          <div className="mt-10">
            <CreditPricingGuide />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto mt-20 max-w-3xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Got Questions?
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.question}
                className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-xs transition-all hover:border-primary/30"
              >
                <h3 className="text-base font-bold text-base-content">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MarketingChrome>
  );
}
