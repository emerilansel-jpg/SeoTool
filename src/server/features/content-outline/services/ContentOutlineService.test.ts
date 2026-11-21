import { describe, expect, it } from "vitest";
import { extractHeadings } from "./headingExtractor";

describe("extractHeadings", () => {
  it("extracts h2 and h3 text from HTML", () => {
    const html = `
      <html><body>
        <h1>Not included</h1>
        <h2 class="wp-block">Why local SEO matters</h2>
        <p>text</p>
        <H3>NAP consistency</H3>
        <h2>  Another <em>heading</em> </h2>
      </body></html>
    `;
    const result = extractHeadings(html);
    expect(result.h2s).toEqual(["Why local SEO matters", "Another heading"]);
    expect(result.h3s).toEqual(["NAP consistency"]);
  });

  it("returns empty arrays for pages without headings", () => {
    expect(extractHeadings("<p>just text</p>")).toEqual({ h2s: [], h3s: [] });
  });
});
