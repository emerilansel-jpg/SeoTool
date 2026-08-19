import { Check } from "lucide-react";
import { PLAN_PRICES_USD, PLAN_TIER_LABELS } from "@/shared/plans";
import {
  PAID_TIERS,
  TIER_HIGHLIGHTS,
  type PaidTier,
} from "@/client/features/marketing/tierHighlights";

/** Selectable pricing card grid for the subscribe page. Visual language mirrors
 *  PricingSection (public /pricing) but cards act as radio options: clicking a
 *  card selects the plan and the parent drives checkout from the selection. */
export function PlanPickerGrid({
  selected,
  onSelect,
  disabled = false,
}: {
  selected: PaidTier;
  onSelect: (tier: PaidTier) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid items-stretch gap-5 md:grid-cols-3 md:gap-6">
      {PAID_TIERS.map((tier) => {
        const highlight = TIER_HIGHLIGHTS[tier];
        const isSelected = selected === tier;

        return (
          <button
            key={tier}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onSelect(tier)}
            className={`relative flex w-full flex-col rounded-2xl border p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              isSelected
                ? "border-primary bg-gradient-to-b from-primary/[0.04] to-base-100 ring-1 ring-primary"
                : "border-base-300 bg-base-100 hover:border-base-content/25"
            } ${disabled ? "pointer-events-none opacity-60" : ""} ${
              highlight.popular && !isSelected ? "md:-translate-y-1" : ""
            } ${highlight.popular || isSelected ? "shadow-lg shadow-primary/10" : "shadow-sm"}`}
          >
            {highlight.popular ? (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-cyan-500 px-3 py-0.5 text-[11px] font-bold text-white shadow-sm shadow-primary/30">
                Most Popular
              </div>
            ) : null}

            <div
              className={`absolute right-4 top-4 flex size-5 items-center justify-center rounded-full border transition-colors ${
                isSelected
                  ? "border-primary bg-primary text-primary-content"
                  : "border-base-300 bg-base-100 text-transparent"
              }`}
            >
              <Check className="size-3 stroke-[3]" />
            </div>

            <div className="flex items-center gap-2 pr-8">
              <h3 className="text-lg font-bold tracking-tight text-base-content">
                {PLAN_TIER_LABELS[tier]}
              </h3>
              <span className="badge badge-xs badge-outline font-medium text-base-content/60">
                {highlight.badge}
              </span>
            </div>

            <p className="mt-1.5 min-h-[36px] text-sm text-base-content/70">
              {highlight.blurb}
            </p>

            <div className="mt-4 flex items-baseline gap-1.5 border-b border-base-300 pb-4">
              <span className="text-4xl font-extrabold tracking-tight tabular-nums text-base-content">
                ${PLAN_PRICES_USD[tier]}
              </span>
              <span className="text-sm font-medium text-base-content/50">
                /month
              </span>
            </div>

            <ul className="mt-4 space-y-2.5">
              {highlight.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2.5 text-sm text-base-content/85"
                >
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
