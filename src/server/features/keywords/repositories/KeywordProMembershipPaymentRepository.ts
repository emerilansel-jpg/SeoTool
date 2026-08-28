import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { runBatch } from "@/db/runBatch";
import { keywordProMembershipPayments, usageQuota } from "@/db/schema";
import { PAYPAL_CREDITS_FEATURE_ID } from "@/shared/billing";

function creditWindow() {
  const now = new Date();
  return {
    now,
    windowEnd: new Date(
      now.getTime() + 365 * 24 * 60 * 60 * 1_000,
    ).toISOString(),
  };
}

export const KeywordProMembershipPaymentRepository = {
  async record(input: {
    paypalSaleId: string;
    organizationId: string;
    paypalSubscriptionId: string;
    grossAmountUsdCents: number;
  }) {
    await db
      .insert(keywordProMembershipPayments)
      .values(input)
      .onConflictDoNothing();
    const [payment] = await db
      .select()
      .from(keywordProMembershipPayments)
      .where(eq(keywordProMembershipPayments.paypalSaleId, input.paypalSaleId))
      .limit(1);
    if (
      !payment ||
      payment.organizationId !== input.organizationId ||
      payment.paypalSubscriptionId !== input.paypalSubscriptionId
    ) {
      return null;
    }
    return payment;
  },

  async applyMonthlyCredits(input: {
    paypalSaleId: string;
    organizationId: string;
    credits: number;
  }) {
    const { now, windowEnd } = creditWindow();
    const eligible = sql`exists (
      select 1 from ${keywordProMembershipPayments}
      where ${keywordProMembershipPayments.paypalSaleId} = ${input.paypalSaleId}
        and ${keywordProMembershipPayments.organizationId} = ${input.organizationId}
        and ${keywordProMembershipPayments.status} = 'crediting'
    )`;

    await runBatch((tx) => [
      tx
        .update(keywordProMembershipPayments)
        .set({ status: "crediting" })
        .where(
          and(
            eq(keywordProMembershipPayments.paypalSaleId, input.paypalSaleId),
            eq(
              keywordProMembershipPayments.organizationId,
              input.organizationId,
            ),
            eq(keywordProMembershipPayments.status, "pending"),
          ),
        ),
      tx
        .insert(usageQuota)
        .values({
          id: crypto.randomUUID(),
          organizationId: input.organizationId,
          feature: PAYPAL_CREDITS_FEATURE_ID,
          period: "monthly",
          used: sql`case when ${eligible} then ${input.credits} else 0 end`,
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
            used: sql`case when ${eligible} then ${input.credits} else ${usageQuota.used} end`,
            windowStart: sql`case when ${eligible} then ${now.toISOString()} else ${usageQuota.windowStart} end`,
            windowEnd: sql`case when ${eligible} then ${windowEnd} else ${usageQuota.windowEnd} end`,
            updatedAt: sql`(current_timestamp)`,
          },
        }),
      tx
        .update(keywordProMembershipPayments)
        .set({ status: "credited" })
        .where(
          and(
            eq(keywordProMembershipPayments.paypalSaleId, input.paypalSaleId),
            eq(
              keywordProMembershipPayments.organizationId,
              input.organizationId,
            ),
            eq(keywordProMembershipPayments.status, "crediting"),
          ),
        ),
    ]);
  },
};
