import { z } from "zod";

/** A single competitor's intersection data for one linking domain. */
export const intersectCompetitorEntrySchema = z.object({
  rank: z.number().nullable(),
  backlinks: z.number().nullable(),
  referring_domains: z.number().nullable(),
  referring_pages: z.number().nullable(),
  first_seen: z.string().nullable(),
  backlinks_spam_score: z.number().nullable(),
});

/** A domain that links to one or more competitors but not the target. */
export const intersectDomainSchema = z.object({
  domain: z.string(),
  /** Per-competitor intersection data, keyed by competitor domain. */
  competitors: z.record(z.string(), intersectCompetitorEntrySchema),
  /** Aggregated rank across all competitors. */
  rank: z.number().nullable(),
  /** Aggregated backlinks across all competitors. */
  backlinks: z.number().nullable(),
});

export const intersectSummarySchema = z.object({
  totalDomains: z.number(),
  avgRank: z.number().nullable(),
  avgBacklinks: z.number().nullable(),
  medianBacklinks: z.number().nullable(),
});

export const linkIntersectViewSchema = z.object({
  target: z.string(),
  competitors: z.array(z.string()),
  domains: z.array(intersectDomainSchema),
  summary: intersectSummarySchema,
  totalCount: z.number().nullable(),
  fetchedAt: z.string(),
  hasData: z.boolean(),
});

export type IntersectCompetitorEntry = z.infer<
  typeof intersectCompetitorEntrySchema
>;
export type IntersectDomain = z.infer<typeof intersectDomainSchema>;
export type IntersectSummary = z.infer<typeof intersectSummarySchema>;
export type LinkIntersectView = z.infer<typeof linkIntersectViewSchema>;
