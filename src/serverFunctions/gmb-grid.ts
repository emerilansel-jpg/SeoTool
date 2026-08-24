import { createServerFn } from "@tanstack/react-start";
import { AppError } from "@/server/lib/errors";
import {
  CreateGmbGridSchema,
  GetGmbGridConfigsSchema,
  GetGmbGridRunSchema,
  SearchGmbProfilesSchema,
} from "@/server/features/gmb-grid/gmb-grid.schema";
import { GmbGridService } from "@/server/features/gmb-grid/services/GmbGridService";
import {
  requireProjectContext,
  requireProjectRole,
} from "@/serverFunctions/middleware";

function assertRequestedProject(requested: string, authorized: string) {
  if (requested !== authorized) {
    throw new AppError("FORBIDDEN", "Project access denied");
  }
}

export const getGmbGridConfigs = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(GetGmbGridConfigsSchema)
  .handler(async ({ data, context }) => {
    assertRequestedProject(data.projectId, context.projectId);
    return GmbGridService.listConfigs(data.projectId);
  });

export const getGmbGridRun = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(GetGmbGridRunSchema)
  .handler(async ({ data, context }) => {
    assertRequestedProject(data.projectId, context.projectId);
    return GmbGridService.getRun(data.projectId, data.runId);
  });

export const searchGmbProfiles = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(SearchGmbProfilesSchema)
  .handler(async ({ data, context }) => {
    assertRequestedProject(data.projectId, context.projectId);
    return GmbGridService.searchProfiles({
      ...data,
      billingCustomer: {
        organizationId: context.organizationId,
        userId: context.userId,
        userEmail: context.userEmail,
        projectId: data.projectId,
      },
    });
  });

export const createGmbGridRun = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(CreateGmbGridSchema)
  .handler(async ({ data, context }) => {
    assertRequestedProject(data.projectId, context.projectId);
    return GmbGridService.startScan({
      data,
      billingCustomer: {
        organizationId: context.organizationId,
        userId: context.userId,
        userEmail: context.userEmail,
        projectId: data.projectId,
      },
    });
  });
