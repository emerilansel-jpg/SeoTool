import { describe, expect, it } from "vitest";
import {
  scoreContent,
  type ContentScoreInput,
} from "@/server/features/content-intelligence/contentScore";

/** An ideal page: every sub-score is 100, so the overall score is 100. */
function perfectInput(): ContentScoreInput {
  return {
    wordCount: 1200,
    h1Count: 1,
    h2Count: 4,
    h3Count: 6,
    headingOrder: [1, 2, 3, 2, 3],
    title: "A Great Title About SEO Best Practices",
    metaDescription:
      "A comprehensive guide to SEO best practices covering technical, content, and outreach topics in detail for modern marketers.",
    hasOgTitle: true,
    hasOgDescription: true,
    imagesTotal: 5,
    imagesMissingAlt: 0,
    internalLinkCount: 8,
    externalLinkCount: 2,
    hasStructuredData: true,
    isIndexable: true,
    hasCanonical: true,
  };
}

const flag = (result: ReturnType<typeof scoreContent>, code: string) =>
  result.flags.find((f) => f.code === code);

describe("scoreContent", () => {
  it("scores an ideal page 100 with no flags", () => {
    const result = scoreContent(perfectInput());
    expect(result.score).toBe(100);
    expect(result.flags).toHaveLength(0);
    expect(result.subScores).toEqual({
      depth: 100,
      headings: 100,
      metadata: 100,
      media: 100,
      linking: 100,
      technical: 100,
    });
  });

  describe("depth (word count)", () => {
    it("flags no readable content as critical", () => {
      const result = scoreContent({ ...perfectInput(), wordCount: 0 });
      expect(result.subScores.depth).toBe(0);
      expect(flag(result, "no_content")?.severity).toBe("critical");
    });

    it("penalizes very thin content heavily", () => {
      const result = scoreContent({ ...perfectInput(), wordCount: 50 });
      expect(result.subScores.depth).toBe(15);
      expect(flag(result, "very_thin_content")).toBeTruthy();
    });

    it("marks thin content as a warning", () => {
      const result = scoreContent({ ...perfectInput(), wordCount: 200 });
      expect(result.subScores.depth).toBe(40);
      expect(flag(result, "thin_content")?.severity).toBe("warning");
    });

    it("scores short content as acceptable", () => {
      const result = scoreContent({ ...perfectInput(), wordCount: 400 });
      expect(result.subScores.depth).toBe(70);
    });

    it("slightly deducts for very lengthy content", () => {
      const result = scoreContent({ ...perfectInput(), wordCount: 5000 });
      expect(result.subScores.depth).toBe(80);
      expect(flag(result, "lengthy_content")).toBeTruthy();
    });
  });

  describe("headings", () => {
    it("flags a missing H1 as critical", () => {
      const result = scoreContent({
        ...perfectInput(),
        h1Count: 0,
        headingOrder: [2, 3],
      });
      expect(result.subScores.headings).toBe(50);
      expect(flag(result, "missing_h1")?.severity).toBe("critical");
    });

    it("warns on multiple H1 tags", () => {
      const result = scoreContent({
        ...perfectInput(),
        h1Count: 3,
        headingOrder: [1, 1, 1, 2, 3],
      });
      expect(result.subScores.headings).toBe(75);
      expect(flag(result, "multiple_h1")?.severity).toBe("warning");
    });

    it("warns when there are no H2 subheadings", () => {
      const result = scoreContent({
        ...perfectInput(),
        h2Count: 0,
        h3Count: 0,
        headingOrder: [1],
      });
      expect(result.subScores.headings).toBe(75);
      expect(flag(result, "no_h2")).toBeTruthy();
    });

    it("detects skipped heading levels", () => {
      const result = scoreContent({
        ...perfectInput(),
        headingOrder: [1, 2, 4, 2, 3],
      });
      expect(result.subScores.headings).toBe(90);
      expect(flag(result, "skipped_heading_level")).toBeTruthy();
    });
  });

  describe("metadata", () => {
    it("flags a missing title as critical", () => {
      const result = scoreContent({ ...perfectInput(), title: "" });
      expect(result.subScores.metadata).toBeLessThanOrEqual(50);
      expect(flag(result, "missing_title")?.severity).toBe("critical");
    });

    it("warns on a truncated (long) title", () => {
      const result = scoreContent({
        ...perfectInput(),
        title:
          "An Excessively Long Page Title That Will Almost Certainly Be Truncated By Search Engines In The Results",
      });
      expect(flag(result, "long_title")?.severity).toBe("warning");
    });

    it("warns on a missing meta description", () => {
      const result = scoreContent({
        ...perfectInput(),
        metaDescription: "",
      });
      expect(flag(result, "missing_meta_description")?.severity).toBe(
        "warning",
      );
    });
  });

  describe("media", () => {
    it("scores pages with no images as acceptable", () => {
      const result = scoreContent({
        ...perfectInput(),
        imagesTotal: 0,
        imagesMissingAlt: 0,
      });
      expect(result.subScores.media).toBe(60);
      expect(flag(result, "no_images")).toBeTruthy();
    });

    it("penalizes missing alt text proportionally", () => {
      const result = scoreContent({
        ...perfectInput(),
        imagesTotal: 5,
        imagesMissingAlt: 3,
      });
      expect(result.subScores.media).toBe(40);
      expect(flag(result, "images_missing_alt")).toBeTruthy();
    });
  });

  describe("linking", () => {
    it("warns when there are no internal links", () => {
      const result = scoreContent({ ...perfectInput(), internalLinkCount: 0 });
      expect(result.subScores.linking).toBe(50);
      expect(flag(result, "no_internal_links")).toBeTruthy();
    });

    it("notes a small number of internal links", () => {
      const result = scoreContent({ ...perfectInput(), internalLinkCount: 2 });
      expect(result.subScores.linking).toBe(80);
    });
  });

  describe("technical", () => {
    it("zeroes technical score for non-indexable pages", () => {
      const result = scoreContent({ ...perfectInput(), isIndexable: false });
      expect(result.subScores.technical).toBe(0);
      expect(flag(result, "not_indexable")?.severity).toBe("critical");
    });

    it("deducts for missing canonical and structured data", () => {
      const result = scoreContent({
        ...perfectInput(),
        hasCanonical: false,
        hasStructuredData: false,
      });
      expect(result.subScores.technical).toBe(60);
      expect(flag(result, "missing_canonical")).toBeTruthy();
      expect(flag(result, "no_structured_data")).toBeTruthy();
    });
  });

  it("still scores good content on a non-indexable page (flags the block)", () => {
    const result = scoreContent({ ...perfectInput(), isIndexable: false });
    // Depth/heading/metadata stay strong; only technical zeroes.
    expect(result.subScores.depth).toBe(100);
    expect(result.score).toBeLessThan(100);
    expect(flag(result, "not_indexable")).toBeTruthy();
  });
});
