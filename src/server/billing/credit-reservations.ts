import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { runBatch } from "@/db/runBatch";
import { organization, usageCreditReservations, usageQuota } from "@/db/schema";
import {
  PAYPAL_CREDITS_FEATURE_ID,
  PAYPAL_TOPUP_CREDITS_FEATURE_ID,
} from "@/shared/billing";
import type { CreditFeature } from "@/shared/billing-credit-features";
import { AppError } from "@/server/lib/errors";

export type UsageCreditReservation =
  typeof usageCreditReservations.$inferSelect;

function poolBalance(organizationId: string, feature: string) {
  return sql<number>`coalesce((
    select ${usageQuota.used}
    from ${usageQuota}
    where ${usageQuota.organizationId} = ${organizationId}
      and ${usageQuota.feature} = ${feature}
      and ${usageQuota.period} = 'monthly'
    limit 1
  ), 0)`;
}

async function getReservation(id: string) {
  const [reservation] = await db
    .select()
    .from(usageCreditReservations)
    .where(eq(usageCreditReservations.id, id))
    .limit(1);
  return reservation ?? null;
}

/**
 * Atomically holds credits before a provider request is dispatched. Every
 * reservation for one organization writes the organization row first, which
 * is the shared Postgres serialization point; D1 executes the same statements
 * as one ordered atomic batch.
 */
