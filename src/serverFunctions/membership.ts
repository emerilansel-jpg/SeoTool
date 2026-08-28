import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { KeywordProMembershipService } from "@/server/features/keywords/services/KeywordProMembershipService";
import {
  requireAuthenticatedContext,
  requireOrganizationRole,
} from "@/serverFunctions/middleware";

export const getMembershipStatus = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext])
  .handler(({ context }) =>
    KeywordProMembershipService.getStatus(context.organizationId),
  );

export const createMembershipCheckout = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requireOrganizationRole("owner")])
  .validator(z.object({ referralCode: z.string().trim().max(32).optional() }))
  .handler(async ({ data, context }) => {
    if (!(await isHostedServerAuthMode())) {
      throw new AppError(
        "AUTH_CONFIG_MISSING",
        "All Access checkout is only available in hosted mode.",
      );
    }
    const { getRequiredEnvValue } = await import("@/server/lib/runtime-env");
    return KeywordProMembershipService.startCheckout({
      organizationId: context.organizationId,
      userEmail: context.userEmail,
      publicUrl: await getRequiredEnvValue("BETTER_AUTH_URL"),
      referralCode: data.referralCode,
    });
  });

export const verifyMembershipCheckout = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(z.object({ subscriptionId: z.string().trim().min(1).max(128) }))
  .handler(({ data, context }) =>
    KeywordProMembershipService.verifyCheckout(
      data.subscriptionId,
      context.organizationId,
    ),
  );

export const cancelMembership = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requireOrganizationRole("owner")])
  .validator(z.object({ confirmed: z.literal(true) }))
  .handler(({ context }) =>
    KeywordProMembershipService.cancelMembership(context.organizationId),
  );
