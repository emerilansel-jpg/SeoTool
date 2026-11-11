import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { AppError } from "@/server/lib/errors";
import {
  MONTHLY_CREDIT_PACKS,
  type MonthlyPlanTier,
  retainerCreditsForUsd,
} from "@/shared/billing";
import { DODO_PRODUCT_IDS, getDodoClient } from "./dodo-client";
import {
  fulfillDodoLtd,
  fulfillDodoSubscription,
  fulfillDodoTopup,
} from "./dodo-fulfillment";
import { LTD_OFFERS } from "./paypal-checkout-service";

function readMetadata(metadata: unknown): Record<string, string> {
  if (!metadata || typeof metadata !== "object") return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}

export const DodoCheckoutService = {
  /** Create a Dodo Payments checkout session for Lifetime Deal (LTD). */
  async createLtdCheckout(input: {
    planKey: string;
    organizationId: string;
    userEmail?: string;
    publicUrl: string;
  }): Promise<{ sessionId: string; checkoutUrl: string }> {
    const offer = LTD_OFFERS[input.planKey] ?? LTD_OFFERS.krp_founder_10;
    if (!offer) {
      throw new AppError("NOT_FOUND", "This Lifetime Deal is not available.");
    }

    const dodo = await getDodoClient();
    const ltdProducts: Record<string, string> = DODO_PRODUCT_IDS.ltd;
    const productId =
      ltdProducts[input.planKey] ?? DODO_PRODUCT_IDS.ltd.krp_founder_10;

    const returnUrl = `${input.publicUrl}/subscribe?checkout=success&ltd=true&provider=dodo`;

    try {
      const session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        return_url: returnUrl,
        customer: input.userEmail ? { email: input.userEmail } : undefined,
        metadata: {
          organizationId: input.organizationId,
          planKey: input.planKey,
          type: "ltd",
        },
      });

      if (!session.checkout_url) {
        throw new AppError(
          "UPSTREAM_UNAVAILABLE",
          "Dodo Payments did not return a checkout URL.",
        );
      }

      return {
        sessionId: session.session_id,
        checkoutUrl: session.checkout_url,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Dodo LTD Checkout Error]:", message);
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        `Dodo Payments Error: ${message}`,
      );
    }
  },

  /** Create a Dodo Payments checkout session for Monthly Subscription. */
  async createSubscriptionCheckout(input: {
    tier: MonthlyPlanTier;
    organizationId: string;
    userEmail?: string;
    publicUrl: string;
  }): Promise<{ sessionId: string; checkoutUrl: string }> {
    const pack = MONTHLY_CREDIT_PACKS.find((p) => p.tier === input.tier);
    if (!pack) {
      throw new AppError(
        "NOT_FOUND",
        `Invalid monthly plan tier: ${input.tier}`,
      );
    }

    const productId = DODO_PRODUCT_IDS.subscriptions[input.tier];
    if (!productId) {
      throw new AppError(
        "NOT_FOUND",
        `No product configured for tier: ${input.tier}`,
      );
    }

    const dodo = await getDodoClient();
    const returnUrl = `${input.publicUrl}/subscribe?checkout=success&plan=${input.tier}&provider=dodo`;

    try {
      const session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        return_url: returnUrl,
        customer: input.userEmail ? { email: input.userEmail } : undefined,
        metadata: {
          organizationId: input.organizationId,
          tier: input.tier,
          type: "subscription",
        },
      });

      if (!session.checkout_url) {
        throw new AppError(
          "UPSTREAM_UNAVAILABLE",
          "Dodo Payments did not return a checkout URL.",
        );
      }

      return {
        sessionId: session.session_id,
        checkoutUrl: session.checkout_url,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Dodo Subscription Checkout Error]:", message);
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        `Dodo Payments Error: ${message}`,
      );
    }
  },

  /** Create a Dodo Payments checkout session for usage credit top-up. */
  async createTopupCheckout(input: {
    amountUsd: number;
    organizationId: string;
    userEmail?: string;
    publicUrl: string;
  }): Promise<{ sessionId: string; checkoutUrl: string }> {
    const dodo = await getDodoClient();
    const productId = DODO_PRODUCT_IDS.topup;
    const credits = retainerCreditsForUsd(input.amountUsd);
    const amountInCents = Math.round(input.amountUsd * 100);

    const returnUrl = `${input.publicUrl}/billing?topup=success&provider=dodo`;

    try {
      const session = await dodo.checkoutSessions.create({
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
            amount: amountInCents,
          },
        ],
        return_url: returnUrl,
        customer: input.userEmail ? { email: input.userEmail } : undefined,
        metadata: {
          organizationId: input.organizationId,
          type: "topup",
          amountUsd: String(input.amountUsd),
          credits: String(credits),
        },
      });

      if (!session.checkout_url) {
        throw new AppError(
          "UPSTREAM_UNAVAILABLE",
          "Dodo Payments did not return a checkout URL.",
        );
      }

      return {
        sessionId: session.session_id,
        checkoutUrl: session.checkout_url,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Dodo Top-up Checkout Error]:", message);
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        `Dodo Payments Error: ${message}`,
      );
    }
  },

  /** Verify checkout session upon return to app, idempotently with webhooks. */
  async verifyCheckout(input: {
    sessionId?: string;
    organizationId: string;
  }): Promise<{ active: boolean; status?: string }> {
    if (!input.sessionId) {
      const existing = await QuotaRepository.getSubscription(
        input.organizationId,
      );
      return {
        active: existing?.status === "active" && existing.planTier !== "free",
        status: existing?.status,
      };
    }

    const dodo = await getDodoClient();

    try {
      const session = await dodo.checkoutSessions.retrieve(input.sessionId);
      if (!session?.payment_id) {
        return {
          active: false,
          status: session?.payment_status ?? "pending",
        };
      }

      const payment = await dodo.payments.retrieve(session.payment_id);
      if (payment.status !== "succeeded") {
        return {
          active: false,
          status: payment.status ?? session.payment_status ?? "pending",
        };
      }

      const paymentMetadata = readMetadata(payment.metadata);
      if (
        paymentMetadata.organizationId &&
        paymentMetadata.organizationId !== input.organizationId
      ) {
        throw new AppError(
          "FORBIDDEN",
          "Checkout session does not belong to this workspace.",
        );
      }

      const orgId = paymentMetadata.organizationId || input.organizationId;
      const type = paymentMetadata.type;

      if (
        type === "ltd" ||
        (type !== "subscription" && paymentMetadata.planKey)
      ) {
        await fulfillDodoLtd({
          organizationId: orgId,
          planKey: paymentMetadata.planKey || "krp_founder_10",
          paymentId: payment.payment_id,
          eventType: "checkout.verify.ltd",
        });
      } else if (type === "subscription" || paymentMetadata.tier) {
        let cycleAnchor = payment.payment_id;
        let nextBillingDate: string | null = null;
        if (payment.subscription_id) {
          const sub = await dodo.subscriptions.retrieve(
            payment.subscription_id,
          );
          cycleAnchor = sub.previous_billing_date || sub.created_at;
          nextBillingDate = sub.next_billing_date || null;
        }
        await fulfillDodoSubscription({
          organizationId: orgId,
          tier: paymentMetadata.tier || "starter",
          subscriptionId: payment.subscription_id ?? null,
          cycleAnchor,
          nextBillingDate,
          eventType: "checkout.verify.subscription",
        });
      } else if (type === "topup") {
        const credits = Number(paymentMetadata.credits || 0);
        await fulfillDodoTopup({
          organizationId: orgId,
          credits,
          paymentId: payment.payment_id,
          eventType: "checkout.verify.topup",
        });
      } else {
        console.error(
          "[Dodo Verify Checkout] Unrecognized payment metadata:",
          payment.payment_id,
          paymentMetadata,
        );
        return { active: false, status: "unrecognized_payment_type" };
      }

      return { active: true, status: "succeeded" };
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.error("[Dodo Verify Checkout Error]:", err);
      const existing = await QuotaRepository.getSubscription(
        input.organizationId,
      );
      return {
        active: existing?.status === "active" && existing.planTier !== "free",
        status: existing?.status,
      };
    }
  },
};
