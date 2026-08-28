import { AppError } from "@/server/lib/errors";
import { paypal } from "@/server/billing/paypal";
import { AdminSettingsRepository } from "@/server/features/admin/repositories/AdminSettingsRepository";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { KeywordProCohortSeatRepository } from "@/server/features/keywords/repositories/KeywordProCohortSeatRepository";
import {
  KEYWORD_PRO_COHORTS,
  type KeywordProCohortKey,
} from "@/shared/keyword-pro-membership";

const PRODUCT_SETTING_KEY = "PAYPAL_ALL_ACCESS_PRODUCT_ID";

export type EffectiveKeywordProCohort = {
  key: KeywordProCohortKey;
  label: string;
  capacity: number | null;
  occupied: number;
  remaining: number | null;
  priceUsdCents: number;
  paypalPlanId: string | null;
  active: boolean;
  configured: boolean;
};

async function ensureProduct(adminUserId: string) {
  const existing = await AdminSettingsRepository.get(PRODUCT_SETTING_KEY);
  if (existing?.value) return existing.value;
  const product = await paypal.products.create({
    name: "SeoTool.im All Access",
    description: "All SeoTool.im features with grandfathered cohort pricing",
  });
  await AdminSettingsRepository.upsert({
    key: PRODUCT_SETTING_KEY,
    value: product.id,
    isSecret: false,
    updatedByUserId: adminUserId,
  });
  return product.id;
}

async function createPlan(input: {
  productId: string;
  label: string;
  priceUsdCents: number;
}) {
  return paypal.billingPlans.create({
    product_id: input.productId,
    name: `SeoTool.im All Access — ${input.label}`,
    description: `Grandfathered All Access ${input.label} monthly membership`,
    monthly_price_cents: input.priceUsdCents,
  });
}

export const KeywordProConfigService = {
  async getCohorts(): Promise<EffectiveKeywordProCohort[]> {
    const rows = await KeywordProRepository.listCohortConfigs();
    const byKey = new Map(rows.map((row) => [row.tier, row]));
    return Promise.all(
      KEYWORD_PRO_COHORTS.map(async (cohort) => {
        const row = byKey.get(cohort.key);
        const persistedMemberships =
          await KeywordProRepository.countReservedMemberships(cohort.key);
        const occupied =
          cohort.capacity == null
            ? persistedMemberships
            : Math.max(row?.reservedSeats ?? 0, persistedMemberships);
        return {
          key: cohort.key,
          label: cohort.label,
          capacity: cohort.capacity,
          occupied,
          remaining:
            cohort.capacity == null
              ? null
              : Math.max(0, cohort.capacity - occupied),
          priceUsdCents: row?.priceUsdCents ?? cohort.defaultPriceUsdCents,
          paypalPlanId: row?.paypalPlanId ?? null,
          active: row?.active ?? true,
          configured: Boolean(row?.paypalPlanId),
        };
      }),
    );
  },

  async getCurrentCohort() {
    const cohorts = await this.getCohorts();
    const cohort = cohorts.find(
      (candidate) =>
        candidate.active &&
        (candidate.capacity == null || candidate.occupied < candidate.capacity),
    );
    if (!cohort) {
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        "All Access membership is temporarily unavailable.",
      );
    }
    return cohort;
  },

  async reserveCheckoutCohort() {
    const cohorts = await this.getCohorts();
    for (const cohort of cohorts) {
      if (!cohort.active) continue;
      if (cohort.capacity != null && cohort.occupied >= cohort.capacity) {
        continue;
      }
      if (!cohort.paypalPlanId) {
        throw new AppError(
          "UPSTREAM_UNAVAILABLE",
          "All Access checkout is not configured yet. Please contact support.",
        );
      }
      const configuredCohort = {
        ...cohort,
        paypalPlanId: cohort.paypalPlanId,
      };
      if (cohort.capacity == null) {
        return { cohort: configuredCohort, seatReserved: false };
      }
      if (
        await KeywordProCohortSeatRepository.reserve(
          cohort.key,
          cohort.capacity,
        )
      ) {
        return { cohort: configuredCohort, seatReserved: true };
      }
    }
    throw new AppError(
      "UPSTREAM_UNAVAILABLE",
      "All Access membership is temporarily unavailable.",
    );
  },

  async saveCohort(
    input: { key: KeywordProCohortKey; priceUsdCents: number; active: boolean },
    adminUserId: string,
  ) {
    const current = (await this.getCohorts()).find(
      (cohort) => cohort.key === input.key,
    );
    if (!current) throw new AppError("NOT_FOUND", "Unknown pricing cohort.");

    let paypalPlanId = current.paypalPlanId;
    const priceChanged = input.priceUsdCents !== current.priceUsdCents;
    if (input.active && (!paypalPlanId || priceChanged)) {
      // Never mutate an existing cohort plan: members already subscribed to it
      // keep that price forever. Future buyers use the newly-created plan.
      const productId = await ensureProduct(adminUserId);
      const plan = await createPlan({
        productId,
        label: current.label,
        priceUsdCents: input.priceUsdCents,
      });
      paypalPlanId = plan.id;
    }

    await KeywordProRepository.upsertCohortConfig({
      key: input.key,
      priceUsdCents: input.priceUsdCents,
      paypalPlanId,
      active: input.active,
      updatedByUserId: adminUserId,
    });
    return { paypalPlanId };
  },

  async initializePaypalPlans(adminUserId: string) {
    const productId = await ensureProduct(adminUserId);
    const cohorts = await this.getCohorts();
    let created = 0;
    for (const cohort of cohorts) {
      if (cohort.paypalPlanId) continue;
      const plan = await createPlan({
        productId,
        label: cohort.label,
        priceUsdCents: cohort.priceUsdCents,
      });
      await KeywordProRepository.upsertCohortConfig({
        key: cohort.key,
        priceUsdCents: cohort.priceUsdCents,
        paypalPlanId: plan.id,
        active: cohort.active,
        updatedByUserId: adminUserId,
      });
      created++;
    }
    return { created };
  },
};
