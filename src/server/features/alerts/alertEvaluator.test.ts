import { describe, expect, it } from "vitest";
import {
  evaluateRankDrop,
  evaluateAuditCritical,
  type RankSnapshotInput,
} from "./alertEvaluator";

describe("alertEvaluator", () => {
  describe("evaluateRankDrop", () => {
    const condition = { threshold: 10 };

    it("returns null when no current snapshots", () => {
      const result = evaluateRankDrop(condition, [], []);
      expect(result).toBeNull();
    });

    it("returns null when no keyword dropped by threshold", () => {
      const current: RankSnapshotInput[] = [
        {
          keyword: "seo tools",
          device: "desktop",
          position: 5,
          url: "https://x",
        },
      ];
      const previous: RankSnapshotInput[] = [
        {
          keyword: "seo tools",
          device: "desktop",
          position: 3,
          url: "https://x",
        },
      ];
      // Drop is only 2, threshold is 10
      const result = evaluateRankDrop(condition, current, previous);
      expect(result).toBeNull();
    });

    it("triggers when keyword drops beyond threshold", () => {
      const current: RankSnapshotInput[] = [
        {
          keyword: "seo tools",
          device: "desktop",
          position: 25,
          url: "https://x",
        },
      ];
      const previous: RankSnapshotInput[] = [
        {
          keyword: "seo tools",
          device: "desktop",
          position: 10,
          url: "https://x",
        },
      ];
      // Drop is 15, threshold is 10
      const result = evaluateRankDrop(condition, current, previous);
      expect(result).not.toBeNull();
      expect(result!.summary).toContain("1 keyword");
      expect(result!.summary).toContain("10+ positions");
      expect(result!.details[0]).toContain("seo tools");
      expect(result!.details[0]).toContain("#10");
      expect(result!.details[0]).toContain("#25");
    });

    it("triggers when keyword drops to not-ranking (null position)", () => {
      const current: RankSnapshotInput[] = [
        { keyword: "best seo", device: "desktop", position: null, url: null },
      ];
      const previous: RankSnapshotInput[] = [
        {
          keyword: "best seo",
          device: "desktop",
          position: 5,
          url: "https://x",
        },
      ];
      const result = evaluateRankDrop({ threshold: 5 }, current, previous);
      expect(result).not.toBeNull();
      expect(result!.details[0]).toContain("Not ranking");
    });

    it("filters by keyword when condition.keyword is set", () => {
      const current: RankSnapshotInput[] = [
        { keyword: "seo tools", device: "desktop", position: 50, url: null },
        { keyword: "other kw", device: "desktop", position: 1, url: null },
      ];
      const previous: RankSnapshotInput[] = [
        { keyword: "seo tools", device: "desktop", position: 5, url: null },
        { keyword: "other kw", device: "desktop", position: 1, url: null },
      ];
      const result = evaluateRankDrop(
        { threshold: 10, keyword: "seo tools" },
        current,
        previous,
      );
      expect(result).not.toBeNull();
      expect(result!.details).toHaveLength(1);
      expect(result!.details[0]).toContain("seo tools");
    });

    it("filters by device when condition.device is set", () => {
      const current: RankSnapshotInput[] = [
        { keyword: "seo", device: "desktop", position: 50, url: null },
        { keyword: "seo", device: "mobile", position: 3, url: null },
      ];
      const previous: RankSnapshotInput[] = [
        { keyword: "seo", device: "desktop", position: 5, url: null },
        { keyword: "seo", device: "mobile", position: 3, url: null },
      ];
      const result = evaluateRankDrop(
        { threshold: 10, device: "desktop" },
        current,
        previous,
      );
      expect(result).not.toBeNull();
      expect(result!.details).toHaveLength(1);
      expect(result!.details[0]).toContain("desktop");
    });

    it("handles multiple dropped keywords", () => {
      const current: RankSnapshotInput[] = [
        { keyword: "kw1", device: "desktop", position: 30, url: null },
        { keyword: "kw2", device: "desktop", position: 25, url: null },
        { keyword: "kw3", device: "desktop", position: 5, url: null },
      ];
      const previous: RankSnapshotInput[] = [
        { keyword: "kw1", device: "desktop", position: 5, url: null },
        { keyword: "kw2", device: "desktop", position: 10, url: null },
        { keyword: "kw3", device: "desktop", position: 3, url: null },
      ];
      const result = evaluateRankDrop({ threshold: 10 }, current, previous);
      expect(result).not.toBeNull();
      expect(result!.summary).toContain("2 keywords");
      expect(result!.details).toHaveLength(2);
    });
  });

  describe("evaluateAuditCritical", () => {
    it("returns null when critical count below threshold", () => {
      const result = evaluateAuditCritical(
        { threshold: 5 },
        3,
        new Date("2026-01-01"),
      );
      expect(result).toBeNull();
    });

    it("triggers when critical count meets threshold", () => {
      const result = evaluateAuditCritical(
        { threshold: 5 },
        5,
        new Date("2026-01-01"),
      );
      expect(result).not.toBeNull();
      expect(result!.summary).toContain("5 critical issues");
      expect(result!.details[0]).toContain("Threshold: 5");
      expect(result!.details[1]).toContain("2026-01-01");
    });

    it("triggers when critical count exceeds threshold", () => {
      const result = evaluateAuditCritical(
        { threshold: 2 },
        10,
        new Date("2026-01-01"),
      );
      expect(result).not.toBeNull();
      expect(result!.summary).toContain("10 critical issues");
    });

    it("handles null audit date gracefully", () => {
      const result = evaluateAuditCritical({ threshold: 1 }, 5, null);
      expect(result).not.toBeNull();
      expect(result!.details[1]).toContain("unknown");
    });
  });
});
