import { createServerFn } from "@tanstack/react-start";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";
import {
  adminOrganizationIdSchema,
  adjustCreditsSchema,
  listSubscriptionsSchema,
  setPlanTierSchema,
} from "@/types/schemas/admin";
import { AdminBillingService } from "@/server/features/admin/services/AdminBillingService";
import { CancellationFeedbackRepository } from "@/server/features/billing/repositories/CancellationFeedbackRepository";

export const listAdminSubscriptions = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(listSubscriptionsSchema)
  .handler(async ({ data }) => {
    return AdminBillingService.listSubscriptions(data);
  });

export const listAdminWebhookEvents = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(async () => {
    return AdminBillingService.listWebhookEvents();
  });

export const listAdminCancellationFeedback = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(async () => {
    return CancellationFeedbackRepository.listRecent(20);
  });

export const setAdminPlanTier = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(setPlanTierSchema)
  .handler(async ({ data }) => {
    await AdminBillingService.setPlanTier(data);
    return { ok: true };
  });

export const adjustAdminCredits = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(adjustCreditsSchema)
  .handler(async ({ data }) => {
    await AdminBillingService.adjustCredits(data);
    return { ok: true };
  });

export const resyncAdminOrg = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(adminOrganizationIdSchema)
  .handler(async ({ data }) => {
    return AdminBillingService.resyncOrg(data);
  });
