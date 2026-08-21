import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { usageQuota, subscription, member, user } from "@/db/schema";
import type { PlanTier, QuotaFeature } from "@/shared/plans";

export type UsageQuotaRow = typeof usageQuota.$inferSelect;
export type SubscriptionRow = typeof subscription.$inferSelect;

// ---------------------------------------------------------------------------
// Subscription (plan tier)
// ---------------------------------------------------------------------------

/** Returns the org's subscription row, or null if none exists. A null result
 *  means the org is on the default free tier (the row is lazily upserted on
 *  first customer creation). */
export async function getSubscription(
  organizationId: string,
): Promise<SubscriptionRow | null> {
  const rows = await db
    .select()
    .from(subscription)
    .where(eq(subscription.organizationId, organizationId))
    .limit(1);
  return rows[0] ?? null;
}

/** Returns the org's current plan tier, defaulting to "free" when no
 *  subscription row exists yet. */
export async function getPlanTier(organizationId: string): Promise<PlanTier> {
  const row = await getSubscription(organizationId);
  return row?.planTier ?? "free";
}

/** Returns the email of the org's owner (member with role "owner"), or null
 *  when the org has no owner row. Used by the platform-admin quota bypass. */
export async function getOwnerEmail(
  organizationId: string,
): Promise<string | null> {
  const rows = await db
    .select({ email: user.email })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(
      and(eq(member.organizationId, organizationId), eq(member.role, "owner")),
    )
    .limit(1);
  return rows[0]?.email ?? null;
}

/** Upsert the org's subscription. Called by the billing webhook when PayPal
 *  reports a subscription change, and lazily on first customer creation to
 *  pin the default free tier. */
export async function upsertSubscription(input: {
  organizationId: string;
  planTier: PlanTier;
  paypalSubscriptionId?: string | null;
  status?: string;
  currentPeriodEnd?: string | null;
}): Promise<SubscriptionRow> {
  // D1 + Postgres both support ON CONFLICT via returning(); the insert with
  // onConflictDoUpdate gives us an atomic upsert that returns the final row.
  const [row] = await db
    .insert(subscription)
    .values({
      organizationId: input.organizationId,
      planTier: input.planTier,
      paypalSubscriptionId: input.paypalSubscriptionId ?? null,
      status: input.status ?? "active",
      currentPeriodEnd: input.currentPeriodEnd ?? null,
    })
    .onConflictDoUpdate({
      target: subscription.organizationId,
      set: {
        planTier: input.planTier,
        paypalSubscriptionId: input.paypalSubscriptionId ?? null,
        status: input.status ?? "active",
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        updatedAt: sql`(current_timestamp)`,
      },
    })
    .returning();
  if (!row) throw new Error("Failed to upsert subscription");
  return row;
}

// ---------------------------------------------------------------------------
// Usage quota (windowed features only)
// ---------------------------------------------------------------------------

/** Returns the usage_quota row for (org, feature, period), or null if none. */
export async function getUsageQuota(
  organizationId: string,
  feature: QuotaFeature,
  period: "daily" | "monthly",
): Promise<UsageQuotaRow | null> {
  const rows = await db
    .select()
    .from(usageQuota)
    .where(
      and(
        eq(usageQuota.organizationId, organizationId),
        eq(usageQuota.feature, feature),
        eq(usageQuota.period, period),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** Returns all windowed usage_quota rows for an org (for the billing UI). */
export async function listUsageQuota(
  organizationId: string,
): Promise<UsageQuotaRow[]> {
  return db
    .select()
    .from(usageQuota)
    .where(eq(usageQuota.organizationId, organizationId));
}

/** Atomic upsert: increment used by `delta`, resetting the window if the
 *  current time is past windowEnd. Returns the resulting row so the caller
 *  knows the post-increment used count. The reset + increment happens in a
 *  single statement via onConflictDoUpdate so concurrent requests can't
 *  race past the limit. */
export async function incrementUsageQuota(input: {
  organizationId: string;
  feature: QuotaFeature;
  period: "daily" | "monthly";
  delta: number;
  windowStart: string;
  windowEnd: string;
}): Promise<UsageQuotaRow> {
  const [row] = await db
    .insert(usageQuota)
    .values({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      feature: input.feature,
      period: input.period,
      used: input.delta,
      windowStart: input.windowStart,
      windowEnd: input.windowEnd,
    })
    .onConflictDoUpdate({
      target: [
        usageQuota.organizationId,
        usageQuota.feature,
        usageQuota.period,
      ],
      // If the window has elapsed, reset to delta (not add to stale used).
      // Otherwise add delta to the existing used. The WHERE clause on the
      // conflict update is the key: it makes the reset conditional.
      set: {
        used: sql`CASE
          WHEN ${usageQuota.windowEnd} < ${input.windowStart}
          THEN ${input.delta}
          ELSE ${usageQuota.used} + ${input.delta}
        END`,
        windowStart: sql`CASE
          WHEN ${usageQuota.windowEnd} < ${input.windowStart}
          THEN ${input.windowStart}
          ELSE ${usageQuota.windowStart}
        END`,
        windowEnd: sql`CASE
          WHEN ${usageQuota.windowEnd} < ${input.windowStart}
          THEN ${input.windowEnd}
          ELSE ${usageQuota.windowEnd}
        END`,
        updatedAt: sql`(current_timestamp)`,
      },
    })
    .returning();
  if (!row) throw new Error("Failed to increment usage quota");
  return row;
}

/** Peek at the current usage without incrementing. Used by the UI and by
 *  pre-flight checks that want to read without side effects. Returns used=0
 *  and the fresh window when no row exists. */
export async function peekUsageQuota(
  organizationId: string,
  feature: QuotaFeature,
  period: "daily" | "monthly",
): Promise<{
  used: number;
  windowStart: string | null;
  windowEnd: string | null;
}> {
  const row = await getUsageQuota(organizationId, feature, period);
  return {
    used: row?.used ?? 0,
    windowStart: row?.windowStart ?? null,
    windowEnd: row?.windowEnd ?? null,
  };
}

/** Delete all usage_quota rows for an org. Called when a subscription is
 *  canceled (resets to free-tier quotas with fresh windows). */
export async function resetUsageQuotaForOrg(
  organizationId: string,
): Promise<void> {
  await db
    .delete(usageQuota)
    .where(eq(usageQuota.organizationId, organizationId));
}

export const QuotaRepository = {
  getSubscription,
  getPlanTier,
  getOwnerEmail,
  upsertSubscription,
  getUsageQuota,
  listUsageQuota,
  incrementUsageQuota,
  peekUsageQuota,
  resetUsageQuotaForOrg,
};
