import { z } from "zod";
import { SerpGoogleMapsTaskPostRequestInfo } from "dataforseo-client";
import {
  findGmbRank,
  formatMapsCoordinate,
} from "@/server/features/gmb-grid/gmb-grid";
import { AppError } from "@/server/lib/errors";
import { serpApi } from "./core";
import {
  isNoResultsTask,
  parseTaskItems,
  type DataforseoApiResponse,
} from "./envelope";
import { MAX_TASKS_PER_POST } from "./shared";

const mapsItemSchema = z
  .object({
    type: z.string().nullable().optional(),
    rank_group: z.number().nullable().optional(),
    rank_absolute: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    place_id: z.string().nullable().optional(),
    cid: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    gps_coordinates: z
      .object({
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
  })
  .passthrough();

export interface MapsTaskInput {
  snapshotId: string;
  keyword: string;
  lat: number;
  lng: number;
}

export interface PostedMapsTask extends MapsTaskInput {
  taskId: string;
}

function clampMapsDepth(depth: number) {
  return Math.min(100, Math.max(10, depth));
}

export async function postMapsTasks(input: {
  tasks: MapsTaskInput[];
  languageCode: string;
  device: "desktop" | "mobile";
  zoom: number;
  depth: number;
}): Promise<
  DataforseoApiResponse<{ tasks: PostedMapsTask[]; costUsd: number }>
> {
  if (input.tasks.length === 0 || input.tasks.length > MAX_TASKS_PER_POST) {
    throw new AppError(
      "INTERNAL_ERROR",
      `Maps task_post accepts 1-${MAX_TASKS_PER_POST} tasks, got ${input.tasks.length}`,
    );
  }

  const response = await serpApi().googleMapsTaskPost(
    input.tasks.map(
      (task) =>
        new SerpGoogleMapsTaskPostRequestInfo({
          keyword: task.keyword,
          location_coordinate: formatMapsCoordinate(
            task.lat,
            task.lng,
            input.zoom,
          ),
          language_code: input.languageCode,
          device: input.device,
          os: input.device === "desktop" ? "windows" : "android",
          depth: clampMapsDepth(input.depth),
          search_places: false,
          tag: task.snapshotId,
        }),
    ),
  );

  if (!response || response.status_code !== 20000) {
    throw new AppError(
      "INTERNAL_ERROR",
      response?.status_message || "DataForSEO Maps task_post failed",
    );
  }

  const bySnapshotId = new Map(
    input.tasks.map((task) => [task.snapshotId, task]),
  );
  const posted: PostedMapsTask[] = [];
  let costUsd = 0;
  for (const entry of response.tasks ?? []) {
    costUsd += entry.cost ?? 0;
    const tag: unknown = entry.data?.tag;
    const task = typeof tag === "string" ? bySnapshotId.get(tag) : undefined;
    if (entry.status_code !== 20100 || !entry.id || !task) {
      console.warn(
        `dataforseo.maps.task_post.rejected-entry (${entry.status_code}): ${entry.status_message}`,
      );
      continue;
    }
    posted.push({ ...task, taskId: entry.id });
  }

  return {
    data: { tasks: posted, costUsd },
    billing: {
      path: ["v3", "serp", "google", "maps", "task_post"],
      costUsd,
    },
  };
}

export type MapsTaskOutcome =
  | { status: "pending" }
  | { status: "failed"; code: string; message: string }
  | { status: "completed"; rank: number | null };

const TASK_IN_PROGRESS_STATUS_CODES = new Set([20100, 40601, 40602]);

export async function fetchMapsTaskResult(input: {
  taskId: string;
  placeId: string;
  businessName: string;
}): Promise<MapsTaskOutcome> {
  const response = await serpApi().googleMapsTaskGetAdvanced(input.taskId);
  const task = response?.tasks?.[0];
  if (!response || response.status_code !== 20000 || !task) {
    throw new AppError(
      "INTERNAL_ERROR",
      response?.status_message || "DataForSEO Maps task_get failed",
    );
  }

  if (
    task.status_code !== undefined &&
    TASK_IN_PROGRESS_STATUS_CODES.has(task.status_code)
  ) {
    return { status: "pending" };
  }

  if (task.status_code !== 20000) {
    if (isNoResultsTask(task)) return { status: "completed", rank: null };
    return {
      status: "failed",
      code: String(task.status_code ?? "PROVIDER_ERROR"),
      message:
        task.status_message || `DataForSEO task failed (${task.status_code})`,
    };
  }

  const items = parseTaskItems(
    "google-maps-task-get-advanced",
    task,
    mapsItemSchema,
  );
  return {
    status: "completed",
    rank: findGmbRank(items, {
      placeId: input.placeId,
      businessName: input.businessName,
    }),
  };
}
