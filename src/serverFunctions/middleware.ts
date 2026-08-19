import { createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import { errorHandlingMiddleware } from "@/middleware/errorHandling";
import { paidPlanGateMiddleware } from "@/middleware/paid-plan-gate";
import type { EnsuredUserContext } from "@/middleware/ensure-user/types";
import { ensureUserMiddleware } from "@/middleware/ensureUser";
import { type Role, roleAtLeast } from "@/shared/rbac";
import { getMemberRole } from "@/server/features/auth/MemberRepository";

const ensuredUserContextSchema: z.ZodType<EnsuredUserContext> = z.object({
  userId: z.string(),
  userEmail: z.string(),
  emailVerified: z.boolean(),
  organizationId: z.string(),
  project: z.any().optional(),
});

function getAuthenticatedContext(context: unknown): EnsuredUserContext {
  const result = ensuredUserContextSchema.safeParse(context);
  if (!result.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Authenticated server function context missing",
    );
  }
  return result.data;
}

export const globalServerFunctionMiddleware = [
  errorHandlingMiddleware,
  ensureUserMiddleware,
  paidPlanGateMiddleware,
] as const;

export const requireAuthenticatedContext = createMiddleware({
  type: "function",
}).server(async ({ next, context }) => {
  const authenticatedContext = getAuthenticatedContext(context);

  return next({
    context: authenticatedContext,
  });
});

export const requireProjectContext = createMiddleware({
  type: "function",
}).server(async ({ next, context }) => {
  const authenticatedContext = getAuthenticatedContext(context);

  if (!authenticatedContext.project) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Project context missing in authenticated server function",
    );
  }

  return next({
    context: {
      ...authenticatedContext,
      project: authenticatedContext.project,
      projectId: authenticatedContext.project.id,
    },
  });
});

/**
 * Narrow a server function to members whose org role is at least `minRole`.
 * The role is looked up on demand (not carried on the shared request context,
 * which would widen TanStack middleware inference for every function). Stacks
 * on `requireProjectContext`:
 * `.middleware([requireProjectContext, requireProjectRole("manager")])`.
 */
export function requireProjectRole(minRole: Role) {
  return createMiddleware({ type: "function" }).server(
    async ({ next, context }) => {
      const authenticatedContext = getAuthenticatedContext(context);
      const role =
        (await getMemberRole(
          authenticatedContext.userId,
          authenticatedContext.organizationId,
        )) ?? "viewer";
      if (!roleAtLeast(role, minRole)) {
        throw new AppError("FORBIDDEN", "Your role doesn't allow this action.");
      }
      return next({ context: authenticatedContext });
    },
  );
}

/**
 * Gate a server function to platform admins only. Reads
 * `PLATFORM_ADMIN_USER_IDS` (comma-separated user IDs from env). Stacks on
 * `requireAuthenticatedContext`:
 * `.middleware([requireAuthenticatedContext, requirePlatformAdmin])`.
 */
export const requirePlatformAdmin = createMiddleware({
  type: "function",
}).server(async ({ next, context }) => {
  const authenticatedContext = getAuthenticatedContext(context);

  const adminIdsRaw = await getOptionalEnvValue("PLATFORM_ADMIN_USER_IDS");
  const adminIds = adminIdsRaw
    ? adminIdsRaw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  if (
    adminIds.length === 0 ||
    !adminIds.includes(authenticatedContext.userId)
  ) {
    throw new AppError("FORBIDDEN", "Platform admin access required.");
  }

  return next({ context: authenticatedContext });
});
