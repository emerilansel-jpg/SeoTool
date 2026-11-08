import { createServerFn } from "@tanstack/react-start";
import { AppError } from "@/server/lib/errors";
import {
  CreateGmbGridSchema,
  DeleteGmbGridConfigSchema,
  GetGmbGridConfigsSchema,
  GetGmbGridReportSchema,
  GetGmbGridRunSchema,
  ResolveGoogleMapsUrlSchema,
  RetryGmbGridPinsSchema,
  SearchGmbProfilesSchema,
} from "@/server/features/gmb-grid/gmb-grid.schema";
import { GmbGridService } from "@/server/features/gmb-grid/services/GmbGridService";
import {
  isShortGoogleMapsUrl,
  parseGoogleMapsUrl,
} from "@/shared/google-maps-url";
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

export const retryGmbGridFailedPins = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(RetryGmbGridPinsSchema)
  .handler(async ({ data, context }) => {
    assertRequestedProject(data.projectId, context.projectId);
    return GmbGridService.retryFailedPins({
      projectId: data.projectId,
      runId: data.runId,
      billingCustomer: {
        organizationId: context.organizationId,
        userId: context.userId,
        userEmail: context.userEmail,
        projectId: data.projectId,
      },
    });
  });

export const deleteGmbGridConfig = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(DeleteGmbGridConfigSchema)
  .handler(async ({ data, context }) => {
    assertRequestedProject(data.projectId, context.projectId);
    return GmbGridService.deactivateConfig({
      projectId: data.projectId,
      configId: data.configId,
    });
  });

export const getGmbGridReport = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(GetGmbGridReportSchema)
  .handler(async ({ data, context }) => {
    assertRequestedProject(data.projectId, context.projectId);
    return GmbGridService.getReportHistory(data.projectId, data.days);
  });

export const resolveGoogleMapsUrl = createServerFn({ method: "POST" })
  .validator(ResolveGoogleMapsUrlSchema)
  .handler(async ({ data }) => {
    let targetUrl = data.url;
    if (isShortGoogleMapsUrl(targetUrl)) {
      try {
        const response = await fetch(targetUrl, {
          method: "GET",
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (response.url) {
          targetUrl = response.url;
        }
      } catch {
        // Fall back to original url
      }
    }
    return parseGoogleMapsUrl(targetUrl);
  });
