import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { runBatch } from "@/db/runBatch";
import {
  keywordProReferralAttributions,
  keywordProReferralCommissions,
  usageQuota,
} from "@/db/schema";
import { PAYPAL_TOPUP_CREDITS_FEATURE_ID } from "@/shared/billing";

function creditWindow() {
  const now = new Date();
  return {
    now,
    windowEnd: new Date(
      now.getTime() + 365 * 24 * 60 * 60 * 1_000,
    ).toISOString(),
  };
}

export const KeywordProReferralRewardRepository = {
  async grantReferredReward(input: {
    attributionId: string;
    referredOrganizationId: string;
    rewardCredits: number;
  }) {
    const { now, windowEnd } = creditWindow();
    const eligible = sql`exists (
      select 1 from ${keywordProReferralAttributions}
      where ${keywordProReferralAttributions.id} = ${input.attributionId}
        and ${keywordProReferralAttributions.status} = 'crediting'
        and ${keywordProReferralAttributions.referredRewardGranted} = true
    )`;

    await runBatch((tx) => [
      tx
        .update(keywordProReferralAttributions)
        .set({
          status: "crediting",
          referredRewardGranted: true,
          qualifiedAt: sql`coalesce(${keywordProReferralAttributions.qualifiedAt}, current_timestamp)`,
          updatedAt: sql`(current_timestamp)`,
        })
        .where(
          and(
            eq(keywordProReferralAttributions.id, input.attributionId),
            eq(keywordProReferralAttributions.referredRewardGranted, false),
          ),
        ),
      tx
        .insert(usageQuota)
        .values({
          id: crypto.randomUUID(),
          organizationId: input.referredOrganizationId,
          feature: PAYPAL_TOPUP_CREDITS_FEATURE_ID,
          period: "monthly",
          used: sql`case when ${eligible} then ${input.rewardCredits} else 0 end`,
          windowStart: now.toISOString(),
          windowEnd,
        })
        .onConflictDoUpdate({
          target: [
            usageQuota.organizationId,
            usageQuota.feature,
            usageQuota.period,
          ],
          set: {
            used: sql`${usageQuota.used} + case when ${eligible} then ${input.rewardCredits} else 0 end`,
            updatedAt: sql`(current_timestamp)`,
          },
        }),
      tx
        .update(keywordProReferralAttributions)
        .set({
          status: "qualified",
          updatedAt: sql`(current_timestamp)`,
        })
        .where(
          and(
            eq(keywordProReferralAttributions.id, input.attributionId),
            eq(keywordProReferralAttributions.status, "crediting"),
          ),
        ),
    ]);

    const [attribution] = await db
      .select({
        status: keywordProReferralAttributions.status,
        referredRewardGranted:
          keywordProReferralAttributions.referredRewardGranted,
      })
      .from(keywordProReferralAttributions)
      .where(eq(keywordProReferralAttributions.id, input.attributionId))
      .limit(1);
    return (
      attribution?.status === "qualified" && attribution.referredRewardGranted
    );
  },

  async getCommissionByPaypalSale(paypalSaleId: string) {
    const [row] = await db
      .select()
      .from(keywordProReferralCommissions)
      .where(eq(keywordProReferralCommissions.paypalSaleId, paypalSaleId))
      .limit(1);
    return row ?? null;
  },

  async recordCommission(input: {
    attributionId: string;
    paypalSaleId: string;
    grossAmountUsdCents: number;
    rewardCredits: number;
  }) {
    const [commission] = await db
      .insert(keywordProReferralCommissions)
      .values({ id: crypto.randomUUID(), ...input, status: "pending" })
      .onConflictDoNothing()
      .returning();
    return commission ?? null;
  },

  async creditReferralCommission(input: {
    attributionId: string;
    commissionId: string;
    referrerOrganizationId: string;
    rewardCredits: number;
  }) {
    const { now, windowEnd } = creditWindow();
    const creditedCount = sql`(
      select count(*) from ${keywordProReferralCommissions}
      where ${keywordProReferralCommissions.attributionId} = ${input.attributionId}
        and ${keywordProReferralCommissions.status} = 'credited'
    )`;
    const maxRewardMonths = sql`(
      select ${keywordProReferralAttributions.maxRewardMonths}
      from ${keywordProReferralAttributions}
      where ${keywordProReferralAttributions.id} = ${input.attributionId}
    )`;
    const eligible = sql`exists (
      select 1 from ${keywordProReferralCommissions}
      where ${keywordProReferralCommissions.id} = ${input.commissionId}
        and ${keywordProReferralCommissions.attributionId} = ${input.attributionId}
        and ${keywordProReferralCommissions.status} = 'crediting'
    )`;

    await runBatch((tx) => [
      // Every commission for one attribution locks this shared row first.
      // Different final-cycle sales therefore cannot both claim the last slot.
      tx
        .update(keywordProReferralAttributions)
        .set({ updatedAt: sql`(current_timestamp)` })
        .where(eq(keywordProReferralAttributions.id, input.attributionId)),
      tx
        .update(keywordProReferralCommissions)
        .set({ status: "crediting" })
        .where(
          and(
            eq(keywordProReferralCommissions.id, input.commissionId),
            eq(
              keywordProReferralCommissions.attributionId,
              input.attributionId,
            ),
            eq(keywordProReferralCommissions.status, "pending"),
            sql`${creditedCount} < ${maxRewardMonths}`,
          ),
        ),
      tx
        .insert(usageQuota)
        .values({
          id: crypto.randomUUID(),
          organizationId: input.referrerOrganizationId,
          feature: PAYPAL_TOPUP_CREDITS_FEATURE_ID,
          period: "monthly",
          used: sql`case when ${eligible} then ${input.rewardCredits} else 0 end`,
          windowStart: now.toISOString(),
          windowEnd,
        })
        .onConflictDoUpdate({
          target: [
            usageQuota.organizationId,
            usageQuota.feature,
            usageQuota.period,
          ],
          set: {
            used: sql`${usageQuota.used} + case when ${eligible} then ${input.rewardCredits} else 0 end`,
            updatedAt: sql`(current_timestamp)`,
          },
        }),
      tx
        .update(keywordProReferralCommissions)
        .set({ status: "credited" })
        .where(
          and(
            eq(keywordProReferralCommissions.id, input.commissionId),
            eq(
              keywordProReferralCommissions.attributionId,
              input.attributionId,
            ),
            eq(keywordProReferralCommissions.status, "crediting"),
          ),
        ),
      tx
        .update(keywordProReferralAttributions)
        .set({
          rewardedMonths: sql`(
            select count(*) from ${keywordProReferralCommissions}
            where ${keywordProReferralCommissions.attributionId} = ${input.attributionId}
              and ${keywordProReferralCommissions.status} = 'credited'
          )`,
          updatedAt: sql`(current_timestamp)`,
        })
        .where(eq(keywordProReferralAttributions.id, input.attributionId)),
      tx
        .update(keywordProReferralCommissions)
        .set({ status: "cap_reached" })
        .where(
          and(
            eq(keywordProReferralCommissions.id, input.commissionId),
            eq(
              keywordProReferralCommissions.attributionId,
              input.attributionId,
            ),
            eq(keywordProReferralCommissions.status, "pending"),
            sql`${creditedCount} >= ${maxRewardMonths}`,
          ),
        ),
    ]);

    const [commission] = await db
      .select({ status: keywordProReferralCommissions.status })
      .from(keywordProReferralCommissions)
      .where(eq(keywordProReferralCommissions.id, input.commissionId))
      .limit(1);
    return commission?.status === "credited";
  },
};
