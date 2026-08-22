import { AppError } from "@/server/lib/errors";

interface DataForSeoLiveTask {
  id: string;
  status_code: number;
  status_message: string;
  tag?: string;
  result?: Array<{
    items?: Array<{
      type?: string;
      title?: string;
      rank_group?: number;
      rank_absolute?: number;
    }>;
  }>;
}

export interface GridScanResult {
  /** Snapshot id carried through the DataForSEO task `tag`. */
  nodeId: string;
  /** Rank of the target business at this grid point (null = not found in top results). */
  rank: number | null;
  /** False when the DataForSEO task itself errored for this node. */
  ok: boolean;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Find the rank of `targetBusinessName` inside a Maps SERP item list. */
function findBusinessRank(
  items: Array<{ type?: string; title?: string; rank_group?: number; rank_absolute?: number }>,
  targetBusinessName: string,
): number | null {
  const target = normalize(targetBusinessName);
  if (!target) return null;

  for (const item of items) {
    if (item.type !== "maps_search" || !item.title) continue;
    if (normalize(item.title) === target) {
      return item.rank_group || item.rank_absolute || null;
    }
  }
  // Fallback for titles with extra suffixes ("Milkwood Restaurant - San Diego").
  for (const item of items) {
    if (item.type !== "maps_search" || !item.title) continue;
    if (normalize(item.title).startsWith(target) || normalize(item.title).includes(target)) {
      return item.rank_group || item.rank_absolute || null;
    }
  }

  return null;
}

export class GmbGridService {
  constructor(private readonly env: Record<string, string | undefined> = {}) {}

  private getAuthHeader(): string {
    const login = this.env?.DATAFORSEO_LOGIN || process.env.DATAFORSEO_LOGIN;
    const password =
      this.env?.DATAFORSEO_PASSWORD || process.env.DATAFORSEO_PASSWORD;
    if (!login || !password) {
      throw new AppError("INTERNAL_ERROR", "DataForSEO credentials missing");
    }
    return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
  }

  /**
   * Scan every grid node with the synchronous Maps live/advanced endpoint.
   * Tasks are posted in chunks; every task carries `tag` = snapshot id so the
   * response maps straight back to the node it belongs to.
   */
  async scanGridLive(
    keyword: string,
    businessName: string,
    nodes: Array<{ lat: number; lng: number; id: string }>,
  ): Promise<GridScanResult[]> {
    const CHUNK_SIZE = 25;
    const results: GridScanResult[] = [];

    for (let offset = 0; offset < nodes.length; offset += CHUNK_SIZE) {
      const chunk = nodes.slice(offset, offset + CHUNK_SIZE);
      const tasks = chunk.map((node) => ({
        keyword,
        location_coordinate: `${node.lat},${node.lng}`,
        language_code: "en",
        depth: 20,
        tag: node.id,
      }));

      const response = await fetch(
        "https://api.dataforseo.com/v3/serp/google/maps/live/advanced",
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tasks),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `DataForSEO maps live error (chunk ${offset}): ${errorText.slice(0, 500)}`,
        );
        for (const node of chunk) {
          results.push({ nodeId: node.id, rank: null, ok: false });
        }
        continue;
      }

      const data = (await response.json()) as { tasks?: DataForSeoLiveTask[] };
      const byTag = new Map<string, DataForSeoLiveTask>();
      for (const task of data.tasks ?? []) {
        if (task.tag) byTag.set(task.tag, task);
      }

      for (const node of chunk) {
        const task = byTag.get(node.id);
        if (!task || task.status_code !== 20000) {
          results.push({ nodeId: node.id, rank: null, ok: false });
          continue;
        }
        const items = task.result?.[0]?.items ?? [];
        results.push({
          nodeId: node.id,
          rank: findBusinessRank(items, businessName),
          ok: true,
        });
      }
    }

    return results;
  }

  async getRankedKeywordsForDomain(domain: string): Promise<string[]> {
    try {
      const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
      const host = url.hostname.replace('www.', '');

      const response = await fetch("https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live", {
        method: "POST",
        headers: {
          "Authorization": this.getAuthHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify([{
          target: host,
          location_code: 2840,
          language_code: "en",
          limit: 10
        }])
      });

      if (!response.ok) return [];

      const data = (await response.json()) as {
        tasks?: Array<{ result?: Array<{ items?: Array<{ keyword_data?: { keyword?: string } }> }> }>;
      };
      const items = data.tasks?.[0]?.result?.[0]?.items || [];
      return items
        .map((i) => i.keyword_data?.keyword)
        .filter((k): k is string => typeof k === "string");
    } catch (err) {
      console.error("Failed to extract keywords for domain", err);
      return [];
    }
  }

  async verifyMapsRankings(keywords: string[], targetPlaceId: string, lat: number, lng: number) {
    if (!keywords.length) return [];

    const tasks = keywords.map(kw => ({
      keyword: kw,
      location_coordinate: `${lat},${lng}`,
      language_code: "en",
      depth: 20
    }));

    const response = await fetch("https://api.dataforseo.com/v3/serp/google/maps/live/advanced", {
      method: "POST",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(tasks)
    });

    if (!response.ok) return [];

    const data = (await response.json()) as {
      tasks?: Array<{
        result?: Array<{
          items?: Array<{ type?: string; place_id?: string; rank_group?: number; rank_absolute?: number }>;
        }>;
      }>;
    };
    const verified: Array<{ keyword: string; rank: number }> = [];

    const resultTasks = data.tasks || [];
    for (let i = 0; i < resultTasks.length; i++) {
      const task = resultTasks[i];
      const items = task.result?.[0]?.items || [];
      const originalKeyword = keywords[i];

      for (const item of items) {
        if (item.type === "maps_search" && item.place_id === targetPlaceId) {
          verified.push({
            keyword: originalKeyword,
            rank: item.rank_group || item.rank_absolute || 1,
          });
          break;
        }
      }
    }

    return verified;
  }

}
