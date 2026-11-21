import { createServerFn } from "@tanstack/react-start";
import { BulkToolsService } from "@/server/features/bulk-tools/services/BulkToolsService";
import {
  bulkAutocompleteInputSchema,
  bulkKeywordMetricsInputSchema,
  bulkMetadataOptimizerInputSchema,
  bulkMentionsInputSchema,
  bulkPaaInputSchema,
} from "@/types/schemas/bulk-tools";
import { requireProjectContext } from "@/serverFunctions/middleware";

export const runBulkKeywordMetrics = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(bulkKeywordMetricsInputSchema)
  .handler(async ({ data, context }) => {
    return BulkToolsService.bulkKeywordMetrics(
      {
        keywords: data.keywords,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
      },
      context,
    );
  });

export const runBulkPaa = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(bulkPaaInputSchema)
  .handler(async ({ data, context }) => {
    return BulkToolsService.bulkPaa(
      {
        keywords: data.keywords,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
      },
      context,
    );
  });

export const runBulkAutocomplete = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(bulkAutocompleteInputSchema)
  .handler(async ({ data, context }) => {
    return BulkToolsService.bulkAutocomplete(
      {
        keywords: data.keywords,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
      },
      context,
    );
  });

export const runBulkMentions = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(bulkMentionsInputSchema)
  .handler(async ({ data, context }) => {
    return BulkToolsService.bulkMentions(
      {
        terms: data.terms,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
      },
      context,
    );
  });

export const runBulkMetadataOptimizer = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(bulkMetadataOptimizerInputSchema)
  .handler(async ({ data, context }) => {
    return BulkToolsService.bulkMetadataOptimizer(
      {
        projectId: context.projectId,
        auditId: data.auditId,
        maxPages: data.maxPages,
      },
      context,
    );
  });
