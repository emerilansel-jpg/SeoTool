// Single Source of Truth for SeoTool.im Pricing & Cohorts
// Consumed by LandingPage.tsx, pricing.tsx, and subscribe.tsx to eliminate data drift.

export interface PricingCohortDefinition {
  key: string;
  label: string;
  priceUsd: number;
  capacity: number | null;
  badge?: string;
  description: string;
}

export const LTD_COHORTS: readonly PricingCohortDefinition[] = [
  {
    key: "krp_founder_10",
    label: "Founder 10",
    priceUsd: 29,
    capacity: 10,
    badge: "10 spots only",
    description: "First 10 believers lock the absolute lowest entry price.",
  },
  {
    key: "krp_early_20",
    label: "Early 20",
    priceUsd: 39,
    capacity: 20,
    badge: "20 spots",
    description: "Next wave of early adopters before public price jump.",
  },
  {
    key: "krp_growth_50",
    label: "Growth 50",
    priceUsd: 49,
    capacity: 50,
    badge: "50 spots",
    description: "Scale cohort as new features and engines go live.",
  },
  {
    key: "krp_public",
    label: "Public",
    priceUsd: 59,
    capacity: null,
    badge: "Open cohort",
    description: "General public lifetime license. Unlimited spots.",
  },
] as const;

export interface AppSumoTierDefinition {
  tier: number;
  name: string;
  priceUsd: number;
  domains: number;
  seats: number;
  monthlyChecks: number;
  bonusCredits: number;
  subtitle: string;
  features: readonly string[];
  popular?: boolean;
}

export const APPSUMO_TIERS: readonly AppSumoTierDefinition[] = [
  {
    tier: 1,
    name: "Tier 1",
    priceUsd: 37,
    domains: 1,
    seats: 1,
    monthlyChecks: 150,
    bonusCredits: 1500,
    subtitle: "Solopreneur / Starter",
    features: [
      "1 Domain · 1 Seat",
      "150 AI checks/month",
      "250 page site audits",
      "50 daily tracked keywords",
      "1,500 bonus data credits",
      "Lifetime updates included",
    ],
  },
  {
    tier: 2,
    name: "Tier 2",
    priceUsd: 79,
    domains: 5,
    seats: 2,
    monthlyChecks: 500,
    bonusCredits: 5000,
    subtitle: "Growth Marketer",
    features: [
      "5 Domains · 2 Seats",
      "500 AI checks/month",
      "1,000 page site audits",
      "200 daily tracked keywords",
      "BYOK Capped (1,500/mo)",
      "5,000 bonus data credits",
      "Lifetime updates included",
    ],
  },
  {
    tier: 3,
    name: "Tier 3",
    priceUsd: 149,
    domains: 15,
    seats: 5,
    monthlyChecks: 1200,
    bonusCredits: 10000,
    subtitle: "Pro Agency (Sweet Spot)",
    popular: true,
    features: [
      "15 Domains · 5 Seats",
      "1,200 AI checks/month",
      "5,000 page site audits",
      "750 daily tracked keywords",
      "BYOK High Volume (10,000/mo)",
      "White-label PDF reports & CSV export",
      "10,000 bonus data credits",
      "Lifetime updates included",
    ],
  },
  {
    tier: 4,
    name: "Tier 4",
    priceUsd: 249,
    domains: 50,
    seats: 15,
    monthlyChecks: 3000,
    bonusCredits: 25000,
    subtitle: "Scale Agency",
    features: [
      "50 Domains · 15 Seats",
      "BYOK Unlimited (3 Workers)",
      "20,000 page site audits",
      "2,500 daily tracked keywords",
      "White-label PDF reports",
      "Full REST API access",
      "25,000 bonus data credits",
      "Lifetime updates included",
    ],
  },
  {
    tier: 5,
    name: "Tier 5",
    priceUsd: 399,
    domains: 150,
    seats: 50,
    monthlyChecks: 10000,
    bonusCredits: 50000,
    subtitle: "Enterprise / Reseller",
    features: [
      "150 Domains · 50 Seats",
      "BYOK True Unlimited (10 Workers)",
      "100,000 page site audits",
      "10,000 daily tracked keywords",
      "Custom CNAME client portal",
      "Webhooks & priority pipeline",
      "50,000 bonus data credits",
      "Lifetime updates included",
    ],
  },
] as const;

export const MICRO_RETAINER = {
  priceUsd: 1,
  creditsPerMonth: 1000,
  rateUsdPer1k: 1.0,
  description:
    "Lowest commitment entry. 100% converts into 1,000 permanent usage credits per dollar. Roll over indefinitely and never expire.",
} as const;
