import { DashboardService } from "@/server/features/dashboard/services/DashboardService";
import {
  GscNotConnectedError,
  GscService,
  isExpectedGrantFailure,
} from "@/server/features/gsc/services/GscService";
import {
  Ga4NotConnectedError,
  Ga4Service,
} from "@/server/features/ga4/services/Ga4Service";
import { ContentIntelligenceService } from "@/server/features/content-intelligence/services/ContentIntelligenceService";
import { type ReportSection } from "@/server/features/reports/repositories/ReportsRepository";
import {
  sumSearchTotals,
  buildStrikingDistanceRows,
  previousPeriod,
} from "@/server/features/gsc/searchPerformanceReport";
import { sumTotals } from "@/server/features/ga4/analyticsReport";

export type SnapshotPayload = {
  generatedAt: string;
  range: { startDate: string; endDate: string };
  sections: Record<string, SectionResult>;
};

type SectionResult =
  | { status: "ok"; data: unknown }
  | { status: "skipped"; reason: string }
  | { status: "error"; error: string };

type BuildInput = {
  projectId: string;
  domain: string | null;
  sections: ReportSection[];
};

/** Build a snapshot payload from a report config. Tolerant: if one section's
 *  data source fails (not connected, API error), the section is marked failed
 *  and the remaining sections continue. */
export async function buildSnapshot(
  input: BuildInput,
): Promise<SnapshotPayload> {
  const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const prev = previousPeriod(startDate, endDate);

  const sections: Record<string, SectionResult> = {};

  for (const section of input.sections) {
    const type = section.type;
    try {
      sections[type] = await buildSection(type, input.projectId, input.domain, {
        startDate,
        endDate,
        prevStartDate: prev.startDate,
        prevEndDate: prev.endDate,
      });
    } catch (error) {
      const isExpected =
        error instanceof GscNotConnectedError ||
        error instanceof Ga4NotConnectedError ||
        isExpectedGrantFailure(error);
      sections[type] = isExpected
        ? { status: "skipped", reason: describeError(error) }
        : {
            status: "error",
            error: describeError(error),
          };
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    range: { startDate, endDate },
    sections,
  };
}

async function buildSection(
  type: string,
  projectId: string,
  domain: string | null,
  range: {
    startDate: string;
    endDate: string;
    prevStartDate: string;
    prevEndDate: string;
  },
): Promise<SectionResult> {
  switch (type) {
    case "rank":
      return buildRankSection(projectId, domain);
    case "audit":
      return buildAuditSection(projectId);
    case "gsc":
      return buildGscSection(projectId, range);
    case "ga4":
      return buildGa4Section(projectId, range);
    case "backlinks":
      return buildBacklinkSection(projectId, domain);
    case "content":
      return buildContentSection(projectId);
    default:
      return { status: "skipped", reason: `Unknown section type: ${type}` };
  }
}

async function buildRankSection(
  projectId: string,
  domain: string | null,
): Promise<SectionResult> {
  const overview = await DashboardService.getOverview({ projectId, domain });
  const rank = overview.rank;
  return {
    status: "ok",
    data: {
      trackedKeywords: rank?.trackedKeywords ?? 0,
      improved: rank?.improved ?? 0,
      declined: rank?.declined ?? 0,
      top10: rank?.top10 ?? 0,
      lastCheckedAt: rank?.lastCheckedAt ?? null,
    },
  };
}

async function buildAuditSection(projectId: string): Promise<SectionResult> {
  const overview = await DashboardService.getOverview({
    projectId,
    domain: null,
  });
  const audit = overview.audit;
  return {
    status: "ok",
    data: {
      status: audit?.status ?? null,
      pagesCrawled: audit?.pagesCrawled ?? 0,
      topIssues: audit?.topIssues ?? [],
      totalIssueTypes: audit?.totalIssueTypes ?? 0,
      startedAt: audit?.startedAt ?? null,
    },
  };
}

async function buildGscSection(
  projectId: string,
  range: {
    startDate: string;
    endDate: string;
    prevStartDate: string;
    prevEndDate: string;
  },
): Promise<SectionResult> {
  const [current, previous, queryPages] = await Promise.all([
    GscService.getPerformance({
      projectId,
      startDate: range.startDate,
      endDate: range.endDate,
      dimensions: ["date"],
      rowLimit: 200,
    }),
    GscService.getPerformance({
      projectId,
      startDate: range.prevStartDate,
      endDate: range.prevEndDate,
      dimensions: ["date"],
      rowLimit: 200,
    }),
    GscService.getPerformance({
      projectId,
      startDate: range.startDate,
      endDate: range.endDate,
      dimensions: ["query", "page"],
      rowLimit: 1000,
    }),
  ]);
  return {
    status: "ok",
    data: {
      totals: sumSearchTotals(current.rows),
      prevTotals: sumSearchTotals(previous.rows),
      strikingDistance: buildStrikingDistanceRows(queryPages.rows),
    },
  };
}

async function buildGa4Section(
  projectId: string,
  range: {
    startDate: string;
    endDate: string;
    prevStartDate: string;
    prevEndDate: string;
  },
): Promise<SectionResult> {
  const [current, previous] = await Promise.all([
    Ga4Service.getReport({
      projectId,
      startDate: range.startDate,
      endDate: range.endDate,
      includeTotals: true,
    }),
    Ga4Service.getReport({
      projectId,
      startDate: range.prevStartDate,
      endDate: range.prevEndDate,
      includeTotals: true,
    }),
  ]);
  return {
    status: "ok",
    data: {
      totals: sumTotals(current.response),
      prevTotals: sumTotals(previous.response),
      propertyName: current.propertyName,
    },
  };
}

async function buildBacklinkSection(
  projectId: string,
  domain: string | null,
): Promise<SectionResult> {
  const overview = await DashboardService.getOverview({ projectId, domain });
  const backlinks = overview.backlinks;
  return {
    status: "ok",
    data: {
      backlinks: backlinks?.backlinks ?? null,
      referringDomains: backlinks?.referringDomains ?? null,
      newBacklinks: backlinks?.newBacklinks ?? null,
      lostBacklinks: backlinks?.lostBacklinks ?? null,
      capturedAt: backlinks?.capturedAt ?? null,
    },
  };
}

async function buildContentSection(projectId: string): Promise<SectionResult> {
  const summary =
    await ContentIntelligenceService.getSummaryForProject(projectId);
  if (!summary) {
    return {
      status: "skipped",
      reason: "No completed audit with content scores yet.",
    };
  }
  return { status: "ok", data: summary };
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
