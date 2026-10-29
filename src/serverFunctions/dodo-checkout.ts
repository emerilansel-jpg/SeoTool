import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { DodoCheckoutService } from "@/server/billing/dodo-checkout-service";

export const createDodoLtdCheckout = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(z.object({ planKey: z.string().trim().min(1).max(64) }))
  .handler(async ({ data, context }) => {
    const publicUrl = await import("@/server/lib/runtime-env").then((m) =>
      m.getRequiredEnvValue("BETTER_AUTH_URL"),
    );
    return DodoCheckoutService.createLtdCheckout({
      planKey: data.planKey,
      organizationId: context.organizationId,
      userEmail: context.userEmail,
      publicUrl,
    });
  });

export const createDodoSubscription = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(
    z.object({
      tier: z.enum(["starter", "lite", "standard", "pro", "agency"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const publicUrl = await import("@/server/lib/runtime-env").then((m) =>
      m.getRequiredEnvValue("BETTER_AUTH_URL"),
    );
    return DodoCheckoutService.createSubscriptionCheckout({
      tier: data.tier,
      organizationId: context.organizationId,
      userEmail: context.userEmail,
      publicUrl,
    });
  });

export const createDodoTopup = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(z.object({ amountUsd: z.number().min(1).max(1000) }))
  .handler(async ({ data, context }) => {
    const publicUrl = await import("@/server/lib/runtime-env").then((m) =>
      m.getRequiredEnvValue("BETTER_AUTH_URL"),
    );
    return DodoCheckoutService.createTopupCheckout({
      amountUsd: data.amountUsd,
      organizationId: context.organizationId,
      userEmail: context.userEmail,
      publicUrl,
    });
  });

export const verifyDodoCheckout = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(z.object({ sessionId: z.string().optional() }))
  .handler(async ({ data, context }) => {
    return DodoCheckoutService.verifyCheckout({
      sessionId: data.sessionId,
      organizationId: context.organizationId,
    });
  });
