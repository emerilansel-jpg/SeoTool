import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { paypal } from "@/server/billing/paypal";
import { getEffectivePaypalPlanId } from "@/server/billing/plan-config";

const createSubscriptionSchema = z.object({
  tier: z.enum(["lite", "pro", "agency"]),
});

/**
 * Create a PayPal subscription and return the approval URL for redirect.
 * The user will be redirected to PayPal to approve the subscription.
 * After approval, PayPal fires BILLING.SUBSCRIPTION.CREATED webhook.
 */
export const createPaypalSubscription = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(createSubscriptionSchema)
  .handler(async ({ data, context }) => {
    if (!(await isHostedServerAuthMode())) {
      throw new AppError(
        "AUTH_CONFIG_MISSING",
        "PayPal checkout is only available in hosted mode",
      );
    }

    const { tier } = data;
    const planId = await getEffectivePaypalPlanId(tier);
    if (!planId) {
      throw new AppError(
        "VALIDATION_ERROR",
        `No PayPal plan configured for tier: ${tier}`,
      );
    }

    const publicUrl = await import("@/server/lib/runtime-env").then((m) =>
      m.getRequiredEnvValue("BETTER_AUTH_URL"),
    );

    // Create the PayPal subscription
    let subscription: {
      id: string;
      links: Array<{ rel: string; href: string; method: string }>;
    };

    try {
      subscription = await paypalRequest<{
        id: string;
        links: Array<{ rel: string; href: string; method: string }>;
      }>("POST", "/v1/billing/subscriptions", {
        plan_id: planId,
        custom_id: context.organizationId,
        subscriber: {
          email_address: context.userEmail,
        },
        application_context: {
          brand_name: "SeoTool.im",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${publicUrl}/subscribe?checkout=success`,
          cancel_url: `${publicUrl}/subscribe?checkout=cancelled`,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PayPal Subscription Creation Error]:", msg);
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        `PayPal Error: ${msg}`,
      );
    }

    // Find the approval URL
    const approveLink = subscription.links?.find((l) => l.rel === "approve");
    if (!approveLink) {
      throw new AppError(
        "INTERNAL_ERROR",
        "PayPal subscription created but no approval URL returned",
      );
    }

    return {
      subscriptionId: subscription.id,
      approveUrl: approveLink.href,
    };
  });

/**
 * Verify a PayPal subscription after return from checkout.
 * Called when the user returns to the app with ?checkout=success.
 */
export const verifyPaypalSubscription = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(z.object({ subscriptionId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!(await isHostedServerAuthMode())) {
      return { active: false };
    }

    try {
      const sub = await paypal.subscriptions.get(data.subscriptionId);

      // Verify the subscription belongs to this org
      if (sub.custom_id !== context.organizationId) {
        return { active: false };
      }

      return {
        active: sub.status === "ACTIVE" || sub.status === "APPROVED",
        status: sub.status,
      };
    } catch {
      return { active: false };
    }
  });

/** Create a PayPal one-time payment for credit top-up. */
export const createPaypalTopup = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(z.object({ amountUsd: z.number().min(1).max(1000) }))
  .handler(async ({ data, context }) => {
    if (!(await isHostedServerAuthMode())) {
      throw new AppError(
        "AUTH_CONFIG_MISSING",
        "Credit top-up is only available in hosted mode",
      );
    }

    const publicUrl = await import("@/server/lib/runtime-env").then((m) =>
      m.getRequiredEnvValue("BETTER_AUTH_URL"),
    );

    // Create a PayPal order for one-time payment
    const order = await paypalRequest<{
      id: string;
      links: Array<{ rel: string; href: string; method: string }>;
    }>("POST", "/v2/checkout/orders", {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `topup-${context.organizationId}-${Date.now()}`,
          description: `SeoTool.im Credit Top-up ($${data.amountUsd})`,
          custom_id: context.organizationId,
          amount: {
            currency_code: "USD",
            value: data.amountUsd.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "SeoTool.im",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${publicUrl}/billing?topup=success`,
        cancel_url: `${publicUrl}/billing`,
      },
    });

    const approveLink = order.links?.find((l) => l.rel === "approve");
    if (!approveLink) {
      throw new AppError(
        "INTERNAL_ERROR",
        "PayPal order created but no approval URL returned",
      );
    }

    return {
      orderId: order.id,
      approveUrl: approveLink.href,
    };
  });

// Reuse the paypal request helper from the billing module
async function paypalRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const { paypalRequest: req } = await import("@/server/billing/paypal");
  return req<T>(method, path, body);
}
