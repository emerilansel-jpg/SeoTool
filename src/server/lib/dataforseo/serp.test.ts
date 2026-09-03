import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/lib/runtime-env", () => ({
  getRequiredEnvValue: vi.fn(async () => "test-api-key"),
}));

import {
  fetchRankCheckTaskResult,
  postRankCheckTasks,
  extractSerpItems,
  type SerpLiveItem,
} from "@/server/lib/dataforseo/serp";
import {
  fetchMapsTaskResult,
  postMapsTasks,
} from "@/server/lib/dataforseo/maps-serp";

function parseDataforseoRequestBody(init: RequestInit | undefined): unknown {
  const body = init?.body;
  if (typeof body !== "string") {
    throw new Error("Expected DataForSEO request body to be a string");
  }
  return JSON.parse(body) as unknown;
}

describe("rank check task queue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts queued tasks, maps ids by tag, and sums cost over all entries", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [
          {
            id: "task-a",
            status_code: 20100,
            cost: 0.0006,
            data: { tag: "kw-1:desktop" },
          },
          {
            id: "task-b",
            status_code: 20100,
            cost: 0.0006,
            data: { tag: "kw-1:mobile" },
          },
          {
            id: "task-c",
            status_code: 40006,
            status_message: "Task Limit Exceeded",
            cost: 0.0006,
            data: { tag: "kw-2:desktop" },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await postRankCheckTasks({
      tasks: [
        { keyword: "alpha", keywordId: "kw-1", device: "desktop" },
        { keyword: "alpha", keywordId: "kw-1", device: "mobile" },
        { keyword: "beta", keywordId: "kw-2", device: "desktop" },
      ],
      locationCode: 2840,
      languageCode: "en",
      depth: 20,
      targetDomain: "example.com",
    });

    expect(
      fetchMock.mock.calls.map(([url]) =>
        typeof url === "string" || url instanceof URL
          ? url.toString()
          : url.url,
      ),
    ).toEqual(["https://api.dataforseo.com/v3/serp/google/organic/task_post"]);

    // Every posted task asks DataForSEO to stop crawling at the target's
    // organic listing — that is what cuts the actual crawl cost for ranking
    // domains without false "not ranking" stops on sitelinks/PAA mentions.
    const stopCrawl = {
      stop_crawl_on_match: [
        { match_value: "example.com", match_type: "with_subdomains" },
      ],
      find_targets_in: ["organic"],
    };
    expect(
      parseDataforseoRequestBody(fetchMock.mock.calls[0]?.[1]),
    ).toMatchObject([stopCrawl, stopCrawl, stopCrawl]);
    expect(result.data).toEqual([
      {
        keyword: "alpha",
        keywordId: "kw-1",
        device: "desktop",
        taskId: "task-a",
      },
      {
        keyword: "alpha",
        keywordId: "kw-1",
        device: "mobile",
        taskId: "task-b",
      },
    ]);
    // The rejected entry's cost is still metered: a charge is a charge.
    expect(result.billing.costUsd).toBeCloseTo(0.0018, 10);
    expect(result.billing.path).toEqual([
      "v3",
      "serp",
      "google",
      "organic",
      "task_post",
    ]);
  });

  it("reports a queued task still in progress as pending", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [{ id: "task-a", status_code: 40602 }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const outcome = await fetchRankCheckTaskResult({
      taskId: "task-a",
      keywordId: "kw-1",
      keyword: "alpha",
      targetDomain: "example.com",
    });

    expect(outcome).toEqual({ status: "pending" });
  });

  it("parses a completed queued task into a rank check result", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [
          {
            id: "task-a",
            status_code: 20000,
            cost: 0,
            path: ["v3", "serp", "google", "organic", "task_get", "advanced"],
            result: [
              {
                items: [
                  {
                    type: "organic",
                    rank_group: 3,
                    rank_absolute: 4,
                    domain: "www.example.com",
                    url: "https://www.example.com/page",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const outcome = await fetchRankCheckTaskResult({
      taskId: "task-a",
      keywordId: "kw-1",
      keyword: "alpha",
      targetDomain: "example.com",
    });

    expect(outcome).toMatchObject({
      status: "completed",
      result: {
        keywordId: "kw-1",
        keyword: "alpha",
        position: 3,
        url: "https://www.example.com/page",
        serpFeatures: ["organic"],
      },
    });
  });
});

describe("Google Maps task queue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts multiple standard tasks with zoom coordinates and maps ids from data.tag", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [
          {
            id: "maps-a",
            status_code: 20100,
            cost: 0.0006,
            data: { tag: "snapshot-a" },
          },
          {
            id: "maps-b",
            status_code: 20100,
            cost: 0.0006,
            data: { tag: "snapshot-b" },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await postMapsTasks({
      tasks: [
        { snapshotId: "snapshot-a", keyword: "dentist", lat: -6.2, lng: 106.8 },
        {
          snapshotId: "snapshot-b",
          keyword: "dentist",
          lat: -6.21,
          lng: 106.81,
        },
      ],
      languageCode: "id",
      device: "mobile",
      zoom: 15,
      depth: 20,
    });

    expect(
      fetchMock.mock.calls.map(([url]) =>
        typeof url === "string" || url instanceof URL
          ? url.toString()
          : url.url,
      ),
    ).toEqual(["https://api.dataforseo.com/v3/serp/google/maps/task_post"]);
    expect(
      parseDataforseoRequestBody(fetchMock.mock.calls[0]?.[1]),
    ).toMatchObject([
      { location_coordinate: "-6.2,106.8,15z", tag: "snapshot-a" },
      { location_coordinate: "-6.21,106.81,15z", tag: "snapshot-b" },
    ]);
    expect(result.data).toEqual({
      tasks: [
        {
          snapshotId: "snapshot-a",
          keyword: "dentist",
          lat: -6.2,
          lng: 106.8,
          taskId: "maps-a",
        },
        {
          snapshotId: "snapshot-b",
          keyword: "dentist",
          lat: -6.21,
          lng: 106.81,
          taskId: "maps-b",
        },
      ],
      costUsd: 0.0012,
    });
  });

  it("uses exact place id when collecting the rank", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          status_code: 20000,
          tasks: [
            {
              id: "maps-a",
              status_code: 20000,
              result: [
                {
                  items: [
                    {
                      type: "maps_search",
                      title: "Acme",
                      place_id: "other",
                      rank_group: 1,
                    },
                    {
                      type: "maps_search",
                      title: "Acme",
                      place_id: "target",
                      rank_group: 5,
                    },
                  ],
                },
              ],
            },
          ],
        }),
      ),
    );

    await expect(
      fetchMapsTaskResult({
        taskId: "maps-a",
        placeId: "target",
        businessName: "Acme",
      }),
    ).resolves.toMatchObject({ status: "completed", rank: 5 });
  });
});

