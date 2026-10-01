import { describe, expect, it } from "vitest";
import { computeNextRunAt } from "@/server/features/reports/services/reportSchedule";

// Fixed "today" for deterministic tests.
const TODAY = new Date(Date.UTC(2024, 5, 12)); // 2024-06-12 (Wednesday)

describe("computeNextRunAt", () => {
  describe("none schedule", () => {
    it("returns null", () => {
      expect(computeNextRunAt("none", null, null, TODAY)).toBeNull();
    });
  });

  describe("weekly schedule", () => {
    it("computes next Monday when today is Wednesday and dayOfWeek=1", () => {
      const result = computeNextRunAt("weekly", 1, null, TODAY);
      expect(result).toBe(
        new Date(Date.UTC(2024, 5, 17, 8, 0, 0)).toISOString(),
      ); // Mon June 17
    });

    it("defaults to Monday when dayOfWeek is null", () => {
      const result = computeNextRunAt("weekly", null, null, TODAY);
      expect(result).toContain("2024-06-17");
    });

    it("goes to next week if dayOfWeek already passed", () => {
      // Today is Wednesday (day 3); target Friday (5) is ahead — same week
      const result = computeNextRunAt("weekly", 5, null, TODAY);
      expect(result).toContain("2024-06-14"); // Fri June 14

      // Saturday (6) is also ahead
      const sat = computeNextRunAt("weekly", 6, null, TODAY);
      expect(sat).toContain("2024-06-15");
    });
  });

  describe("monthly schedule", () => {
    it("computes next 1st of the month when today is 12th", () => {
      const result = computeNextRunAt("monthly", null, 1, TODAY);
      expect(result).toContain("2024-07-01");
    });

    it("uses same month if target day hasn't passed", () => {
      const result = computeNextRunAt("monthly", null, 20, TODAY);
      expect(result).toContain("2024-06-20");
    });

    it("defaults to day 1 when dayOfMonth is null", () => {
      const result = computeNextRunAt("monthly", null, null, TODAY);
      expect(result).toContain("2024-07-01");
    });
  });

  describe("yearly schedule", () => {
    it("computes run in current year if target month and day are ahead", () => {
      const result = computeNextRunAt("yearly", null, 15, TODAY, 8);
      expect(result).toBe(
        new Date(Date.UTC(2024, 7, 15, 8, 0, 0)).toISOString(),
      ); // Aug 15 2024
    });

    it("computes run in current month if target day is ahead", () => {
      const result = computeNextRunAt("yearly", null, 20, TODAY, 6);
      expect(result).toBe(
        new Date(Date.UTC(2024, 5, 20, 8, 0, 0)).toISOString(),
      ); // Jun 20 2024
    });

    it("rolls over to next year if target date already passed this year", () => {
      const result = computeNextRunAt("yearly", null, 1, TODAY, 3);
      expect(result).toBe(
        new Date(Date.UTC(2025, 2, 1, 8, 0, 0)).toISOString(),
      ); // Mar 1 2025
    });

    it("defaults to January 1 next year when month and day are null", () => {
      const result = computeNextRunAt("yearly", null, null, TODAY);
      expect(result).toBe(
        new Date(Date.UTC(2025, 0, 1, 8, 0, 0)).toISOString(),
      ); // Jan 1 2025
    });

    it("clamps dayOfMonth to 28 max", () => {
      const result = computeNextRunAt("yearly", null, 31, TODAY, 8);
      expect(result).toBe(
        new Date(Date.UTC(2024, 7, 28, 8, 0, 0)).toISOString(),
      ); // Aug 28 2024
    });
  });
});
