import { AppError } from "@/server/lib/errors";
import { getEffectivePaypalPlanId } from "@/server/billing/plan-config";
import {
  paypal,
  type PayPalOrder,
  type PayPalSubscription,
} from "@/server/billing/paypal";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import type { PlanTier } from "@/shared/plans";
import { createTopupMarker, parseTopupMarker } from "./paypal-topup";
import { createLtdMarker, parseLtdMarker } from "./paypal-ltd";

export const LTD_OFFERS: Record<
  string,
  {
    priceUsd: number;
    title: string;
    tier: PlanTier;
    bonusCredits: number;
    description: string;
  }
> = {
  krp_founder_10: {
    priceUsd: 29,
    title: "Founder 10 (LTD)",
    tier: "byok",
    bonusCredits: 5000,
    description: "SeoTool.im Early Believer Lifetime Deal (Founder 10 - BYOK)",
  },
  krp_early_20: {
    priceUsd: 39,
    title: "Early 20 (LTD)",
    tier: "byok",
    bonusCredits: 5000,
    description: "SeoTool.im Early Believer Lifetime Deal (Early 20 - BYOK)",
  },
  krp_growth_50: {
    priceUsd: 49,
    title: "Growth 50 (LTD)",
    tier: "byok",
    bonusCredits: 5000,
    description: "SeoTool.im Early Believer Lifetime Deal (Growth 50 - BYOK)",
  },
  krp_public: {
    priceUsd: 59,
    title: "Public (LTD)",
    tier: "byok",
    bonusCredits: 5000,
    description: "SeoTool.im Early Believer Lifetime Deal (Public - BYOK)",
  },
  appsumo_tier_1: {
    priceUsd: 37,
    title: "AppSumo Tier 1",
    tier: "byok",
    bonusCredits: 1500,
    description: "SeoTool.im AppSumo Lifetime Deal - Tier 1",
  },
  appsumo_tier_2: {
    priceUsd: 79,
    title: "AppSumo Tier 2",
    tier: "byok",
    bonusCredits: 5000,
    description: "SeoTool.im AppSumo Lifetime Deal - Tier 2",
  },
  appsumo_tier_3: {
    priceUsd: 149,
    title: "AppSumo Tier 3",
    tier: "standard",
    bonusCredits: 10000,
    description: "SeoTool.im AppSumo Lifetime Deal - Tier 3 (Sweet Spot)",
  },
  appsumo_tier_4: {
    priceUsd: 249,
    title: "AppSumo Tier 4",
    tier: "pro",
    bonusCredits: 25000,
    description: "SeoTool.im AppSumo Lifetime Deal - Tier 4",
  },
  appsumo_tier_5: {
    priceUsd: 399,
    title: "AppSumo Tier 5",
    tier: "agency",
    bonusCredits: 50000,
    description: "SeoTool.im AppSumo Lifetime Deal - Tier 5",
  },
};

type PaidTier = Exclude<PlanTier, "free">;

const REVISABLE_SUBSCRIPTION_STATUSES = new Set<PayPalSubscription["status"]>([
  "ACTIVE",
  "SUSPENDED",
]);

const PENDING_SUBSCRIPTION_STATUSES = new Set<PayPalSubscription["status"]>([
  "APPROVAL_PENDING",
  "APPROVED",
]);

function findApprovalUrl(links: Array<{ rel: string; href: string }>): string {
  const link = links.find(
    (candidate) =>
      candidate.rel === "approve" || candidate.rel === "payer-action",
  );
  if (!link) {
    throw new AppError(
      "INTERNAL_ERROR",
      "PayPal checkout was created without an approval URL.",
    );
  }
  return link.href;
}

function checkoutContext(publicUrl: string) {
  return {
    brand_name: "SeoTool.im",
    locale: "en-US",
    shipping_preference: "NO_SHIPPING",
    user_action: "SUBSCRIBE_NOW",
    return_url: `${publicUrl}/subscribe?checkout=success`,
    cancel_url: `${publicUrl}/subscribe?checkout=cancelled`,
  };
}

