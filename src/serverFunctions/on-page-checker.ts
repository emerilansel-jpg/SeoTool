import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { checkOnPageSeo } from "@/server/features/on-page-checker/services/OnPageCheckerService";

const checkOnPageInputSchema = z.object({
  projectId: z.string().min(1),
  url: z.string().url("Must be a valid URL").max(2048),
});

export const checkOnPageSeoFn = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(checkOnPageInputSchema)
  .handler(async ({ data, context }) => {
    return checkOnPageSeo(data.url, context.organizationId);
  });
