import { AppError } from "@/server/lib/errors";
import { getDodoClient, DODO_PRODUCT_IDS } from "./dodo-client";
import { LTD_OFFERS } from "./paypal-checkout-service";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { addTopupCredits } from "./credits";
import {
  MONTHLY_CREDIT_PACKS,
  type MonthlyPlanTier,
  retainerCreditsForUsd,
} from "@/shared/billing";

export const DodoCheckoutService = {
  /**
   * Create a Dodo Payments checkout session for Lifetime Deal (LTD)
   */
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
    const productId =
      DODO_PRODUCT_IDS.ltd[input.planKey as keyof typeof DODO_PRODUCT_IDS.ltd] ??
      DODO_PRODUCT_IDS.ltd.krp_founder_10;

    const returnUrl = `${input.publicUrl}/subscribe?checkout=success&ltd=true&provider=dodo`;

    try {
      const session = await dodo.checkoutSessions.create({
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
        return_url: returnUrl,
        customer: input.userEmail
          ? {
              email: input.userEmail,
            }
          : undefined,
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
      throw new AppError("UPSTREAM_UNAVAILABLE", `Dodo Payments Error: ${message}`);
    }
  },

  /**
   * Create a Dodo Payments checkout session for Monthly Subscription
   */
  async createSubscriptionCheckout(input: {
    tier: MonthlyPlanTier;
    organizationId: string;
    userEmail?: string;
    publicUrl: string;
  }): Promise<{ sessionId: string; checkoutUrl: string }> {
    const pack = MONTHLY_CREDIT_PACKS.find((p) => p.tier === input.tier);
    if (!pack) {
      throw new AppError("NOT_FOUND", `Invalid monthly plan tier: ${input.tier}`);
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
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
        return_url: returnUrl,
        customer: input.userEmail
          ? {
              email: input.userEmail,
            }
          : undefined,
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
      throw new AppError("UPSTREAM_UNAVAILABLE", `Dodo Payments Error: ${message}`);
    }
  },

  /**
   * Create a Dodo Payments checkout session for usage credit top-up
   */
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
        customer: input.userEmail
          ? {
              email: input.userEmail,
            }
          : undefined,
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
      throw new AppError("UPSTREAM_UNAVAILABLE", `Dodo Payments Error: ${message}`);
    }
  },

  /**
   * Verify checkout session upon return to app
   */
  async verifyCheckout(input: {
    sessionId?: string;
    organizationId: string;
  }): Promise<{ active: boolean; status?: string }> {
    const dodo = await getDodoClient();

    if (!input.sessionId) {
      // Check if user already has an active subscription in database
      const existing = await QuotaRepository.getSubscription(input.organizationId);
      return {
        active: existing?.status === "active",
        status: existing?.status,
      };
    }

    try {
      const session = await dodo.checkoutSessions.retrieve(input.sessionId);
      if (!session) {
        return { active: false };
      }

      // Check payment status or retrieve underlying payment
      let isSuccess = session.payment_status === "succeeded";
      let paymentMetadata: Record<string, string> = {};

      if (session.payment_id) {
        const payment = await dodo.payments.retrieve(session.payment_id);
        if (payment.status === "succeeded") {
          isSuccess = true;
          paymentMetadata = (payment.metadata as Record<string, string>) || {};
        }
      }

      if (isSuccess) {
        const orgId = paymentMetadata.organizationId || input.organizationId;
        const type = paymentMetadata.type;

        if (type === "ltd" || paymentMetadata.planKey) {
          const planKey = paymentMetadata.planKey || "krp_founder_10";
          const offer = LTD_OFFERS[planKey] ?? LTD_OFFERS.krp_founder_10;
          await QuotaRepository.upsertSubscription({
            organizationId: orgId,
            planTier: offer.tier,
            status: "active",
            currentPeriodEnd: "2099-12-31T23:59:59.000Z",
          });
          if (offer.bonusCredits > 0) {
            await addTopupCredits(orgId, offer.bonusCredits);
          }
        } else if (type === "subscription" || paymentMetadata.tier) {
          const tier = (paymentMetadata.tier || "starter") as MonthlyPlanTier;
          const pack = MONTHLY_CREDIT_PACKS.find((p) => p.tier === tier);
          await QuotaRepository.upsertSubscription({
            organizationId: orgId,
            planTier: tier,
            status: "active",
            currentPeriodEnd: new Date(Date.now() + 31 * 86400 * 1000).toISOString(),
          });
          if (pack && pack.credits > 0) {
            await addTopupCredits(orgId, pack.credits);
          }
        } else if (type === "topup") {
          const credits = Number(paymentMetadata.credits || 0);
          if (credits > 0) {
            await addTopupCredits(orgId, credits);
          }
        } else {
          // Default fallback: activate Founder Pass if session completed successfully
          await QuotaRepository.upsertSubscription({
            organizationId: orgId,
            planTier: "byok",
            status: "active",
            currentPeriodEnd: "2099-12-31T23:59:59.000Z",
          });
          await addTopupCredits(orgId, 5000);
        }

        return { active: true, status: "succeeded" };
      }

      return {
        active: false,
        status: session.payment_status || "pending",
      };
    } catch (err) {
      console.error("[Dodo Verify Checkout Error]:", err);
      // Fallback: check database status
      const existing = await QuotaRepository.getSubscription(input.organizationId);
      return {
        active: existing?.status === "active",
        status: existing?.status,
      };
    }
  },
};
