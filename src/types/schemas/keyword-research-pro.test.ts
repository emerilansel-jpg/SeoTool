import { describe, expect, it } from "vitest";
import { keywordResearchProSchema } from "./keyword-research-pro";

function keywords(count: number) {
  return Array.from({ length: count }, (_, index) => `keyword ${index + 1}`);
}

describe("Keyword Research Pro request limits", () => {
  it("accepts 25 keywords for core research", () => {
    expect(
      keywordResearchProSchema.safeParse({
        projectId: "project-1",
        keywords: keywords(25),
        mode: "basic",
        billingMode: "standard",
      }).success,
    ).toBe(true);
  });

  it("limits backlink-deep research to 10 keywords", () => {
    const result = keywordResearchProSchema.safeParse({
      projectId: "project-1",
      keywords: keywords(11),
      mode: "full",
      billingMode: "standard",
    });
    expect(result.success).toBe(false);
  });

  it("requires a credential for BYOK", () => {
    const result = keywordResearchProSchema.safeParse({
      projectId: "project-1",
      keywords: ["local seo"],
      mode: "basic",
      billingMode: "byok",
    });
    expect(result.success).toBe(false);
  });
});
