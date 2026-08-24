import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { paypal } from "@/server/billing/paypal";
import { PayPalCheckoutService } from "@/server/billing/paypal-checkout-service";

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

    const publicUrl = await import("@/server/lib/runtime-env").then((m) =>
      m.getRequiredEnvValue("BETTER_AUTH_URL"),
    );
    return PayPalCheckoutService.startSubscription({
      tier: data.tier,
      organizationId: context.organizationId,
      userEmail: context.userEmail,
      publicUrl,
    });
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

    return PayPalCheckoutService.createTopup({
      amountUsd: data.amountUsd,
      organizationId: context.organizationId,
      publicUrl,
    });
  });

/** Capture an approved top-up order after PayPal redirects the buyer back. */
export const capturePaypalTopup = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(
    z.object({
      orderId: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .regex(/^[A-Za-z0-9-]+$/),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!(await isHostedServerAuthMode())) {
      throw new AppError(
        "AUTH_CONFIG_MISSING",
        "Credit top-up is only available in hosted mode",
      );
    }
    return PayPalCheckoutService.captureTopup({
      orderId: data.orderId,
      organizationId: context.organizationId,
    });
  });
