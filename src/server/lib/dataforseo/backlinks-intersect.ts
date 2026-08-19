import { z } from "zod";
import { BacklinksDomainIntersectionLiveRequestInfo } from "dataforseo-client";
import { createDataforseoBillingClassifier } from "@/server/lib/dataforseoBillingClassification";
import { backlinksApi } from "@/server/lib/dataforseo/core";
import {
  assertOk,
  buildTaskBilling,
  parseTaskTotalCount,
  type DataforseoApiResponse,
} from "@/server/lib/dataforseo/envelope";

const classifyBacklinksIntersectError = createDataforseoBillingClassifier({
  pathPrefix: "/backlinks/",
  billingIssueCode: "BACKLINKS_BILLING_ISSUE",
  billingIssueMessage:
    "The connected DataForSEO account has a billing or balance issue",
});

const assertOptions = {
  classify: classifyBacklinksIntersectError,
  classifyPath: "/v3/backlinks/domain_intersection/live",
} as const;

/**
 * Zod schema for a single intersect item — a domain that links to one or more
 * targets but does not link to the excluded target.
 *
 * DataForSEO returns `domain_intersection` as a keyed object (e.g. `{ "1": {...}, "2": {...} }`)
 * where each key maps to a target. We flatten that into an array of `competitorData` entries
 * keyed by the original target domain for readability.
 */
const intersectionEntrySchema = z
  .object({
    type: z.string().nullable().optional(),
    target: z.string().nullable().optional(),
    rank: z.number().nullable().optional(),
    backlinks: z.number().nullable().optional(),
    first_seen: z.string().nullable().optional(),
    lost_date: z.string().nullable().optional(),
    backlinks_spam_score: z.number().nullable().optional(),
    broken_backlinks: z.number().nullable().optional(),
    broken_pages: z.number().nullable().optional(),
    referring_domains: z.number().nullable().optional(),
    referring_pages: z.number().nullable().optional(),
  })
  .passthrough();

export const intersectItemSchema = z
  .object({
    domain: z.string().nullable().optional(),
    intersection: z
      .record(z.string(), intersectionEntrySchema)
      .nullable()
      .optional(),
    summary_rank: z.number().nullable().optional(),
    summary_backlinks: z.number().nullable().optional(),
    summary_referring_domains: z.number().nullable().optional(),
    summary_referring_pages: z.number().nullable().optional(),
  })
  .passthrough();

export type IntersectItem = z.infer<typeof intersectItemSchema>;

type IntersectInput = {
  /** Competitor domains (up to 20, without protocol). */
  targets: string[];
  /** The project's own domain to exclude (without protocol). */
  excludeTarget: string;
  limit?: number;
  offset?: number;
  orderBy?: string[];
};

/**
 * Backlinks domain intersection: finds referring domains that link to one or
 * more competitor targets but NOT to the excluded target (the project's own domain).
 *
 * Maps to DataForSEO `POST /v3/backlinks/domain_intersection/live`.
 */
export async function fetchBacklinksDomainIntersection(
  input: IntersectInput,
): Promise<
  DataforseoApiResponse<{ items: IntersectItem[]; totalCount: number | null }>
> {
  // Build the numbered targets map: { "1": "competitor1.com", "2": "competitor2.com", ... }
  const targets: Record<string, string> = {};
  for (let i = 0; i < input.targets.length; i++) {
    targets[String(i + 1)] = input.targets[i];
  }

  const response = await backlinksApi(
    classifyBacklinksIntersectError,
  ).domainIntersectionLive([
    new BacklinksDomainIntersectionLiveRequestInfo({
      targets,
      exclude_targets: [input.excludeTarget],
      include_subdomains: true,
      include_indirect_links: true,
      exclude_internal_backlinks: true,
      backlinks_status_type: "live",
      rank_scale: "one_hundred",
      intersection_mode: "all",
      limit: input.limit ?? 100,
      offset: input.offset,
      order_by: input.orderBy ?? ["1.rank,desc"],
    }),
  ]);

  const task = assertOk(response, assertOptions);

  const rawItems: unknown[] = [];
  const firstResult = task.result?.[0];
  if (firstResult && typeof firstResult === "object" && firstResult !== null) {
    const items = (firstResult as Record<string, unknown>).items;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const record = item as Record<string, unknown>;
        const domainIntersection = record.domain_intersection as
          | Record<string, unknown>
          | undefined;
        const summary = record.summary as Record<string, unknown> | undefined;

        // Flatten the keyed intersection object into a readable structure.
        const intersection: Record<string, unknown> = {};
        if (domainIntersection) {
          for (const [key, value] of Object.entries(domainIntersection)) {
            // Map the numeric key back to the original target domain for readability.
            const targetDomain = targets[key] ?? key;
            intersection[targetDomain] = value;
          }
        }

        rawItems.push({
          domain: record.domain ?? null,
          intersection,
          summary_rank: summary?.rank ?? null,
          summary_backlinks: summary?.backlinks ?? null,
          summary_referring_domains: summary?.referring_domains ?? null,
          summary_referring_pages: summary?.referring_pages ?? null,
        });
      }
    }
  }

  const parsed = z.array(intersectItemSchema).safeParse(rawItems);
  if (!parsed.success) {
    console.error(
      "dataforseo.backlinks-domain-intersection-live.invalid-result",
      parsed.error.issues.slice(0, 5),
    );
    // Fall through with raw items — the passthrough schema is permissive.
  }

  const items = parsed.success ? parsed.data : (rawItems as IntersectItem[]);

  return {
    data: {
      items,
      totalCount: parseTaskTotalCount(task),
    },
    billing: buildTaskBilling(task),
  };
}
