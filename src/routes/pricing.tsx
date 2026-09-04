import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Lock, Users } from "lucide-react";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { getPublicCohortPricing } from "@/serverFunctions/public-cohorts";
import type { EffectiveKeywordProCohort } from "@/server/features/keywords/services/KeywordProConfigService";

const FAQ_ITEMS = [
  {
    question: "What is All Access?",
    answer:
      "All Access is a single membership that unlocks every SeoTool.im feature. Usage is paid from monthly credits, with transparent Standard or BYOK pricing. One subscription covers your entire account.",
  },
  {
    question: "How does progressive pricing work?",
    answer:
      "Early members lock in a lower rate forever. As each cohort fills, the price rises for the next group. Your monthly price never increases as long as your membership stays active.",
  },
  {
    question: "What happens when I hit my credit limit?",
    answer:
      "You will see an upgrade prompt when a feature exceeds its quota. Your existing data is never lost. You can top up credits or wait for the next monthly reset.",
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer:
      "All Access is a single tier with everything included. There is nothing to upgrade to. If you need more credits, top up from your billing page.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your billing page at any time. Your access continues through the end of the current billing period. Note: cancelling means you lose your locked-in cohort rate. If you rejoin later, you will pay the current cohort price.",
  },
  {
    question: "Is there a money-back guarantee?",
    answer:
      "Yes. Every membership is covered by a 30-day money-back guarantee. If SeoTool.im is not the right fit, request a full refund within 30 days of your first charge.",
  },
] as const;

type LoaderData = {
  cohorts: EffectiveKeywordProCohort[];
};

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing - SeoTool.im" },
      {
        name: "description",
        content:
          "SeoTool.im All Access pricing. Early members lock in a lower rate forever. Progressive cohort pricing from $29/month.",
      },
      { property: "og:title", content: "Pricing - SeoTool.im" },
      {
        property: "og:description",
        content:
          "All-in-one SEO platform. Early members lock in a lower rate forever.",
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
      className={`relative flex flex-col justify-between rounded-lg border p-6 transition-all ${
        isCurrent
          ? "border-primary shadow-sm ring-1 ring-primary/30 bg-primary/[0.02]"
          : isSoldOut
            ? "border-base-300 bg-base-200/30 opacity-60"
            : "border-base-300 bg-base-100 hover:border-base-content/20"
      }`}
    >
      {isCurrent ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
          Current Cohort
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-base-content">
            {cohort.label}
          </h3>
          <span className="inline-flex items-center gap-1 text-xs text-base-content/50">
            <Users className="size-3" />
            {spotsText}
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold tracking-tight text-base-content">
            ${priceDollars}
          </span>
          <span className="text-sm font-medium text-base-content/40">
            /month
          </span>
        </div>

        <p className="mt-2 text-xs text-base-content/50">
          <Lock className="mr-1 inline size-3" />
          Your rate is locked forever while active
        </p>

        {cohort.capacity != null ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-base-content/50 mb-1">
              <span>{cohort.occupied} joined</span>
              <span>{cohort.capacity} max</span>
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
      </div>

      <div className="mt-6">
        {isSoldOut ? (
          <button disabled className="btn btn-disabled btn-md w-full">
            Sold Out
          </button>
        ) : signedIn ? (
          <Link
            to="/subscribe"
            className={`btn w-full btn-md font-semibold ${
              isCurrent
                ? "btn-primary"
                : "btn-outline border-base-300 hover:border-primary hover:bg-primary/5"
            }`}
          >
            Join {cohort.label}
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Link
            to="/sign-up"
            search={{ redirect: "/subscribe" }}
            className={`btn w-full btn-md font-semibold ${
              isCurrent
                ? "btn-primary"
                : "btn-outline border-base-300 hover:border-primary hover:bg-primary/5"
            }`}
          >
            Join {cohort.label}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function CohortPricing({
  cohorts,
  signedIn,
}: {
  cohorts: EffectiveKeywordProCohort[];
  signedIn: boolean;
}) {
  const currentCohort = cohorts.find(
    (c) => c.active && (c.capacity == null || c.occupied < c.capacity),
  );

  return (
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
  );
}

function IncludedFeatures() {
  const features = [
    "Unlimited projects",
    "Keyword research with live SERP data",
    "Daily rank tracking across Google and Bing",
    "Technical site audits (100+ factors)",
    "Backlink intelligence and domain graph",
    "AI visibility monitoring (ChatGPT, Claude, Gemini, Perplexity)",
    "Content quality scoring and gap analysis",
    "White-label PDF reports with scheduling",
    "Autonomous SAM SEO agent",
    "36+ native MCP tools for Claude Desktop and IDEs",
    "Google Search Console and GA4 integration",
    "Priority support",
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 md:px-6 md:py-20">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Everything Included
        </span>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          One Membership, Every Feature
        </h2>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f}
            className="flex items-start gap-2.5 rounded-lg border border-base-300 bg-base-100 px-4 py-3"
          >
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Check className="size-3.5 stroke-[3]" />
            </div>
            <span className="text-sm text-base-content/80">{f}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingJsonLd() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "SeoTool.im All Access",
    description:
      "All-in-one SEO platform membership with keyword research, rank tracking, site audits, backlinks, AI visibility, and white-label reports.",
    brand: { "@type": "Brand", name: "SeoTool.im" },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "29",
      highPrice: "59",
      priceCurrency: "USD",
      offerCount: "4",
      availability: "https://schema.org/InStock",
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
      />
    </>
  );
}

function PricingPage() {
  const { signedIn } = useMarketingSession();
  const { cohorts } = Route.useLoaderData();

  return (
    <MarketingChrome signedIn={signedIn}>
      <PricingJsonLd />

      <div className="grid-bg mx-auto w-full max-w-6xl px-4 pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Progressive Pricing
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pricing That Rewards Early Believers
          </h1>
          <p className="mt-4 text-base text-base-content/60 md:text-lg">
            Join early, lock in a lower rate forever. As each cohort fills, the
            price rises for the next group. Your monthly price never increases
            while your membership stays active.
          </p>
        </div>

        <div className="mt-14">
          <CohortPricing cohorts={cohorts} signedIn={signedIn} />
        </div>

        <IncludedFeatures />

        <section className="mx-auto mt-16 max-w-3xl">
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
                className="rounded-lg border border-base-300 bg-base-100 p-5 transition-all hover:border-base-content/20"
              >
                <h3 className="text-base font-bold text-base-content">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-base-content/50">
              30-day money-back guarantee. Cancel anytime.
            </p>
            {signedIn ? (
              <Link
                to="/subscribe"
                className="btn btn-primary btn-md gap-2 px-6"
              >
                Subscribe now
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                to="/sign-up"
                search={{ redirect: "/subscribe" }}
                className="btn btn-primary btn-md gap-2 px-6"
              >
                Get started
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </MarketingChrome>
  );
}
