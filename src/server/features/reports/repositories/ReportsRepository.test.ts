// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- vi.fn mock narrowing in test doubles
import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => {
  const q: Record<string, unknown> = {};
  q.select = vi.fn(() => q);
  q.from = vi.fn(() => q);
  q.where = vi.fn(() => q);
  q.orderBy = vi.fn(() => q);
  q.limit = vi.fn(() => q);
  q.insert = vi.fn(() => q);
  q.values = vi.fn(() => q);
  q.returning = vi.fn(() => q);
  q.update = vi.fn(() => q);
  q.set = vi.fn(() => q);
  q.delete = vi.fn(() => q);
  return q;
});

vi.mock("@/db", () => ({
  db: query,
}));

vi.mock("@/db/schema", () => ({
  reports: {
    id: "reports.id",
    organizationId: "reports.organization_id",
    projectId: "reports.project_id",
    name: "reports.name",
    reportPeriod: "reports.report_period",
    schedule: "reports.schedule",
    dayOfWeek: "reports.day_of_week",
    dayOfMonth: "reports.day_of_month",
    monthOfYear: "reports.month_of_year",
    nextRunAt: "reports.next_run_at",
    updatedAt: "reports.updated_at",
  },
  reportSections: {
    id: "report_sections.id",
    reportId: "report_sections.report_id",
    sortOrder: "report_sections.sort_order",
  },
  reportSnapshots: {
    id: "report_snapshots.id",
    reportId: "report_snapshots.report_id",
    createdAt: "report_snapshots.created_at",
  },
  reportDeliveries: {
    id: "report_deliveries.id",
  },
}));

import { ReportsRepository } from "./ReportsRepository";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ReportsRepository.listDue", () => {
  it("queries due reports with nextRunAt <= now for weekly, monthly, and yearly schedules", async () => {
    (query.where as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: "rep_1",
        schedule: "monthly",
        nextRunAt: "2024-06-12T08:00:00.000Z",
      },
    ]);

    const result = await ReportsRepository.listDue("2024-06-12T08:00:00.000Z");
    expect(result).toHaveLength(1);
    expect(query.from).toHaveBeenCalled();
    expect(query.where).toHaveBeenCalled();
  });
});

describe("ReportsRepository insert and update", () => {
  it("inserts report with default reportPeriod monthly and optional monthOfYear", async () => {
    const mockReport = {
      id: "rep_new",
      projectId: "proj_1",
      organizationId: "org_1",
      name: "Client Q3 Report",
      reportPeriod: "monthly",
      schedule: "yearly",
      dayOfWeek: null,
      dayOfMonth: 1,
      monthOfYear: 1,
      nextRunAt: "2025-01-01T08:00:00.000Z",
      clientName: null,
      logoUrl: null,
      brandColor: null,
      accentColor: null,
      recipients: null,
      createdByUserId: "user_1",
    };

    (query.returning as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      mockReport,
    ]);

    const inserted = await ReportsRepository.insertReport({
      id: "rep_new",
      projectId: "proj_1",
      organizationId: "org_1",
      name: "Client Q3 Report",
      schedule: "yearly",
      dayOfWeek: null,
      dayOfMonth: 1,
      monthOfYear: 1,
      nextRunAt: "2025-01-01T08:00:00.000Z",
      clientName: null,
      logoUrl: null,
      brandColor: null,
      accentColor: null,
      recipients: null,
      createdByUserId: "user_1",
    });

    expect(inserted).toEqual(mockReport);
    expect(query.values).toHaveBeenCalledWith(
      expect.objectContaining({
        reportPeriod: "monthly",
        monthOfYear: 1,
      }),
    );
  });

  it("updates report with reportPeriod and monthOfYear", async () => {
    (query.where as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

    await ReportsRepository.updateReport("rep_new", {
      name: "Renamed Report",
      reportPeriod: "yearly",
      monthOfYear: 6,
    });

    expect(query.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Renamed Report",
        reportPeriod: "yearly",
        monthOfYear: 6,
      }),
    );
  });
});
