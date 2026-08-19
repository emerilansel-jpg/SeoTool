import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { validateSitemap } from "@/server/features/sitemap-validation/services/SitemapValidationService";

const validateSitemapInputSchema = z.object({
  projectId: z.string().min(1),
  url: z.string().url("Must be a valid URL").max(2048),
});

export const validateSitemapFn = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(validateSitemapInputSchema)
  .handler(async ({ data, context }) => {
    return validateSitemap(data.url, context.organizationId);
  });
