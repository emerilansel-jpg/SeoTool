import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  MarketingChrome,
  useMarketingSession,
} from "@/client/features/marketing/MarketingChrome";
import { PricingSection } from "@/client/features/marketing/PricingSection";
import { getEffectivePlanConfigs } from "@/server/billing/plan-config";
import { PLAN_PRICES_USD, type PlanTier } from "@/shared/plans";

const FAQ_ITEMS = [
  {
    question: "Is there a free plan?",
    answer:
      "No. SeoTool.im is subscription-only: pick Lite, Pro, or Agency to unlock the tools. Every plan is covered by a 30-day money-back guarantee, so you can try risk free.",
  },
  {
    question: "What happens when I hit my quota limit?",
    answer:
      "You will see an upgrade prompt when a feature exceeds its quota. Your existing data is never lost. Upgrade or wait for the next reset window.",
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer:
      "Yes. Changes take effect immediately and your usage quotas reset to match the new plan. Billing is handled through PayPal Subscriptions.",
  },
  {
    question: "Do quotas reset?",
    answer:
      "Daily quotas (keyword searches, backlink checks) reset every day at midnight UTC. Monthly quotas (audits, AI scans, content intelligence) reset at the start of each billing cycle.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your billing page at any time. Your access continues through the end of the current billing period.",
  },
] as const;

function PricingPage() {
  const { signedIn } = useMarketingSession();
  // Loaded server-side: the effective (admin-editable) prices, so the public
  // pricing page never disagrees with checkout.
  const { prices, hiddenTiers } = Route.useLoaderData();

  return (
    <MarketingChrome signedIn={signedIn}>
      <div className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[700px] opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--color-primary), #00e5ff, transparent 70%)",
          }}
        />

        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Simple & Scalable
            </span>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Pricing Built for Growth
            </h1>
            <p className="mt-4 text-base text-base-content/70 md:text-lg">
              One subscription unlocks every tool. Each tier includes a monthly
              credit balance for live SEO data and AI features, and you can top
              up any time.
            </p>
          </div>

          <div className="mt-14">
            <PricingSection
              signedIn={signedIn}
              prices={prices}
              hiddenTiers={hiddenTiers}
            />
          </div>

          <section className="mx-auto mt-24 max-w-3xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Got Questions?
              </span>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="mt-8 space-y-4">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.question}
                  className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:border-base-content/20"
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

          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-base-content/60">
                Ready to take your SEO strategy to the next level?
              </p>
              {signedIn ? (
                <Link
                  to="/subscribe"
                  className="btn btn-primary btn-md gap-2 px-6 shadow-md shadow-primary/25"
                >
                  Subscribe now
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  to="/sign-up"
                  search={{ redirect: "/subscribe" }}
                  className="btn btn-primary btn-md gap-2 px-6 shadow-md shadow-primary/25"
                >
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </MarketingChrome>
  );
}

export const Route = createFileRoute("/pricing")({
  loader: async () => {
    const configs = await getEffectivePlanConfigs();
    // Seed with the deploy constants so the record is fully typed without a
    // cast; every tier is then overwritten from the effective config.
    const prices: Record<PlanTier, number> = { ...PLAN_PRICES_USD };
    const hiddenTiers: PlanTier[] = [];
    for (const config of Object.values(configs)) {
      prices[config.tier] = config.priceUsdCents / 100;
      if (!config.active) hiddenTiers.push(config.tier);
    }
    return { prices, hiddenTiers };
  },
  component: PricingPage,
});