export async function reserveUsageCredits(input: {
  organizationId: string;
  credits: number;
  provider: string;
  billingMode: "standard" | "byok";
  creditFeature?: CreditFeature;
}): Promise<UsageCreditReservation> {
  const credits = Math.max(0, Math.ceil(input.credits));
  if (credits <= 0) {
    throw new AppError(
      "INTERNAL_ERROR",
      "A usage-credit reservation must be greater than zero",
    );
  }

  const id = crypto.randomUUID();
  const monthlyBalance = poolBalance(
    input.organizationId,
    PAYPAL_CREDITS_FEATURE_ID,
  );
  const topupBalance = poolBalance(
    input.organizationId,
    PAYPAL_TOPUP_CREDITS_FEATURE_ID,
  );
  const enoughCredits = sql`${monthlyBalance} + ${topupBalance} >= ${credits}`;
  const monthlyAllocation = sql<number>`case
    when ${monthlyBalance} >= ${credits} then ${credits}
    else ${monthlyBalance}
  end`;

  await runBatch((tx) => [
    tx.insert(usageCreditReservations).values({
      id,
      organizationId: input.organizationId,
      provider: input.provider,
      billingMode: input.billingMode,
      creditFeature: input.creditFeature,
      reservedCredits: credits,
    }),
    // A no-op write is intentional: it serializes all reservations for this
    // organization on Postgres before balances are read and decremented.
    tx
      .update(organization)
      .set({ name: sql`${organization.name}` })
      .where(eq(organization.id, input.organizationId)),
    tx
      .update(usageCreditReservations)
      .set({
        status: sql`case when ${enoughCredits} then 'reserved' else 'rejected' end`,
        monthlyReserved: sql`case when ${enoughCredits} then ${monthlyAllocation} else 0 end`,
        topupReserved: sql`case when ${enoughCredits} then ${credits} - ${monthlyAllocation} else 0 end`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(eq(usageCreditReservations.id, id)),
    tx
      .update(usageQuota)
      .set({
        used: sql`${usageQuota.used} - coalesce((
          select ${usageCreditReservations.monthlyReserved}
          from ${usageCreditReservations}
          where ${usageCreditReservations.id} = ${id}
            and ${usageCreditReservations.status} = 'reserved'
        ), 0)`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(usageQuota.organizationId, input.organizationId),
          eq(usageQuota.feature, PAYPAL_CREDITS_FEATURE_ID),
          eq(usageQuota.period, "monthly"),
        ),
      ),
    tx
      .update(usageQuota)
      .set({
        used: sql`${usageQuota.used} - coalesce((
          select ${usageCreditReservations.topupReserved}
          from ${usageCreditReservations}
          where ${usageCreditReservations.id} = ${id}
            and ${usageCreditReservations.status} = 'reserved'
        ), 0)`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(usageQuota.organizationId, input.organizationId),
          eq(usageQuota.feature, PAYPAL_TOPUP_CREDITS_FEATURE_ID),
          eq(usageQuota.period, "monthly"),
        ),
      ),
  ]);

  const reservation = await getReservation(id);
  if (!reservation) {
    throw new AppError("INTERNAL_ERROR", "Usage-credit reservation was lost");
  }
  if (reservation.status !== "reserved") {
    throw new AppError("INSUFFICIENT_CREDITS");
  }
  return reservation;
}

export type UsageCreditSettlement = {
  reservation: UsageCreditReservation;
  monthlyCharged: number;
  topupCharged: number;
  totalCharged: number;
  overageCredits: number;
};

/**
 * Settles a hold to the provider-reported charge. Unused credits are returned
 * to their original pools. A charge above the conservative ceiling consumes
 * the full hold (and is surfaced as overage) rather than leaving spend
 * unmetered; the ceiling estimator is deliberately sized to make that an
 * exceptional provider-pricing drift signal.
 */
export async function settleUsageCreditReservation(
  reservationId: string,
  actualCreditsInput: number,
): Promise<UsageCreditSettlement> {
  const existing = await getReservation(reservationId);
  if (!existing) {
    throw new AppError("INTERNAL_ERROR", "Usage-credit reservation not found");
  }
  if (existing.status === "rejected" || existing.status === "pending") {
    throw new AppError("INSUFFICIENT_CREDITS");
  }

  const actualCredits = Math.max(0, Math.ceil(actualCreditsInput));
  const chargedCredits = Math.min(actualCredits, existing.reservedCredits);
  const monthlyCharged = Math.min(existing.monthlyReserved, chargedCredits);
  const topupCharged = chargedCredits - monthlyCharged;
  const monthlyRefund = existing.monthlyReserved - monthlyCharged;
  const topupRefund = existing.topupReserved - topupCharged;
  const now = new Date().toISOString();
  const settling = sql`exists (
    select 1 from ${usageCreditReservations}
    where ${usageCreditReservations.id} = ${reservationId}
      and ${usageCreditReservations.status} = 'settling'
  )`;

  await runBatch((tx) => [
    tx
      .update(organization)
      .set({ name: sql`${organization.name}` })
      .where(eq(organization.id, existing.organizationId)),
    tx
      .update(usageCreditReservations)
      .set({
        status: "settling",
        actualCredits,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(usageCreditReservations.id, reservationId),
          eq(usageCreditReservations.status, "reserved"),
        ),
      ),
    tx
      .update(usageQuota)
      .set({
        used: sql`${usageQuota.used} + case when ${settling} then ${monthlyRefund} else 0 end`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(usageQuota.organizationId, existing.organizationId),
          eq(usageQuota.feature, PAYPAL_CREDITS_FEATURE_ID),
          eq(usageQuota.period, "monthly"),
        ),
      ),
    tx
      .update(usageQuota)
      .set({
        used: sql`${usageQuota.used} + case when ${settling} then ${topupRefund} else 0 end`,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(usageQuota.organizationId, existing.organizationId),
          eq(usageQuota.feature, PAYPAL_TOPUP_CREDITS_FEATURE_ID),
          eq(usageQuota.period, "monthly"),
        ),
      ),
    tx
      .update(usageCreditReservations)
      .set({
        status: "settled",
        settledAt: now,
        updatedAt: sql`(current_timestamp)`,
      })
      .where(
        and(
          eq(usageCreditReservations.id, reservationId),
          eq(usageCreditReservations.status, "settling"),
        ),
      ),
  ]);

  const reservation = await getReservation(reservationId);
  if (!reservation || reservation.status !== "settled") {
    throw new AppError(
      "INTERNAL_ERROR",
      "Usage-credit reservation could not be settled",
    );
  }

  const finalActual = reservation.actualCredits ?? actualCredits;
  const finalCharged = Math.min(finalActual, reservation.reservedCredits);
  const finalMonthly = Math.min(reservation.monthlyReserved, finalCharged);
  return {
    reservation,
    monthlyCharged: finalMonthly,
    topupCharged: finalCharged - finalMonthly,
    totalCharged: finalCharged,
    overageCredits: Math.max(0, finalActual - reservation.reservedCredits),
  };
}

export function refundUsageCreditReservation(reservationId: string) {
  return settleUsageCreditReservation(reservationId, 0);
}
