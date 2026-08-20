// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- typed Records assembled from loop iteration
import {
  PAYPAL_PLAN_IDS as DEFAULT_PAYPAL_PLAN_IDS,
  PLAN_PRICES_USD,
  PLAN_TIERS,
  type PlanTier,
} from "@/shared/plans";
import { MONTHLY_CREDIT_GRANTS } from "@/shared/billing";
// Type-only import: erased at build time, so the repository (and @/db) stays
// out of this module's runtime import graph (see loadConfigs).
import type { PlanConfigRow } from "@/server/features/admin/repositories/PlanConfigRepository";

// ---------------------------------------------------------------------------
// Effective plan pricing: plan_config DB rows layered over the deploy-time
// constants in shared/plans.ts + shared/billing.ts. A missing row (or a
// missing column) falls back to the constant so pricing survives a DB wipe.
// ---------------------------------------------------------------------------

export interface EffectivePlanConfig {
  tier: PlanTier;
  priceUsdCents: number;
  monthlyCredits: number;
  paypalPlanId: string | null;
  active: boolean;
  syncStatus: string;
  priceSource: "default" | "db";
  creditsSource: "default" | "db";
  paypalPlanIdSource: "default" | "db";
  updatedAt: string | null;
}

export type EffectivePlanConfigs = Record<PlanTier, EffectivePlanConfig>;

const CACHE_TTL_MS = 60_000;

let cache: { configs: EffectivePlanConfigs; at: number } | null = null;
let loadPromise: Promise<EffectivePlanConfigs> | null = null;

export function clearPlanConfigCache(): void {
  cache = null;
}

async function loadConfigs(): Promise<EffectivePlanConfigs> {
  // Dynamic import: this module sits in hot billing chains (credits.ts) whose
  // unit tests mock cloudflare:workers without DB bindings, so @/db must stay
  // out of the static import graph. Any load failure falls back to constants.
  let rows: PlanConfigRow[] = [];
  try {
    const { PlanConfigRepository } =
      await import("@/server/features/admin/repositories/PlanConfigRepository");
    rows = await PlanConfigRepository.listAll();
  } catch {
    rows = [];
  }
  const byTier = new Map(rows.map((row) => [row.tier, row]));

  const configs = {} as EffectivePlanConfigs;
  for (const tier of PLAN_TIERS) {
    const row = byTier.get(tier);
    configs[tier] = {
      tier,
      priceUsdCents: row?.priceUsdCents ?? PLAN_PRICES_USD[tier] * 100,
      monthlyCredits: row?.monthlyCredits ?? MONTHLY_CREDIT_GRANTS[tier],
      paypalPlanId: row?.paypalPlanId ?? DEFAULT_PAYPAL_PLAN_IDS[tier] ?? null,
      active: row?.active ?? true,
      syncStatus: row?.syncStatus ?? "synced",
      priceSource: row ? "db" : "default",
      creditsSource: row ? "db" : "default",
      paypalPlanIdSource: row?.paypalPlanId ? "db" : "default",
      updatedAt: row?.updatedAt ?? null,
    };
  }
  return configs;
}

export async function getEffectivePlanConfigs(): Promise<EffectivePlanConfigs> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.configs;
  }
  if (!loadPromise) {
    loadPromise = loadConfigs().then((configs) => {
      cache = { configs, at: Date.now() };
      loadPromise = null;
      return configs;
    });
  }
  return loadPromise;
}

export async function getEffectiveMonthlyCreditGrant(
  tier: PlanTier,
): Promise<number> {
  const configs = await getEffectivePlanConfigs();
  return configs[tier].monthlyCredits;
}

export async function getEffectivePaypalPlanId(
  tier: PlanTier,
): Promise<string | null> {
  const configs = await getEffectivePlanConfigs();
  return configs[tier].paypalPlanId;
}

/** Resolve a PayPal plan id back to a tier, honoring DB-configured plan ids
 *  (falls back to the static map in shared/plans.ts). */
export async function resolvePlanTierByPaypalPlanId(
  planId: string | null | undefined,
): Promise<PlanTier | null> {
  if (!planId) return null;
  const configs = await getEffectivePlanConfigs();
  for (const tier of PLAN_TIERS) {
    if (configs[tier].paypalPlanId === planId) return tier;
  }
  return null;
}

/** Effective monthly price in whole dollars (display + MRR math). */
export async function getEffectivePricesUsd(): Promise<
  Record<PlanTier, number>
> {
  const configs = await getEffectivePlanConfigs();
  const prices = {} as Record<PlanTier, number>;
  for (const tier of PLAN_TIERS) {
    prices[tier] = configs[tier].priceUsdCents / 100;
  }
  return prices;
}
