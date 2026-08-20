import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import {
  PLAN_PRICES_USD,
  PLAN_TIER_LABELS,
  type PlanTier,
} from "@/shared/plans";
import {
  PAID_TIERS,
  TIER_HIGHLIGHTS,
} from "@/client/features/marketing/tierHighlights";

/** Effective per-tier prices (from the plan config loader). Falls back to the
 *  deploy-time constants when not provided. */
export function PricingSection({
  signedIn = false,
  prices,
  hiddenTiers,
}: {
  signedIn?: boolean;
  prices?: Record<PlanTier, number>;
  hiddenTiers?: PlanTier[];
}) {
  const effectivePrices = prices ?? PLAN_PRICES_USD;
  const visibleTiers = PAID_TIERS.filter(
    (tier) => !(hiddenTiers ?? []).includes(tier),
  );
  return (
    <div className="grid gap-8 md:grid-cols-3 items-stretch">
      {visibleTiers.map((tier) => {
        const highlight = TIER_HIGHLIGHTS[tier];

        return (
          <div
            key={tier}
            className={`group relative flex flex-col justify-between rounded-2xl border bg-base-100 p-7 transition-all duration-200 ${
              highlight.popular
                ? "border-primary shadow-xl shadow-primary/10 md:-translate-y-2 ring-1 ring-primary/40 bg-gradient-to-b from-primary/[0.03] to-base-100"
                : "border-base-300 shadow-sm hover:border-base-content/20 hover:shadow-md"
            }`}
          >
            {highlight.popular ? (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-cyan-500 px-3.5 py-0.5 text-xs font-bold text-white shadow-sm shadow-primary/30">
                Most Popular
              </div>
            ) : null}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight text-base-content">
                  {PLAN_TIER_LABELS[tier]}
                </h3>
                <span className="badge badge-sm badge-outline font-medium text-xs text-base-content/60">
                  {highlight.badge}
                </span>
              </div>

              <p className="mt-2 text-sm text-base-content/70 min-h-[40px]">
                {highlight.blurb}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5 border-b border-base-300 pb-6">
                <span className="text-4xl font-extrabold tracking-tight text-base-content md:text-5xl">
                  ${effectivePrices[tier]}
                </span>
                <span className="text-sm font-medium text-base-content/50">
                  /month
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {highlight.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2.5 text-sm text-base-content/85"
                  >
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              {signedIn ? (
                <Link
                  to="/subscribe"
                  search={{ plan: tier }}
                  className={`btn w-full btn-md font-semibold transition-all ${
                    highlight.popular
                      ? "btn-primary shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35"
                      : "btn-outline border-base-300 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  Choose {PLAN_TIER_LABELS[tier]}
                </Link>
              ) : (
                <Link
                  to="/sign-up"
                  search={{ redirect: "/subscribe" }}
                  className={`btn w-full btn-md font-semibold transition-all ${
                    highlight.popular
                      ? "btn-primary shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35"
                      : "btn-outline border-base-300 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  Choose {PLAN_TIER_LABELS[tier]}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
