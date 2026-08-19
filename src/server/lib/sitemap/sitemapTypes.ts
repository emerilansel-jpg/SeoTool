import { z } from "zod";

export const sitemapUrlSchema = z.object({
  loc: z.string(),
  lastmod: z.string().nullable(),
  changefreq: z.string().nullable(),
  priority: z.number().nullable(),
});

export const sitemapIssueSchema = z.object({
  severity: z.enum(["error", "warning", "info"]),
  message: z.string(),
  url: z.string().optional(),
});

export const validationReportSchema = z.object({
  url: z.string(),
  totalUrls: z.number(),
  validUrls: z.number(),
  errorCount: z.number(),
  warningCount: z.number(),
  infoCount: z.number(),
  issues: z.array(sitemapIssueSchema),
  urls: z.array(sitemapUrlSchema),
  isSitemapIndex: z.boolean(),
  childSitemaps: z.number(),
  fetchedAt: z.string(),
});

export type SitemapUrl = z.infer<typeof sitemapUrlSchema>;
export type SitemapIssue = z.infer<typeof sitemapIssueSchema>;
export type ValidationReport = z.infer<typeof validationReportSchema>;
