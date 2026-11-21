import { z } from "zod";

export const gscRankTrackerStatusInputSchema = z.object({
  projectId: z.string().min(1),
});

export const gscRankTrackerKeywordsInputSchema = z.object({
  projectId: z.string().min(1),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(200).default(50),
  sortBy: z.enum(["position", "impressions", "keyword"]).default("position"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});

export const gscKeywordHistoryInputSchema = z.object({
  projectId: z.string().min(1),
  keyword: z.string().trim().min(1).max(500),
  days: z.coerce.number().int().min(7).max(480).default(90),
});

export const gscSyncNowInputSchema = z.object({
  projectId: z.string().min(1),
});

export const gscBackfillChunkInputSchema = z.object({
  projectId: z.string().min(1),
  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "fromDate must be YYYY-MM-DD"),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "toDate must be YYYY-MM-DD"),
});

export const gscExplainMoveInputSchema = z.object({
  projectId: z.string().min(1),
  keyword: z.string().trim().min(1).max(500),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be YYYY-MM-DD")
    .optional(),
});

export const gscKeywordStatusInputSchema = z.object({
  projectId: z.string().min(1),
  keyword: z.string().trim().min(1).max(500),
  status: z.enum(["active", "ignored"]),
});
