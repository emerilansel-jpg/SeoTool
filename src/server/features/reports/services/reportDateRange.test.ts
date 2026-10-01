import { describe, expect, it } from "vitest";
import { resolveReportPeriodRange } from "./reportDateRange";

const FIXED_DATE = new Date(Date.UTC(2024, 5, 12, 14, 30, 0)); // 2024-06-12

describe("resolveReportPeriodRange", () => {
  it("resolves weekly period: last 7 complete days ending yesterday UTC", () => {
    const range = resolveReportPeriodRange("weekly", FIXED_DATE);
    expect(range.days).toBe(7);
    expect(range.endDate).toBe("2024-06-11");
    expect(range.startDate).toBe("2024-06-05");
    expect(range.prevEndDate).toBe("2024-06-04");
    expect(range.prevStartDate).toBe("2024-05-29");

    const curDiff =
      (new Date(range.endDate).getTime() -
        new Date(range.startDate).getTime()) /
        86400000 +
      1;
    const prevDiff =
      (new Date(range.prevEndDate).getTime() -
        new Date(range.prevStartDate).getTime()) /
        86400000 +
      1;
    expect(curDiff).toBe(7);
    expect(prevDiff).toBe(7);
  });

  it("resolves monthly period: last 30 complete days ending yesterday UTC", () => {
    const range = resolveReportPeriodRange("monthly", FIXED_DATE);
    expect(range.days).toBe(30);
    expect(range.endDate).toBe("2024-06-11");
    expect(range.startDate).toBe("2024-05-13");
    expect(range.prevEndDate).toBe("2024-05-12");
    expect(range.prevStartDate).toBe("2024-04-13");

    const curDiff =
      (new Date(range.endDate).getTime() -
        new Date(range.startDate).getTime()) /
        86400000 +
      1;
    const prevDiff =
      (new Date(range.prevEndDate).getTime() -
        new Date(range.prevStartDate).getTime()) /
        86400000 +
      1;
    expect(curDiff).toBe(30);
    expect(prevDiff).toBe(30);
  });

  it("resolves yearly period: last 365 complete days ending yesterday UTC", () => {
    const range = resolveReportPeriodRange("yearly", FIXED_DATE);
    expect(range.days).toBe(365);
    expect(range.endDate).toBe("2024-06-11");

    const curDiff =
      (new Date(range.endDate).getTime() -
        new Date(range.startDate).getTime()) /
        86400000 +
      1;
    const prevDiff =
      (new Date(range.prevEndDate).getTime() -
        new Date(range.prevStartDate).getTime()) /
        86400000 +
      1;
    expect(curDiff).toBe(365);
    expect(prevDiff).toBe(365);
  });

  it("defaults to monthly if no period specified", () => {
    const range = resolveReportPeriodRange(undefined, FIXED_DATE);
    expect(range.days).toBe(30);
    expect(range.endDate).toBe("2024-06-11");
  });
});