describe("extractSerpItems", () => {
  const items: SerpLiveItem[] = [
    {
      type: "organic",
      rank_group: 1,
      rank_absolute: 1,
      domain: "example.com",
      title: "First",
      url: "https://example.com/1",
      description: "Desc 1",
    },
    {
      type: "organic",
      rank_group: 2,
      rank_absolute: 2,
      domain: "competitor.com",
      title: "Second",
      url: "https://competitor.com/2",
      description: "Desc 2",
    },
    {
      type: "organic",
      rank_group: 3,
      rank_absolute: 3,
      domain: "sub.example.com",
      title: "Third (subdomain)",
      url: "https://sub.example.com/3",
      description: "Desc 3",
    },
    {
      type: "featured_snippet",
      rank_absolute: 0,
      domain: null,
      title: null,
      url: null,
      description: null,
    },
    {
      type: "organic",
      rank_group: 4,
      rank_absolute: 4,
      domain: "other.org",
      title: "Fourth",
      url: "https://other.org/4",
      description: null,
    },
  ] as SerpLiveItem[];

  it("extracts organic items only (excludes SERP features)", () => {
    const result = extractSerpItems(items, "example.com");
    expect(result).toHaveLength(4);
  });

  it("marks tracked domain correctly (including subdomains)", () => {
    const result = extractSerpItems(items, "example.com");
    expect(result[0].domain).toBe("example.com");
    expect(result[0].isTrackedDomain).toBe(true);
    expect(result[1].isTrackedDomain).toBe(false);
    expect(result[2].domain).toBe("sub.example.com");
    expect(result[2].isTrackedDomain).toBe(true);
  });

  it("respects maxItems limit", () => {
    const result = extractSerpItems(items, "example.com", 2);
    expect(result).toHaveLength(2);
  });

  it("handles empty items array", () => {
    expect(extractSerpItems([], "example.com")).toHaveLength(0);
  });

  it("handles null fields gracefully", () => {
    const nullItems = [
      {
        type: "organic",
        rank_group: null,
        rank_absolute: 5,
        domain: null,
        title: null,
        url: null,
        description: null,
      },
    ] as SerpLiveItem[];
    const result = extractSerpItems(nullItems, "example.com");
    expect(result).toHaveLength(1);
    expect(result[0].rank).toBe(5);
    expect(result[0].domain).toBeNull();
    expect(result[0].isTrackedDomain).toBe(false);
  });

  it("marks no items as tracked when target domain is not present", () => {
    const result = extractSerpItems(items, "nonexistent.com");
    expect(result.every((r) => !r.isTrackedDomain)).toBe(true);
  });
});
