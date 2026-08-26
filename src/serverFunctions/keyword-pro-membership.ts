import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { KeywordProMembershipService } from "@/server/features/keywords/services/KeywordProMembershipService";
import {
  requireProjectContext,
  requireProjectRole,
} from "@/serverFunctions/middleware";

const projectSchema = z.object({ projectId: z.string().min(1) });

export const getKeywordProMembershipStatus = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(projectSchema)
  .handler(async ({ context }) =>
    KeywordProMembershipService.getStatus(context.organizationId),
  );

export const createKeywordProCheckout = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(
    projectSchema.extend({
      referralCode: z.string().trim().max(32).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!(await isHostedServerAuthMode())) {
      throw new AppError(
        "AUTH_CONFIG_MISSING",
        "Keyword Research Pro checkout is only available in hosted mode.",
      );
    }
    const { getRequiredEnvValue } = await import("@/server/lib/runtime-env");
    return KeywordProMembershipService.startCheckout({
      organizationId: context.organizationId,
      userEmail: context.userEmail,
      projectId: context.projectId,
      publicUrl: await getRequiredEnvValue("BETTER_AUTH_URL"),
      referralCode: data.referralCode,
    });
  });

export const verifyKeywordProCheckout = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(
    projectSchema.extend({
      subscriptionId: z.string().trim().min(1).max(128),
    }),
  )
  .handler(async ({ data, context }) =>
    KeywordProMembershipService.verifyCheckout(
      data.subscriptionId,
      context.organizationId,
    ),
  );

export const cancelKeywordProMembership = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("manager")])
  .validator(projectSchema)
  .handler(async ({ context }) =>
    KeywordProMembershipService.cancelMembership(context.organizationId),
  );
