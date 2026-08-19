import { z } from "zod";

export const accessLogEntrySchema = z.object({
  ip: z.string(),
  timestamp: z.string(),
  method: z.string(),
  url: z.string(),
  statusCode: z.number(),
  responseSize: z.number(),
  userAgent: z.string(),
  referer: z.string(),
});

export const botTypeSchema = z.object({
  name: z.string(),
  requests: z.number(),
  percentage: z.number(),
});

export const topCrawledUrlSchema = z.object({
  url: z.string(),
  requests: z.number(),
  statusCodes: z.record(z.string(), z.number()),
});

export const crawlBudgetReportSchema = z.object({
  totalRequests: z.number(),
  totalBotRequests: z.number(),
  botRatio: z.number(),
  botTypes: z.array(botTypeSchema),
  topCrawledUrls: z.array(topCrawledUrlSchema),
  statusDistribution: z.record(z.string(), z.number()),
  wastedCrawlBudget: z.object({
    total4xx: z.number(),
    total5xx: z.number(),
    topWastedUrls: z.array(topCrawledUrlSchema),
  }),
  fetchedAt: z.string(),
});

export type AccessLogEntry = z.infer<typeof accessLogEntrySchema>;
export type BotType = z.infer<typeof botTypeSchema>;
export type TopCrawledUrl = z.infer<typeof topCrawledUrlSchema>;
export type CrawlBudgetReport = z.infer<typeof crawlBudgetReportSchema>;
