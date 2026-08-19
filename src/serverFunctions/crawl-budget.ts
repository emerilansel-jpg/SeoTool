import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { analyzeFromLogs } from "@/server/features/crawl-budget/services/CrawlBudgetService";

const analyzeCrawlBudgetInputSchema = z.object({
  projectId: z.string().min(1),
  logText: z.string().min(1, "Paste your access log content"),
});

export const analyzeCrawlBudgetFn = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(analyzeCrawlBudgetInputSchema)
  .handler(async ({ data }) => {
    return analyzeFromLogs(data.logText);
  });
