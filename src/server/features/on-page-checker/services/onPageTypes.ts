import { z } from "zod";

export const onPageIssueSchema = z.object({
  category: z.enum([
    "title",
    "meta",
    "headings",
    "images",
    "links",
    "content",
    "technical",
  ]),
  severity: z.enum(["error", "warning", "info"]),
  message: z.string(),
  details: z.string().optional(),
});

export const onPageCategoryScoreSchema = z.object({
  category: z.string(),
  score: z.number().min(0).max(100),
  grade: z.enum(["A", "B", "C", "D", "F"]),
  issues: z.array(onPageIssueSchema),
});

export const onPageReportSchema = z.object({
  url: z.string(),
  statusCode: z.number().nullable(),
  overallScore: z.number().min(0).max(100),
  grade: z.enum(["A", "B", "C", "D", "F"]),
  title: z.string().nullable(),
  metaDescription: z.string().nullable(),
  wordCount: z.number().nullable(),
  categories: z.array(onPageCategoryScoreSchema),
  issues: z.array(onPageIssueSchema),
  fetchedAt: z.string(),
});

export type OnPageIssue = z.infer<typeof onPageIssueSchema>;
export type OnPageCategoryScore = z.infer<typeof onPageCategoryScoreSchema>;
export type OnPageReport = z.infer<typeof onPageReportSchema>;
