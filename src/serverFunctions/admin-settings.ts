import { createServerFn } from "@tanstack/react-start";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";
import {
  removeAdminSettingSchema,
  saveAdminSettingSchema,
} from "@/types/schemas/admin";
import { AdminSettingsService } from "@/server/features/admin/services/AdminSettingsService";

export const getAdminSettings = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(async () => {
    return AdminSettingsService.getStatuses();
  });

export const saveAdminSetting = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(saveAdminSettingSchema)
  .handler(async ({ data, context }) => {
    await AdminSettingsService.saveSetting(data, context.userId);
    return { ok: true };
  });

export const removeAdminSetting = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(removeAdminSettingSchema)
  .handler(async ({ data }) => {
    await AdminSettingsService.removeOverride(data.envKey);
    return { ok: true };
  });
