import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LinkIntersectService } from "@/server/features/link-intersect/services/LinkIntersectService";
import { requireProjectContext } from "@/serverFunctions/middleware";

const linkIntersectInputSchema = z.object({
  projectId: z.string().min(1),
  target: z.string().min(1),
  competitors: z.array(z.string().min(1)).min(1).max(3),
  limit: z.number().int().positive().max(1000).optional(),
});

/**
 * Link intersect: finds domains that link to competitor domains but NOT to the
 * target (the project's own domain). Metered — each call costs backlinks credits.
 */
export const getLinkIntersect = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(linkIntersectInputSchema)
  .handler(async ({ data, context }) => {
    return LinkIntersectService.getIntersect(
      {
        projectId: context.projectId,
        target: data.target,
        competitors: data.competitors,
        limit: data.limit,
      },
      context,
    );
  });
