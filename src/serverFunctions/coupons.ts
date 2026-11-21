import { createServerFn } from "@tanstack/react-start";
import { AppError } from "@/server/lib/errors";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";
import {
  CreateCouponSchema,
  ListCouponsSchema,
  RedeemCouponSchema,
} from "@/types/schemas/coupons";
import {
  generateCouponCode,
  normalizeCouponCode,
  CouponRepository,
} from "@/server/features/billing/repositories/CouponRepository";
import { addTopupCredits } from "@/server/billing/credits";

// ---------------------------------------------------------------------------
// Admin side: create + list coupon codes
// ---------------------------------------------------------------------------

export const createAdminCoupon = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(CreateCouponSchema)
  .handler(async ({ data, context }) => {
    const code = data.code
      ? normalizeCouponCode(data.code)
      : generateCouponCode();
    try {
      const coupon = await CouponRepository.create({
        id: crypto.randomUUID(),
        code,
        credits: data.credits,
        maxRedemptions: data.maxRedemptions ?? null,
        expiresAt: data.expiresAt ?? null,
        note: data.note ?? null,
        createdBy: context.userId,
      });
      return { ok: true as const, coupon };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("UNIQUE") || message.includes("duplicate key")) {
        throw new AppError(
          "VALIDATION_ERROR",
          `Code "${code}" already exists.`,
        );
      }
      throw error;
    }
  });

export const listAdminCoupons = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(ListCouponsSchema)
  .handler(async ({ data }) => {
    return CouponRepository.list(data.limit);
  });

// ---------------------------------------------------------------------------
// User side: redeem a coupon into the organization's topup credit pool
// ---------------------------------------------------------------------------

export const redeemCoupon = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(RedeemCouponSchema)
  .handler(async ({ data, context }) => {
    const result = await CouponRepository.redeem({
      code: normalizeCouponCode(data.code),
      organizationId: context.organizationId,
      nowIso: new Date().toISOString(),
      redemptionId: crypto.randomUUID(),
    });
    if (!result.ok) {
      const messages: Record<string, string> = {
        not_found: "Coupon code not found.",
        inactive: "This coupon is no longer active.",
        expired: "This coupon has expired.",
        exhausted: "This coupon has run out of redemptions.",
        already_redeemed: "Your workspace has already redeemed this coupon.",
      };
      throw new AppError(
        "VALIDATION_ERROR",
        messages[result.reason] ?? "Coupon could not be redeemed.",
      );
    }

    await addTopupCredits(context.organizationId, result.credits);
    return { ok: true as const, credits: result.credits };
  });
