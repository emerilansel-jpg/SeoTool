// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- narrowing JSON section results in tests
import { beforeEach, describe, expect, it, vi } from "vitest";

const dashboardMock = vi.hoisted(() => ({
  getOverview: vi.fn(),
}));

vi.mock("@/server/features/dashboard/services/DashboardService", () => ({
  DashboardService: dashboardMock,
}));

vi.mock("@/server/features/gsc/services/GscService", () => ({
  GscService: {
    getPerformance: vi.fn().mockResolvedValue({ rows: [] }),
  },
  GscNotConnectedError: class GscNotConnectedError extends Error {},
  isExpectedGrantFailure: vi.fn(() => false),
}));

vi.mock("@/server/features/ga4/services/Ga4Service", () => ({
  Ga4Service: {
    getReport: vi
      .fn()
      .mockResolvedValue({ response: {}, propertyName: "Test Prop" }),
  },
  Ga4NotConnectedError: class Ga4NotConnectedError extends Error {},
}));

vi.mock(
  "@/server/features/content-intelligence/services/ContentIntelligenceService",
  () => ({
    ContentIntelligenceService: {
      getSummaryForProject: vi.fn().mockResolvedValue({ overallScore: 85 }),
    },
  }),
);

const gmbMock = vi.hoisted(() => ({
  buildGmbSection: vi.fn().mockResolvedValue({
    status: "ok",
    data: { hasData: true, runs: [] },
  }),
}));
vi.mock("@/server/features/reports/sections/gmbSection", () => gmbMock);

const brandLookupMock = vi.hoisted(() => ({
  buildBrandLookupSection: vi.fn().mockResolvedValue({
    status: "ok",
    data: { hasData: true, latestTarget: null },
  }),
}));
vi.mock(
  "@/server/features/reports/sections/brandLookupSection",
  () => brandLookupMock,
);

const aiTrackingMock = vi.hoisted(() => ({
  buildAiTrackingSection: vi.fn().mockResolvedValue({
    status: "ok",
    data: { hasData: true },
  }),
}));
vi.mock(
  "@/server/features/reports/sections/aiTrackingSection",
  () => aiTrackingMock,
);

import { buildSnapshot } from "./ReportSnapshotBuilder";
import type { ReportSection } from "@/server/features/reports/repositories/ReportsRepository";

beforeEach(() => {
  vi.clearAllMocks();
  dashboardMock.getOverview.mockResolvedValue({
    rank: { trackedKeywords: 10, improved: 2, declined: 1, top10: 5 },
    audit: {
      status: "completed",
      pagesCrawled: 50,
      topIssues: [],
      totalIssueTypes: 0,
    },
    backlinks: { backlinks: 100, referringDomains: 20 },
  });
  gmbMock.buildGmbSection.mockResolvedValue({
    status: "ok",
    data: { hasData: true, runs: [] },
  });
  brandLookupMock.buildBrandLookupSection.mockResolvedValue({
    status: "ok",
    data: { hasData: true, latestTarget: null },
  });
  aiTrackingMock.buildAiTrackingSection.mockResolvedValue({
    status: "ok",
    data: { hasData: true },
  });
});

describe("ReportSnapshotBuilder", () => {
  it("builds snapshot for weekly, monthly, and yearly periods using reportPeriod", async () => {
    const sections: ReportSection[] = [
      {
        id: "sec_1",
        reportId: "rep_1",
        type: "rank",
        config: null,
        sortOrder: 0,
      },
      {
        id: "sec_2",
        reportId: "rep_1",
        type: "gmb_grid",
        config: null,
        sortOrder: 1,
      },
      {
        id: "sec_3",
        reportId: "rep_1",
        type: "brand_lookup",
        config: null,
        sortOrder: 2,
      },
      {
        id: "sec_4",
        reportId: "rep_1",
        type: "ai_tracking",
        config: null,
        sortOrder: 3,
      },
    ];

    const weekly = await buildSnapshot({
      projectId: "proj_1",
      domain: "example.com",
      sections,
      period: "weekly",
    });

    expect(weekly.sections.rank.status).toBe("ok");
    expect(weekly.sections.gmb_grid.status).toBe("ok");
    expect(weekly.sections.brand_lookup.status).toBe("ok");
    expect(weekly.sections.ai_tracking.status).toBe("ok");
    expect(gmbMock.buildGmbSection).toHaveBeenCalled();
    expect(brandLookupMock.buildBrandLookupSection).toHaveBeenCalled();
    expect(aiTrackingMock.buildAiTrackingSection).toHaveBeenCalled();

    // Verify 7-day span
    const start = new Date(weekly.range.startDate);
    const end = new Date(weekly.range.endDate);
    expect((end.getTime() - start.getTime()) / 86400000 + 1).toBe(7);
  });

  it("handles section failure gracefully without failing remaining sections", async () => {
    gmbMock.buildGmbSection.mockRejectedValueOnce(
      new Error("GMB database connection timed out"),
    );

    const sections: ReportSection[] = [
      {
        id: "sec_1",
        reportId: "rep_1",
        type: "rank",
        config: null,
        sortOrder: 0,
      },
      {
        id: "sec_2",
        reportId: "rep_1",
        type: "gmb_grid",
        config: null,
        sortOrder: 1,
      },
      {
        id: "sec_3",
        reportId: "rep_1",
        type: "brand_lookup",
        config: null,
        sortOrder: 2,
      },
    ];

    const snapshot = await buildSnapshot({
      projectId: "proj_1",
      domain: "example.com",
      sections,
    });

    expect(snapshot.sections.rank.status).toBe("ok");
    expect(snapshot.sections.gmb_grid.status).toBe("error");
    expect((snapshot.sections.gmb_grid as { error: string }).error).toContain(
      "GMB database connection timed out",
    );
    expect(snapshot.sections.brand_lookup.status).toBe("ok");
  });
});
