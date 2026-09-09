import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/lib/runtime-env", () => ({
  getRequiredEnvValue: vi.fn(async () => "test-api-key"),
}));

import { fetchLocalSerp } from "@/server/lib/dataforseo/serp";

describe("fetchLocalSerp", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("treats No Search Results as an empty array rather than throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          status_code: 20000,
          tasks: [
            {
              id: "task-no-results",
              status_code: 40102,
              status_message: "No Search Results.",
              cost: 0.002,
              path: ["v3", "serp", "google", "maps", "live", "advanced"],
              result: [
                {
                  items: null,
                },
              ],
            },
          ],
        }),
      ),
    );

    const outcome = await fetchLocalSerp({
      keyword: "unknown business xyz",
      locationCode: 2840,
      languageCode: "en",
      searchType: "maps",
      device: "mobile",
      depth: 20,
      searchPlaces: true,
    });

    expect(outcome.data).toEqual([]);
    expect(outcome.billing.costUsd).toBe(0.002);
  });

  it("returns items when results are found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          status_code: 20000,
          tasks: [
            {
              id: "task-results",
              status_code: 20000,
              cost: 0.002,
              path: ["v3", "serp", "google", "maps", "live", "advanced"],
              result: [
                {
                  items: [
                    {
                      type: "maps_search",
                      title: "Kopi Kenangan",
                      place_id: "place-123",
                      latitude: -6.2,
                      longitude: 106.8,
                    },
                  ],
                },
              ],
            },
          ],
        }),
      ),
    );

    const outcome = await fetchLocalSerp({
      keyword: "kopi kenangan",
      locationCode: 2360,
      languageCode: "id",
      searchType: "maps",
      device: "mobile",
      depth: 20,
      searchPlaces: true,
    });

    expect(outcome.data).toHaveLength(1);
    expect(outcome.data[0]).toMatchObject({
      title: "Kopi Kenangan",
      place_id: "place-123",
      latitude: -6.2,
      longitude: 106.8,
    });
  });
});
