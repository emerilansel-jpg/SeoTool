import { AppError } from "@/server/lib/errors";
import { paypal } from "@/server/billing/paypal";
import {
  clearPlanConfigCache,
  getEffectivePlanConfigs,
  type EffectivePlanConfig,
} from "@/server/billing/plan-config";
import {
  PAYPAL_PLAN_IDS as DEFAULT_PAYPAL_PLAN_IDS,
  type PlanTier,
} from "@/shared/plans";
import { PlanConfigRepository } from "../repositories/PlanConfigRepository";

/** Save one tier's pricing. When the price changes and the tier has a PayPal
 *  plan id, the PayPal plan's pricing scheme is updated too so the amount
 *  charged matches the amount displayed. A failed sync stores "pending" and
 *  can be retried from the admin UI. */
export const AdminPricingService = {
  async getConfigs(): Promise<EffectivePlanConfig[]> {
    const configs = await getEffectivePlanConfigs();
    return Object.values(configs);
  },

  async saveTierConfig(
    input: {
      tier: PlanTier;
      priceUsd: number;
      monthlyCredits: number;
      paypalPlanId?: string;
      active: boolean;
    },
    adminUserId: string,
  ): Promise<{ syncStatus: string }> {
    const configs = await getEffectivePlanConfigs();
    const previous = configs[input.tier];

    const paypalPlanId =
      input.paypalPlanId !== undefined && input.paypalPlanId !== ""
        ? input.paypalPlanId
        : (DEFAULT_PAYPAL_PLAN_IDS[input.tier] ?? null);

    const priceUsdCents = Math.round(input.priceUsd * 100);
    const priceChanged = priceUsdCents !== previous.priceUsdCents;
    const planChanged = paypalPlanId !== previous.paypalPlanId;

    let syncStatus = previous.syncStatus;
    if (
      (priceChanged || planChanged) &&
      paypalPlanId &&
      input.tier !== "free"
    ) {
      syncStatus = await syncPaypalPrice(paypalPlanId, priceUsdCents);
    } else if (!priceChanged && !planChanged) {
      syncStatus = previous.syncStatus;
    }

    await PlanConfigRepository.upsert({
      tier: input.tier,
      priceUsdCents,
      monthlyCredits: input.monthlyCredits,
      paypalPlanId,
      syncStatus,
      active: input.active,
      updatedByUserId: adminUserId,
    });
    clearPlanConfigCache();

    return { syncStatus };
  },

  /** Retry the PayPal price sync for a tier whose last save left it pending. */
  async retrySync(
    input: { tier: PlanTier },
    adminUserId: string,
  ): Promise<{ syncStatus: string }> {
    const configs = await getEffectivePlanConfigs();
    const config = configs[input.tier];
    if (!config.paypalPlanId || input.tier === "free") {
      throw new AppError(
        "VALIDATION_ERROR",
        "This tier has no PayPal plan to sync.",
      );
    }

    const syncStatus = await syncPaypalPrice(
      config.paypalPlanId,
      config.priceUsdCents,
    );
    await PlanConfigRepository.upsert({
      tier: input.tier,
      priceUsdCents: config.priceUsdCents,
      monthlyCredits: config.monthlyCredits,
      paypalPlanId: config.paypalPlanId,
      syncStatus,
      active: config.active,
      updatedByUserId: adminUserId,
    });
    clearPlanConfigCache();
    return { syncStatus };
  },
};

async function syncPaypalPrice(
  planId: string,
  priceUsdCents: number,
): Promise<string> {
  try {
    await paypal.billingPlans.updatePricingScheme(planId, priceUsdCents);
    return "synced";
  } catch (error) {
    console.error("PayPal plan price sync failed", planId, error);
    return "pending";
  }
}
