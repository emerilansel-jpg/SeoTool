import { z } from "zod";

/** Date ranges offered by the GA4 Insights page. A deliberate subset of the GA4
 *  agent ranges (GA4_DATE_RANGES in analyticsRequest.ts); assignability to
 *  Ga4DateRange is compiler-checked at the resolveDateRange call site. */
export const GA4_INSIGHTS_RANGES = [
  "last_7_days",
  "last_28_days",
  "last_3_months",
] as const;

/** Device values exactly as the GA4 `deviceCategory` dimension returns them. */
export const GA4_INSIGHTS_DEVICES = ["DESKTOP", "MOBILE", "TABLET"] as const;

export type Ga4InsightsDateRange = (typeof GA4_INSIGHTS_RANGES)[number];
export type Ga4InsightsDevice = (typeof GA4_INSIGHTS_DEVICES)[number];

// Shared report/table filters. Spread into each request schema so the overview
// and the paginated table calls always accept the exact same filter surface.
const ga4FilterShape = {
  projectId: z.string().min(1),
  dateRange: z.enum(GA4_INSIGHTS_RANGES).default("last_28_days"),
  device: z.enum(GA4_INSIGHTS_DEVICES).optional(),
  // ISO-3166-1 alpha-3, lowercased — the code GA4 returns in `country`.
  country: z
    .string()
    .length(3)
    .transform((value) => value.toLowerCase())
    .optional(),
};

export const ga4InputSchema = z.object(ga4FilterShape);

/** The dimensions that get their own paginated table. The daily trend, device
 *  and country breakdowns are computed from the overview call and never
 *  paginate. */
export const GA4_TABLE_DIMENSIONS = ["pages", "channels"] as const;
export type Ga4TableDimension = (typeof GA4_TABLE_DIMENSIONS)[number];

export const GA4_PAGE_SIZES = [25, 50, 100] as const;
export const GA4_DEFAULT_PAGE_SIZE = 25;

export const ga4TableInputSchema = z.object({
  ...ga4FilterShape,
  dimension: z.enum(GA4_TABLE_DIMENSIONS),
  page: z.number().int().positive().default(1),
  pageSize: z
    .number()
    .int()
    .refine((value) => (GA4_PAGE_SIZES as readonly number[]).includes(value))
    .default(GA4_DEFAULT_PAGE_SIZE),
});

/** Export pulls the full dataset (capped) rather than a single page. */
export const ga4TableExportInputSchema = z.object({
  ...ga4FilterShape,
  dimension: z.enum(GA4_TABLE_DIMENSIONS),
});
