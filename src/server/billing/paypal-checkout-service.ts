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
    const planId = await getEffectivePaypalPlanId(input.tier);
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
};