function getTopupOrderDetails(order: PayPalOrder): {
  organizationId: string;
  amountUsd: number;
} | null {
  const unit = order.purchase_units?.[0];
  if (!unit) return null;
  const organizationId =
    parseTopupMarker(unit.custom_id) ??
    parseTopupMarker(unit.reference_id) ??
    null;
  const amount = unit.amount;
  const amountUsd = Number.parseFloat(amount?.value ?? "");
  if (
    !organizationId ||
    amount?.currency_code !== "USD" ||
    !Number.isFinite(amountUsd) ||
    amountUsd < 1 ||
    amountUsd > 1000
  ) {
    return null;
  }
  return { organizationId, amountUsd };
}

export const PayPalCheckoutService = {
  async startSubscription(input: {
    tier: PaidTier;
    organizationId: string;
    userEmail: string;
    publicUrl: string;
  }): Promise<{
    subscriptionId: string;
    approveUrl: string;
    operation: "create" | "revise";
  }> {
    let planId = await getEffectivePaypalPlanId(input.tier);
    if (!planId && input.tier === "starter") {
      try {
        const product = await paypal.products.create({
          name: "SeoTool.im Starter Retainer",
          description: "Permanent $1 credit retainer with rollover",
        });
        const plan = await paypal.billingPlans.create({
          product_id: product.id,
          name: "Starter Credit Retainer ($1/mo)",
          description: "1,000 permanent credits per month that never expire",
          monthly_price_cents: 100,
        });
        planId = plan.id;
        const { PlanConfigRepository } = await import(
          "@/server/features/admin/repositories/PlanConfigRepository"
        );
        await PlanConfigRepository.upsert({
          tier: "starter",
          priceUsdCents: 100,
          monthlyCredits: 1000,
          paypalPlanId: plan.id,
          syncStatus: "synced",
          active: true,
          updatedByUserId: "system-auto",
        });
      } catch (autoErr) {
        console.error("Auto provision starter plan failed:", autoErr);
      }
    }

    if (!planId) {
      throw new AppError(
        "VALIDATION_ERROR",
        `No PayPal plan configured for tier: ${input.tier}`,
      );
    }

    const existing = await QuotaRepository.getSubscription(
      input.organizationId,
    );

    try {
      if (existing?.paypalSubscriptionId) {
        const current = await paypal.subscriptions.get(
          existing.paypalSubscriptionId,
        );
        if (current.plan_id === planId) {
          throw new AppError(
            "VALIDATION_ERROR",
            "This organization is already subscribed to that plan.",
          );
        }
        if (PENDING_SUBSCRIPTION_STATUSES.has(current.status)) {
          throw new AppError(
            "VALIDATION_ERROR",
            "An existing PayPal subscription checkout is still pending.",
          );
        }
        if (REVISABLE_SUBSCRIPTION_STATUSES.has(current.status)) {
          const revised = await paypal.subscriptions.revise(current.id, {
            plan_id: planId,
            application_context: checkoutContext(input.publicUrl),
          });
          return {
            subscriptionId: current.id,
            approveUrl: findApprovalUrl(revised.links ?? []),
            operation: "revise",
          };
        }
      }

      const created = await paypal.subscriptions.create({
        plan_id: planId,
        custom_id: input.organizationId,
        subscriber: { email_address: input.userEmail },
        application_context: checkoutContext(input.publicUrl),
      });
      return {
        subscriptionId: created.id,
        approveUrl: findApprovalUrl(created.links ?? []),
        operation: "create",
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      console.error("[PayPal Subscription Checkout Error]:", message);
      throw new AppError("UPSTREAM_UNAVAILABLE", `PayPal Error: ${message}`);
    }
  },

  async createTopup(input: {
    amountUsd: number;
    organizationId: string;
    publicUrl: string;
  }): Promise<{ orderId: string; approveUrl: string }> {
    const marker = createTopupMarker(input.organizationId);
    try {
      const order = await paypal.orders.create({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: marker,
            description: `SeoTool.im Credit Top-up ($${input.amountUsd})`,
            custom_id: marker,
            amount: {
              currency_code: "USD",
              value: input.amountUsd.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "SeoTool.im",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${input.publicUrl}/billing?topup=success`,
          cancel_url: `${input.publicUrl}/billing?topup=cancelled`,
        },
      });
      return {
        orderId: order.id,
        approveUrl: findApprovalUrl(order.links ?? []),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      console.error("[PayPal Top-up Creation Error]:", message);
      throw new AppError("UPSTREAM_UNAVAILABLE", `PayPal Error: ${message}`);
    }
  },

  async captureTopup(input: {
    orderId: string;
    organizationId: string;
  }): Promise<{ completed: boolean; orderId: string }> {
    const order = await paypal.orders.get(input.orderId);
    const details = getTopupOrderDetails(order);
    if (!details || details.organizationId !== input.organizationId) {
      throw new AppError(
        "FORBIDDEN",
        "This PayPal order does not belong to the active organization.",
      );
    }

    if (order.status === "COMPLETED") {
      return { completed: true, orderId: order.id };
    }
    if (order.status !== "APPROVED") {
      throw new AppError(
        "VALIDATION_ERROR",
        `PayPal order is not ready to capture (status: ${order.status}).`,
      );
    }

    try {
      const captured = await paypal.orders.capture(order.id);
      return { completed: captured.status === "COMPLETED", orderId: order.id };
    } catch (error) {
      // A double-submit can race after both requests observe APPROVED. Re-read
      // PayPal before surfacing an error; a completed order is a safe success.
      const latest = await paypal.orders.get(order.id);
      if (latest.status === "COMPLETED") {
        return { completed: true, orderId: order.id };
      }
      const message = error instanceof Error ? error.message : String(error);
      console.error("[PayPal Top-up Capture Error]:", message);
      throw new AppError("UPSTREAM_UNAVAILABLE", `PayPal Error: ${message}`);
    }
  },

  async createLtdOrder(input: {
    planKey: string;
    organizationId: string;
    publicUrl: string;
  }): Promise<{ orderId: string; approveUrl: string }> {
    const offer = LTD_OFFERS[input.planKey] ?? LTD_OFFERS.krp_founder_10;
    const marker = createLtdMarker(input.organizationId, input.planKey);
    try {
      const order = await paypal.orders.create({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: marker,
            description: offer.description,
            custom_id: marker,
            amount: {
              currency_code: "USD",
              value: offer.priceUsd.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "SeoTool.im",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${input.publicUrl}/subscribe?checkout=success&orderId={id}&ltd=true`,
          cancel_url: `${input.publicUrl}/subscribe?checkout=cancelled`,
        },
      });
      return {
        orderId: order.id,
        approveUrl: findApprovalUrl(order.links ?? []),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      console.error("[PayPal LTD Order Creation Error]:", message);
      throw new AppError("UPSTREAM_UNAVAILABLE", `PayPal Error: ${message}`);
    }
  },

  async captureLtdOrder(input: {
    orderId: string;
    organizationId: string;
  }): Promise<{ completed: boolean; orderId: string }> {
    const order = await paypal.orders.get(input.orderId);
    const unit = order.purchase_units?.[0];
    const markerStr = unit?.custom_id ?? unit?.reference_id;
    const ltd = parseLtdMarker(markerStr);
    if (!ltd || ltd.organizationId !== input.organizationId) {
      throw new AppError(
        "FORBIDDEN",
        "This PayPal order does not belong to the active organization.",
      );
    }

    if (order.status !== "COMPLETED") {
      if (order.status !== "APPROVED") {
        throw new AppError(
          "VALIDATION_ERROR",
          `PayPal order is not ready to capture (status: ${order.status}).`,
        );
      }
      try {
        await paypal.orders.capture(order.id);
      } catch (err) {
        const latest = await paypal.orders.get(order.id);
        if (latest.status !== "COMPLETED") {
          throw err;
        }
      }
    }

    const offer = LTD_OFFERS[ltd.planKey] ?? LTD_OFFERS.krp_founder_10;
    await QuotaRepository.upsertSubscription({
      organizationId: input.organizationId,
      planTier: offer.tier,
      status: "active",
      currentPeriodEnd: "2099-12-31T23:59:59.000Z",
    });

    if (offer.bonusCredits > 0) {
      const { addTopupCredits } = await import("./credits");
      await addTopupCredits(input.organizationId, offer.bonusCredits);
    }

    return { completed: true, orderId: order.id };
  },
};
