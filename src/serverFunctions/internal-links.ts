import { createServerFn } from "@tanstack/react-start";
import { InternalLinksService } from "@/server/features/internal-links/services/InternalLinksService";
import {
  internalLinksGenerateInputSchema,
  internalLinksListInputSchema,
  internalLinksStatusInputSchema,
} from "@/types/schemas/internal-links";
import { requireProjectContext } from "@/serverFunctions/middleware";

export const generateInternalLinkSuggestions = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(internalLinksGenerateInputSchema)
  .handler(async ({ data, context }) => {
    return InternalLinksService.generateSuggestions({
      projectId: context.projectId,
      organizationId: context.organizationId,
      maxSuggestions: data.maxSuggestions,
    });
  });

export const listInternalLinkSuggestions = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(internalLinksListInputSchema)
  .handler(async ({ data, context }) => {
    return InternalLinksService.listSuggestions(
      context.projectId,
      data.status === "all" ? undefined : data.status,
    );
  });

export const setInternalLinkSuggestionStatus = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(internalLinksStatusInputSchema)
  .handler(async ({ data, context }) => {
    return InternalLinksService.setStatus({
      projectId: context.projectId,
      suggestionId: data.suggestionId,
      status: data.status,
    });
  });
