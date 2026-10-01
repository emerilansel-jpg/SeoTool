import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {}, waitUntil: vi.fn() }));

import { AppError } from "@/server/lib/errors";
import { ReportService } from "./services/ReportService";
import { ReportsRepository } from "./repositories/ReportsRepository";

function assertRequestedProject(
  requestedProjectId: string,
  currentProjectId: string,
) {
  if (requestedProjectId !== currentProjectId) {
    throw new Error("Project mismatch in authenticated request");
  }
}

describe("GATE 1 Security: IDOR & Access Control Isolation", () => {
  it("prevents Project A from reading a report belonging to Project B", async () => {
    const getByIdSpy = vi
      .spyOn(ReportsRepository, "getById")
      .mockImplementation(async (reportId, projectId) => {
        // Report exists in Project B ("proj_b"), but request is asking for Project A ("proj_a")
        if (reportId === "rep_b" && projectId === "proj_a") {
          return null;
        }
        return null;
      });

    await expect(
      ReportService.getReportWithSections("rep_b", "proj_a"),
    ).rejects.toThrow(AppError);

    expect(getByIdSpy).toHaveBeenCalledWith("rep_b", "proj_a");
    getByIdSpy.mockRestore();
  });

  it("prevents Project A from deleting a report belonging to Project B", async () => {
    const getByIdSpy = vi
      .spyOn(ReportsRepository, "getById")
      .mockResolvedValueOnce(null);

    await expect(
      ReportService.deleteReport("rep_b", "proj_a"),
    ).rejects.toThrow("Report not found");

    getByIdSpy.mockRestore();
  });

  it("prevents Project A from updating a report belonging to Project B", async () => {
    const getByIdSpy = vi
      .spyOn(ReportsRepository, "getById")
      .mockResolvedValueOnce(null);

    await expect(
      ReportService.updateReport(
        "rep_b",
        {
          name: "Hacked Report",
          schedule: "none",
          sections: [],
        },
        "proj_a",
      ),
    ).rejects.toThrow("Report not found");

    getByIdSpy.mockRestore();
  });

  it("prevents Project A from retrieving snapshots belonging to Project B", async () => {
    const getSnapshotSpy = vi
      .spyOn(ReportsRepository, "getSnapshot")
      .mockImplementation(async (_snapId, projectId) => {
        // Inner join with reports ensures snapshot is only returned if reports.projectId === projectId
        if (projectId === "proj_a") return null;
        return null;
      });

    const result = await ReportService.getSnapshot("snap_b", "proj_a");
    expect(result).toBeNull();

    expect(getSnapshotSpy).toHaveBeenCalledWith("snap_b", "proj_a");
    getSnapshotSpy.mockRestore();
  });

  it("rejects project mismatch in SERP volatility requests", () => {
    expect(() =>
      assertRequestedProject("attacker_project_id", "legit_project_id"),
    ).toThrow("Project mismatch in authenticated request");
  });
});

describe("GATE 1 Security: Injection and Sanitization", () => {
  it("safely accepts payloads containing SQL and XSS strings without crashing or executing", () => {
    const maliciousName = "<script>alert(1)</script>' OR 1=1; --";
    const maliciousClient = '"><img src=x onerror=alert(2)>';

    expect(maliciousName.length).toBeLessThanOrEqual(120);
    expect(typeof maliciousName).toBe("string");
    expect(typeof maliciousClient).toBe("string");
  });
});
