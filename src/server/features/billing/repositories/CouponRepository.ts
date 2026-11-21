import { and, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { couponCodes, couponRedemptions } from "@/db/schema";

export type CouponCodeRow = typeof couponCodes.$inferSelect;

export type CouponRedeemFailure =
  | "not_found"
  | "inactive"
  | "expired"
  | "exhausted"
  | "already_redeemed";

export type CouponRedeemResult =
  | { ok: true; couponId: string; credits: number }
  | { ok: false; reason: CouponRedeemFailure };

/** Random, unambiguous coupon code (no 0/O/1/I). */
export function generateCouponCode(
  random: () => number = () => Math.random(),
): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 10; i += 1) {
    code += alphabet[Math.floor(random() * alphabet.length)];
  }
  return `SEO-${code}`;
}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export const CouponRepository = {
  async create(input: {
    id: string;
    code: string;
    credits: number;
    maxRedemptions: number | null;
    expiresAt: string | null;
    note: string | null;
    createdBy: string;
  }): Promise<CouponCodeRow> {
    const [row] = await db.insert(couponCodes).values(input).returning();
    if (!row) throw new Error("Failed to create coupon code");
    return row;
  },

  async list(limit = 50): Promise<CouponCodeRow[]> {
    return db
      .select()
      .from(couponCodes)
      .orderBy(desc(couponCodes.createdAt))
      .limit(limit);
  },

  async findByCode(code: string): Promise<CouponCodeRow | null> {
    const rows = await db
      .select()
      .from(couponCodes)
      .where(eq(couponCodes.code, code))
      .limit(1);
    return rows[0] ?? null;
  },

  /**
   * Atomically redeem a coupon for an organization:
   * 1. claim the per-org redemption row (unique index blocks repeats), then
   * 2. increment the coupon counter only while the coupon is active, not
   *    expired, and under its redemption cap — rolling back the claim row
   *    when the coupon cannot provide credits.
   */
  async redeem(input: {
    code: string;
    organizationId: string;
    nowIso: string;
    redemptionId: string;
  }): Promise<CouponRedeemResult> {
    const coupon = await CouponRepository.findByCode(input.code);
    if (!coupon) return { ok: false, reason: "not_found" };
    if (!coupon.isActive) return { ok: false, reason: "inactive" };
    if (coupon.expiresAt && coupon.expiresAt <= input.nowIso) {
      return { ok: false, reason: "expired" };
    }

    const claimed = await db
      .insert(couponRedemptions)
      .values({
        id: input.redemptionId,
        couponId: coupon.id,
        organizationId: input.organizationId,
        creditsGranted: coupon.credits,
      })
      .onConflictDoNothing()
      .returning({ id: couponRedemptions.id });
    if (claimed.length === 0) return { ok: false, reason: "already_redeemed" };

    const capCondition = coupon.maxRedemptions
      ? sql`${couponCodes.redeemedCount} < ${coupon.maxRedemptions}`
      : sql`true`;
    const incremented = await db
      .update(couponCodes)
      .set({ redeemedCount: sql`${couponCodes.redeemedCount} + 1` })
      .where(
        and(
          eq(couponCodes.id, coupon.id),
          eq(couponCodes.isActive, true),
          or(
            isNull(couponCodes.expiresAt),
            gt(couponCodes.expiresAt, input.nowIso),
          ),
          capCondition,
        ),
      )
      .returning({ id: couponCodes.id });

    if (incremented.length === 0) {
      await db
        .delete(couponRedemptions)
        .where(eq(couponRedemptions.id, input.redemptionId));
      return { ok: false, reason: "exhausted" };
    }

    return {
      ok: true,
      couponId: coupon.id,
      credits: coupon.credits,
    };
  },
};
