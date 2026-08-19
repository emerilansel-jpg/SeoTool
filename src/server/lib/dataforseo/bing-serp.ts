import {
  SerpApiStopCrawlOnMatchInfo,
  SerpBingOrganicLiveAdvancedRequestInfo,
  SerpBingOrganicTaskPostRequestInfo,
} from "dataforseo-client";
import { serpApi } from "@/server/lib/dataforseo/core";
import { MAX_TASKS_PER_POST } from "@/server/lib/dataforseo/shared";
import {
  assertOk,
  buildTaskBilling,
  isNoResultsTask,
  parseTaskItems,
  type DataforseoApiResponse,
} from "@/server/lib/dataforseo/envelope";
import { AppError } from "@/server/lib/errors";
import {
  extractSerpItems,
  serpSnapshotItemSchema,
  type RankCheckResult,
  type RankCheckTaskInput,
  type PostedRankCheckTask,
  type SerpLiveItem,
  type SerpSnapshotRow,
} from "@/server/lib/dataforseo/serp";

// Re-export for sections barrel
export type {
  RankCheckResult,
  RankCheckTaskInput,
  PostedRankCheckTask,
  SerpSnapshotRow,
};

function clampSerpDepth(depth: number): number {
  return Math.min(100, Math.max(10, depth));
}

function stopCrawlOnTarget(targetDomain: string) {
  return {
    stop_crawl_on_match: [
      new SerpApiStopCrawlOnMatchInfo({
        match_value: targetDomain,
        match_type: "with_subdomains",
      }),
    ],
    find_targets_in: ["organic"],
  };
}

function buildBingRankCheckResult(
  input: { keywordId: string; keyword: string; targetDomain: string },
  items: SerpLiveItem[],
): RankCheckResult {
  const target = input.targetDomain.toLowerCase();
  const organicMatch = items.find((item) => {
    if (item.type !== "organic" || item.domain == null) return false;
    const domain = item.domain.toLowerCase();
    return domain === target || domain.endsWith(`.${target}`);
  });

  const serpItems = extractSerpItems(items, input.targetDomain);

  return {
    keywordId: input.keywordId,
    keyword: input.keyword,
    position: organicMatch
      ? (organicMatch.rank_group ?? organicMatch.rank_absolute ?? null)
      : null,
    url: organicMatch?.url ?? null,
    serpFeatures: [...new Set(items.map((item) => item.type).filter(Boolean))],
    serpItems,
  };
}

export async function fetchBingRankCheckSerp(input: {
  keyword: string;
  keywordId: string;
  locationCode: number;
  languageCode: string;
  device: "desktop" | "mobile";
  targetDomain: string;
  depth: number;
}): Promise<DataforseoApiResponse<RankCheckResult>> {
  const depth = clampSerpDepth(input.depth);
  const response = await serpApi().bingOrganicLiveAdvanced([
    new SerpBingOrganicLiveAdvancedRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      language_code: input.languageCode,
      device: input.device,
      os: input.device === "desktop" ? "windows" : "android",
      depth,
      ...stopCrawlOnTarget(input.targetDomain),
    }),
  ]);

  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  const items = parseTaskItems(
    "bing-organic-live-advanced",
    task,
    serpSnapshotItemSchema,
  );

  return {
    data: buildBingRankCheckResult(input, items),
    billing: buildTaskBilling(task),
  };
}

export async function postBingRankCheckTasks(input: {
  tasks: RankCheckTaskInput[];
  locationCode: number;
  languageCode: string;
  depth: number;
  targetDomain: string;
}): Promise<DataforseoApiResponse<PostedRankCheckTask[]>> {
  if (input.tasks.length === 0 || input.tasks.length > MAX_TASKS_PER_POST) {
    throw new AppError(
      "INTERNAL_ERROR",
      `task_post accepts 1-${MAX_TASKS_PER_POST} tasks, got ${input.tasks.length}`,
    );
  }
  const depth = clampSerpDepth(input.depth);
  const response = await serpApi().bingOrganicTaskPost(
    input.tasks.map(
      (task) =>
        new SerpBingOrganicTaskPostRequestInfo({
          keyword: task.keyword,
          location_code: input.locationCode,
          language_code: input.languageCode,
          device: task.device,
          os: task.device === "desktop" ? "windows" : "android",
          depth,
          ...stopCrawlOnTarget(input.targetDomain),
          tag: `${task.keywordId}:${task.device}`,
        }),
    ),
  );

  if (!response || response.status_code !== 20000) {
    throw new AppError(
      "INTERNAL_ERROR",
      response?.status_message || "DataForSEO bing task_post failed",
    );
  }

  const byTag = new Map(
    input.tasks.map((task) => [`${task.keywordId}:${task.device}`, task]),
  );
  const posted: PostedRankCheckTask[] = [];
  let costUsd = 0;
  for (const entry of response.tasks ?? []) {
    costUsd += entry.cost ?? 0;
    const tag: unknown = entry.data?.tag;
    const task = typeof tag === "string" ? byTag.get(tag) : undefined;
    if (entry.status_code !== 20100 || !entry.id || !task) {
      console.warn(
        `dataforseo.bing.task_post.rejected-entry (${entry.status_code}): ${entry.status_message}`,
      );
      continue;
    }
    posted.push({ ...task, taskId: entry.id });
  }

  return {
    data: posted,
    billing: {
      path: ["v3", "serp", "bing", "organic", "task_post"],
      costUsd,
    },
  };
}

const TASK_IN_PROGRESS_STATUS_CODES = new Set([20100, 40601, 40602]);

type RankCheckTaskOutcome =
  | { status: "pending" }
  | { status: "failed"; message: string }
  | { status: "completed"; result: RankCheckResult };

export async function fetchBingRankCheckTaskResult(input: {
  taskId: string;
  keywordId: string;
  keyword: string;
  targetDomain: string;
}): Promise<RankCheckTaskOutcome> {
  const response = await serpApi().bingOrganicTaskGetAdvanced(input.taskId);
  const task = response?.tasks?.[0];
  if (!response || response.status_code !== 20000 || !task) {
    throw new AppError(
      "INTERNAL_ERROR",
      response?.status_message || "DataForSEO bing task_get failed",
    );
  }

  if (
    task.status_code !== undefined &&
    TASK_IN_PROGRESS_STATUS_CODES.has(task.status_code)
  ) {
    return { status: "pending" };
  }

  if (task.status_code !== 20000) {
    if (!isNoResultsTask(task)) {
      return {
        status: "failed",
        message:
          task.status_message ||
          `DataForSEO bing task failed (${task.status_code})`,
      };
    }
    return {
      status: "completed",
      result: buildBingRankCheckResult(input, []),
    };
  }

  const items = parseTaskItems(
    "bing-organic-task-get-advanced",
    task,
    serpSnapshotItemSchema,
  );
  return {
    status: "completed",
    result: buildBingRankCheckResult(input, items),
  };
}
