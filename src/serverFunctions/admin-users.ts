import { createServerFn } from "@tanstack/react-start";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";
import {
  adminUserIdSchema,
  banUserSchema,
  searchUsersSchema,
} from "@/types/schemas/admin";
import { AdminUserService } from "@/server/features/admin/services/AdminUserService";

export const searchUsers = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(searchUsersSchema)
  .handler(async ({ data }) => {
    return AdminUserService.searchUsers(data);
  });

export const getAdminUserDetail = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(adminUserIdSchema)
  .handler(async ({ data }) => {
    return AdminUserService.getUserDetail(data.userId);
  });

export const banUser = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(banUserSchema)
  .handler(async ({ data, context }) => {
    await AdminUserService.banUser(data, context.userId);
    return { ok: true };
  });

export const unbanUser = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(adminUserIdSchema)
  .handler(async ({ data }) => {
    await AdminUserService.unbanUser(data);
    return { ok: true };
  });

export const forceLogout = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(adminUserIdSchema)
  .handler(async ({ data, context }) => {
    await AdminUserService.forceLogout(data, context.userId);
    return { ok: true };
  });
