import { createServerFn } from "@tanstack/react-start";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";
import {
  retryAdminPlanSyncSchema,
  saveAdminPlanConfigSchema,
} from "@/types/schemas/admin";
import { AdminPricingService } from "@/server/features/admin/services/AdminPricingService";

export const getAdminPlanConfigs = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(async () => {
    return AdminPricingService.getConfigs();
  });

export const saveAdminPlanConfig = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(saveAdminPlanConfigSchema)
  .handler(async ({ data, context }) => {
    return AdminPricingService.saveTierConfig(data, context.userId);
  });

export const retryAdminPlanSync = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(retryAdminPlanSyncSchema)
  .handler(async ({ data, context }) => {
    return AdminPricingService.retrySync(data, context.userId);
  });
