import { createServerFn } from "@tanstack/react-start";
import { NapService } from "@/server/features/nap-finder/services/NapService";
import {
  gbpCheckTaskInputSchema,
  gbpFetchReviewsInputSchema,
  gbpProfileInputSchema,
  gbpReviewsListInputSchema,
  napAuditInputSchema,
  napAuditResultsInputSchema,
  napHistoryInputSchema,
} from "@/types/schemas/nap";
import { GbpService } from "@/server/features/nap-finder/services/GbpService";
import { requireProjectContext } from "@/serverFunctions/middleware";

export const runNapAuditFn = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(napAuditInputSchema)
  .handler(async ({ data, context }) => {
    return NapService.runNapAudit(
      {
        projectId: context.projectId,
        businessName: data.businessName,
        city: data.city,
        phone: data.phone ?? null,
        address: data.address ?? null,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
        directories: data.directories,
      },
      context,
    );
  });

export const getNapHistory = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(napHistoryInputSchema)
  .handler(async ({ context }) => {
    return NapService.listHistory(context.projectId);
  });

export const getNapAuditResults = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(napAuditResultsInputSchema)
  .handler(async ({ data, context }) => {
    return NapService.getAudit(context.projectId, data.auditId);
  });

export const fetchGbpProfile = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gbpProfileInputSchema)
  .handler(async ({ data, context }) => {
    return GbpService.fetchProfile(
      {
        projectId: context.projectId,
        keyword: data.keyword,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
      },
      context,
    );
  });

export const getGbpProfile = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gbpProfileInputSchema.pick({ projectId: true }))
  .handler(async ({ context }) => {
    return GbpService.getProfile(context.projectId);
  });

export const fetchGbpReviews = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gbpFetchReviewsInputSchema)
  .handler(async ({ data, context }) => {
    return GbpService.fetchReviews(
      {
        projectId: context.projectId,
        keyword: data.keyword,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
        depth: data.depth,
      },
      context,
    );
  });

export const checkGbpReviewsTask = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gbpCheckTaskInputSchema)
  .handler(async ({ data, context }) => {
    return GbpService.checkReviewsTask(
      { projectId: context.projectId, taskId: data.taskId },
      context,
    );
  });

export const listGbpReviews = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gbpReviewsListInputSchema)
  .handler(async ({ data, context }) => {
    return GbpService.listReviews(context.projectId, data.limit);
  });
