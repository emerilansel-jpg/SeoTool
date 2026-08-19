// Slim DataForSEO client for the free AI visibility checker.
//
// The marketing site is a separate app from the SaaS backend, so this file
// mirrors just the one endpoint the checker needs
// (llm_mentions/aggregated_metrics/live) using the same DATAFORSEO_API_KEY
// env var and format as the app: base64 of login:password.

const DFS_BASE_URL = "https://api.dataforseo.com/v3";
const REQUEST_TIMEOUT_MS = 15_000;

/** ChatGPT mentions data only covers the US market per DataForSEO docs. */
const CHATGPT_LOCATION_CODE = 2840;
const CHATGPT_LANGUAGE_CODE = "en";

export class DfsConfigError extends Error {
  constructor() {
    super("DATAFORSEO_API_KEY is not configured");
    this.name = "DfsConfigError";
  }
}

export class DfsUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DfsUpstreamError";
  }
}

export type AiVisibilityMetrics = {
  mentions: number;
  aiSearchVolume: number;
};

type DfsAggregatedTotal = {
  platform?: Array<{
    key?: string | null;
    mentions?: number | null;
    ai_search_volume?: number | null;
  }> | null;
};

export function getDfsApiKey(): string | undefined {
  const key = process.env.DATAFORSEO_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : undefined;
}

/**
 * Fetch aggregated ChatGPT mention metrics for a bare domain (no scheme, no
 * www). One live DataForSEO call per uncached check; the caller is expected
 * to cache results (see routes/api/ai-visibility.ts).
 */
export async function fetchChatGptMentions(
  domain: string,
): Promise<AiVisibilityMetrics> {
  const apiKey = getDfsApiKey();
  if (!apiKey) {
    throw new DfsConfigError();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${DFS_BASE_URL}/ai_optimization/llm_mentions/aggregated_metrics/live`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${apiKey}`,
        },
        body: JSON.stringify([
          {
            target: [{ type: "domain", domain }],
            platform: "chat_gpt",
            location_code: CHATGPT_LOCATION_CODE,
            language_code: CHATGPT_LANGUAGE_CODE,
            internal_list_limit: 10,
          },
        ]),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new DfsUpstreamError(
        `DataForSEO responded with HTTP ${response.status}`,
      );
    }

    const payload = (await response.json()) as {
      status_code?: number;
      tasks?: Array<{
        status_code?: number;
        status_message?: string;
        result?: Array<{ total?: DfsAggregatedTotal } | null>;
      }>;
    };

    const task = payload.tasks?.[0];
    if (
      payload.status_code !== 20000 ||
      task?.status_code !== 20000 ||
      !task.result?.length
    ) {
      throw new DfsUpstreamError(
        task?.status_message ?? "DataForSEO returned no result",
      );
    }

    const chatGptRow = (task.result[0]?.total?.platform ?? []).find(
      (row) => row.key === "chat_gpt",
    );

    // A missing platform row means the domain is absent from the mentions
    // database, which is the checker's zero-mentions state, not an error.
    return {
      mentions: chatGptRow?.mentions ?? 0,
      aiSearchVolume: chatGptRow?.ai_search_volume ?? 0,
    };
  } catch (error) {
    if (error instanceof DfsUpstreamError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new DfsUpstreamError("The visibility check timed out");
    }
    throw new DfsUpstreamError("Could not reach the visibility data source");
  } finally {
    clearTimeout(timeout);
  }
}
