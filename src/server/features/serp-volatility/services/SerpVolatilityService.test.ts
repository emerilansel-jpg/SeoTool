import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {}, waitUntil: vi.fn() }));

import { parseTopMovers } from "./SerpVolatilityService";

describe("parseTopMovers", () => {
  it("parses valid top movers JSON", () => {
    const json = JSON.stringify([
      { keyword: "seo tool", change: 3, currentPosition: 5, previousPosition: 8 },
      { keyword: "rank tracker", change: -2 },
    ]);
    const movers = parseTopMovers(json);
    expect(movers).toHaveLength(2);
    expect(movers[0]).toMatchObject({ keyword: "seo tool", change: 3 });
  });

  it("returns empty array for null/empty json", () => {
    expect(parseTopMovers(null)).toEqual([]);
    expect(parseTopMovers("")).toEqual([]);
  });

  it("drops malformed entries instead of throwing", () => {
    const json = JSON.stringify([
      { keyword: "ok", change: 1 },
      { keyword: 42, change: 1 },
      { keyword: "missing change" },
      "not-an-object",
    ]);
    const movers = parseTopMovers(json);
    expect(movers).toEqual([{ keyword: "ok", change: 1 }]);
  });

  it("returns empty array for non-array or invalid JSON", () => {
    expect(parseTopMovers('{"keyword":"x"}')).toEqual([]);
    expect(parseTopMovers("not json at all")).toEqual([]);
  });
});
