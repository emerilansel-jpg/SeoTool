import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  projects,
  savedKeywords,
  rankTrackingKeywords,
  rankTrackingConfigs,
  reports,
} from "@/db/schema";
import type { QuotaFeature } from "@/shared/plans";

// Live-count helpers for gauge features. Gauge features (projects, saved
// keywords, rank tracking keywords, reports) are enforced by counting the
// underlying rows, not by a usage_quota counter. The QuotaService calls
// these to get the currentCount before asserting the gauge limit.
//
// Each counter excludes soft-deleted / inactive rows so the gauge reflects
// the user's actual standing usage.

/** Count non-archived projects for an org. */
export async function countOrgProjects(
  organizationId: string,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(projects)
    .where(
      and(
        eq(projects.organizationId, organizationId),
        isNull(projects.archivedAt),
      ),
    );
  return row?.value ?? 0;
}

/** Count saved keywords for a project (the gauge is per-org, summed across
 *  the org's projects). */
export async function countOrgSavedKeywords(
  organizationId: string,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(savedKeywords)
    .innerJoin(projects, eq(savedKeywords.projectId, projects.id))
    .where(
      and(
        eq(projects.organizationId, organizationId),
        isNull(projects.archivedAt),
      ),
    );
  return row?.value ?? 0;
}

/** Count tracked keywords across all active rank-tracking configs in the
 *  org's projects. */
export async function countOrgTrackedKeywords(
  organizationId: string,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(rankTrackingKeywords)
    .innerJoin(
      rankTrackingConfigs,
      eq(rankTrackingKeywords.configId, rankTrackingConfigs.id),
    )
    .innerJoin(projects, eq(rankTrackingConfigs.projectId, projects.id))
    .where(
      and(
        eq(projects.organizationId, organizationId),
        eq(rankTrackingConfigs.isActive, true),
        isNull(projects.archivedAt),
      ),
    );
  return row?.value ?? 0;
}

/** Count report configs for an org. */
export async function countOrgReports(organizationId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(reports)
    .where(eq(reports.organizationId, organizationId));
  return row?.value ?? 0;
}

/** Dispatch to the correct counter for a gauge feature. Returns the live
 *  count. Throws if the feature is not a gauge feature (caller bug). */
export async function gaugeCount(
  organizationId: string,
  feature: QuotaFeature,
): Promise<number> {
  switch (feature) {
    case "projects":
      return countOrgProjects(organizationId);
    case "saved_keywords":
      return countOrgSavedKeywords(organizationId);
    case "rank_tracking":
      return countOrgTrackedKeywords(organizationId);
    case "reports":
      return countOrgReports(organizationId);
    // audit_pages is a per-audit cap, not a standing count — the caller
    // checks it against the requested page count directly.
    case "audit_pages":
      return 0;
    default:
      // Non-gauge features shouldn't call this.
      throw new Error(`gaugeCount called for non-gauge feature: ${feature}`);
  }
}
