// oxlint-disable max-lines
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Flame, Key, Lock, Sparkles, Users, Zap } from "lucide-react";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { getPublicCohortPricing } from "@/serverFunctions/public-cohorts";
import type { EffectiveKeywordProCohort } from "@/server/features/keywords/services/KeywordProConfigService";
import { CreditPricingGuide } from "@/client/features/billing/CreditPricingGuide";
import { MONTHLY_CREDIT_PACKS } from "@/shared/billing";
import { APPSUMO_TIERS } from "@/shared/pricing-definitions";

const FAQ_ITEMS = [
  {
    question: "What is the Lifetime Deal (LTD)?",
    answer:
      "A Lifetime Deal is a single one-time payment of $27 for permanent access to SeoTool.im. No recurring subscription bills. Once you claim a spot, you keep access for life.",
  },
  {
    question: "How does BYOK (Bring Your Own Key) work?",
    answer:
      "With BYOK, you connect your own Search Engine and AI provider API keys in Settings. We charge zero platform markup on your data. You pay raw provider rates (~$0.002 per scan) directly, allowing you to crawl and track at scale without limits.",
  },
  {
    question: "How does the $1/month Credit Retainer work?",
    answer:
      "If you prefer a micro commitment without an LTD, start at just $1/month. 100% of your dollar converts into 1,000 permanent usage credits per dollar ($1 = 1,000 credits). They roll over every month and never expire, remaining yours even if you cancel your plan.",
  },
  {
    question: "Do monthly credits expire?",
    answer:
      "No. All subscription credits roll over every month and never expire, even if you cancel your plan later.",
  },
  {
    question: "Can I connect AI coding agents via MCP?",
    answer:
      "Yes. SeoTool.im provides a native Model Context Protocol (MCP) server at https://seotool.im/mcp with 32 tools for Cursor, Claude Desktop, Claude Code, and autonomous AI agents.",
  },
] as const;

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
          "SeoTool.im pricing: One-time Lifetime Deals with BYOK, and volume-discounted monthly credit packs from $1/mo.",
      },
      { property: "og:title", content: "Pricing & Lifetime Deals - SeoTool.im" },
      {
        property: "og:description",
        content:
          "One-time Lifetime Deals with BYOK, and volume-discounted monthly credit packs.",
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
              <span>Batch Limit: {cohort.capacity} seats</span>
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

        {/* Scarcity Notice */}
        <div className="mt-3.5 rounded-xl border border-warning/40 bg-warning/10 p-3 text-[11px] text-base-content/85">
          <div className="flex items-center gap-1.5 font-bold text-warning-content">
            <Flame className="size-3.5 text-warning shrink-0" />
            <span>Price Increases Every 10 Subscribers</span>
          </div>
          <p className="mt-1 text-base-content/70 leading-snug">
            Each batch is strictly limited to 10 users ($27 → $39 → $49). Lock in your $27 Founder Pass before the next batch price increase.
          </p>
        </div>

        <ul className="mt-5 space-y-2 text-xs text-base-content/80">
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>All 12+ SEO & audit features unlocked</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-success shrink-0" />
            <span>Connect your own Search API & AI API Keys (BYOK)</span>
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

function MonthlyPacks({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
      {MONTHLY_CREDIT_PACKS.map((pack) => {
        const costPerK = ((pack.priceUsd / pack.credits) * 1000).toFixed(2);
        const isSweet = pack.key === "business";
        return (
          <div
            key={pack.key}
            className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
              isSweet
                ? "border-primary shadow-xl ring-2 ring-primary/40 bg-primary/[0.03]"
                : "border-base-300 bg-base-100 hover:border-base-content/20 shadow-xs"
            }`}
          >
            {pack.badge ? (
              <div
                className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-extrabold shadow-sm ${
                  isSweet ? "bg-primary text-white" : "bg-emerald-600 text-white"
                }`}
              >
                {pack.badge}
              </div>
            ) : null}

            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-base-content">{pack.name}</h4>
                <span className="badge badge-sm badge-ghost text-[10px] font-semibold">
                  ${costPerK}/1k
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-1 border-b border-base-200 pb-3">
                <span className="text-3xl font-extrabold text-base-content">
                  ${pack.priceUsd}
                </span>
                <span className="text-xs text-base-content/50 font-medium">/month</span>
              </div>

              <div className="mt-3 text-sm font-bold text-primary">
                {pack.credits.toLocaleString()} credits / mo
              </div>
              <p className="text-[11px] text-base-content/60 mt-1">
                Credits roll over and never expire
              </p>

              <ul className="mt-4 space-y-2 text-xs text-base-content/75">
                <li className="flex items-start gap-1.5">
                  <Check className="size-3 text-success shrink-0 mt-0.5" />
                  <span>100% of payment turns into credits</span>
                </li>
                {pack.bonusPercent ? (
                  <li className="flex items-start gap-1.5 font-medium text-emerald-600">
                    <Check className="size-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>+{pack.bonusPercent}% volume bonus credits</span>
                  </li>
                ) : null}
                <li className="flex items-start gap-1.5">
                  <Check className="size-3 text-success shrink-0 mt-0.5" />
                  <span>Access all tools & Jet AI agent</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="size-3 text-success shrink-0 mt-0.5" />
                  <span>Cancel anytime without losing balance</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-3 border-t border-base-200">
              {signedIn ? (
                <Link
                  to="/subscribe"
                  search={{ plan: pack.tier }}
                  className={`btn w-full btn-sm font-bold ${
                    isSweet ? "btn-primary shadow-sm" : "btn-outline"
                  }`}
                >
                  Start ${pack.priceUsd}/mo
                </Link>
              ) : (
                <Link
                  to="/sign-up"
                  search={{ redirect: `/subscribe?plan=${pack.tier}` }}
                  className={`btn w-full btn-sm font-bold ${
                    isSweet ? "btn-primary shadow-sm" : "btn-outline"
                  }`}
                >
                  Start ${pack.priceUsd}/mo
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AppSumoTiers({ signedIn }: { signedIn: boolean }) {
  return (
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
              {tier.subtitle}
            </p>

            <div className="mt-3 flex items-baseline gap-1 border-b border-base-200 pb-3">
              <span className="text-3xl font-extrabold text-base-content">
                ${tier.priceUsd}
              </span>
              <span className="text-[11px] text-base-content/50 font-medium">
                / one-time
              </span>
            </div>

            <ul className="mt-4 space-y-2 text-xs text-base-content/75">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5">
                  <Check className="size-3 text-success shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-3 border-t border-base-200">
            {signedIn ? (
              <Link
                to="/subscribe"
                search={{ plan: "appsumo", tier: String(tier.tier) }}
                className={`btn w-full btn-sm font-bold ${
                  tier.popular ? "btn-primary shadow-sm" : "btn-outline"
                }`}
              >
                Get Tier {tier.tier} (${tier.priceUsd})
              </Link>
            ) : (
              <Link
                to="/sign-up"
                search={{ redirect: `/subscribe?plan=appsumo&tier=${tier.tier}` }}
                className={`btn w-full btn-sm font-bold ${
                  tier.popular ? "btn-primary shadow-sm" : "btn-outline"
                }`}
              >
                Get Tier {tier.tier} (${tier.priceUsd})
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PricingPage() {
  const { signedIn } = useMarketingSession();
  const { cohorts } = Route.useLoaderData() as LoaderData;
  const [activeTab, setActiveTab] = useState<"ltd" | "monthly">("ltd");

  const currentCohort = cohorts.find(
    (c: EffectiveKeywordProCohort) =>
      c.active && (c.capacity == null || c.occupied < c.capacity),
  );

  return (
    <MarketingChrome signedIn={signedIn}>
      <div className="grid-bg mx-auto w-full max-w-6xl px-4 pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge badge-primary badge-outline text-xs font-bold uppercase tracking-wider py-2 px-3">
            CLEAR & TRANSPARENT PRICING
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Choose How You Want to Pay
          </h1>
          <p className="mt-4 text-base text-base-content/70 md:text-lg">
            Pay once $27 with our BYOK Lifetime Deal, or start easy from $1/month ($1 = 1,000 permanent credits + volume bonuses).
          </p>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-xl bg-base-200 p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("ltd")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all ${
                  activeTab === "ltd"
                    ? "bg-primary text-white shadow-sm"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <Zap className="size-4" />
                Early Believer LTD ($27 Once)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("monthly")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all ${
                  activeTab === "monthly"
                    ? "bg-primary text-white shadow-sm"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <Sparkles className="size-4" />
                Monthly Packs (Up to +22% Bonus)
              </button>
            </div>
          </div>
        </div>

        {activeTab === "ltd" && (
          <div className="mt-12">
            <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-primary/30 bg-primary/[0.04] p-5 text-center">
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                <Lock className="size-4" />
                <span>Single Lifetime Pass — $27 Once, Yours Forever</span>
              </div>
              <p className="mt-2 text-xs md:text-sm text-base-content/75 leading-relaxed">
                Pay a single one-time fee for lifetime platform access. Powered by{" "}
                <strong>BYOK (Bring Your Own Key)</strong>: connect your own search engine & AI API
                keys to run unlimited audits and research with zero platform markup.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning-content">
                <Flame className="size-3.5 text-warning" />
                <span>Price increases by $10–$12 every 10 subscribers ($27 → $39 → $49)</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {cohorts
                  .filter((c) => c.key === "krp_founder_10" || cohorts.length === 1)
                  .map((cohort) => (
                    <CohortCard
                      key={cohort.key}
                      cohort={cohort}
                      isCurrent={true}
                      signedIn={signedIn}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "monthly" && (
          <div className="mt-12">
            <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-base-300 bg-base-200/40 p-5 text-center">
              <h3 className="text-base font-bold text-base-content">
                Micro Retainer & Monthly Credit Packs (Save More When You Buy More)
              </h3>
              <p className="mt-1 text-xs md:text-sm text-base-content/70">
                100% of your subscription turns into permanent usage credits with up to +22% volume bonus credits.
                Credits roll over every month and never expire, even if you cancel.
              </p>
            </div>

            <MonthlyPacks signedIn={signedIn} />
          </div>
        )}

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
