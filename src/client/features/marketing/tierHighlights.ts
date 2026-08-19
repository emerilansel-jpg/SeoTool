import type { PlanTier } from "@/shared/plans";
import { MONTHLY_CREDIT_GRANTS } from "@/shared/billing";

export type PaidTier = Exclude<PlanTier, "free">;

export const PAID_TIERS: PaidTier[] = ["lite", "pro", "agency"];

export type TierHighlight = {
  /** Positioning line under the tier name. */
  blurb: string;
  /** Feature bullets shown per card. Numbers come from the single source of
   *  truth in src/shared/plans.ts + billing.ts so marketing copy can never
   *  drift from enforcement. */
  bullets: string[];
  /** Small badge next to the tier name (Starter / Growth / Scale). */
  badge: string;
  /** Whether the card carries the "Most Popular" treatment. */
  popular: boolean;
};

export const TIER_HIGHLIGHTS: Record<PaidTier, TierHighlight> = {
  lite: {
    blurb: "For solo founders validating one site.",
    bullets: [
      "5 projects",
      "100 keyword searches per day",
      "50 tracked keywords",
      "3 site audits per month",
      `${MONTHLY_CREDIT_GRANTS.lite.toLocaleString()} monthly data credits`,
    ],
    badge: "Starter",
    popular: false,
  },
  pro: {
    blurb: "For growing teams that live in SEO data.",
    bullets: [
      "25 projects",
      "500 keyword searches per day",
      "500 tracked keywords",
      "100 backlink checks per day",
      "AI Visibility and Content Intelligence",
      `${MONTHLY_CREDIT_GRANTS.pro.toLocaleString()} monthly data credits`,
    ],
    badge: "Growth",
    popular: true,
  },
  agency: {
    blurb: "For agencies running many client sites.",
    bullets: [
      "Unlimited projects",
      "500 backlink checks per day",
      "50 site audits per month",
      "SAM AI agent and MCP access",
      `${MONTHLY_CREDIT_GRANTS.agency.toLocaleString()} monthly data credits`,
    ],
    badge: "Scale",
    popular: false,
  },
};
