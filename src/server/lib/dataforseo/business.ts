import { z } from "zod";
import {
  BusinessDataBusinessListingsSearchLiveRequestInfo,
  BusinessDataGoogleMyBusinessInfoLiveRequestInfo,
  BusinessDataGoogleQuestionsAndAnswersLiveRequestInfo,
  BusinessDataGoogleReviewsTaskPostRequestInfo,
  type BusinessDataBusinessListingsSearchLiveItem,
} from "dataforseo-client";
import { businessDataApi } from "@/server/lib/dataforseo/core";
import {
  assertOk,
  buildTaskBilling,
  type DataforseoApiResponse,
} from "@/server/lib/dataforseo/envelope";

type BusinessListingItem = BusinessDataBusinessListingsSearchLiveItem;

export async function fetchBusinessListingsSearch(input: {
  categories?: string[];
  title?: string;
  locationCoordinate: string;
  orderBy?: string[];
  limit: number;
}): Promise<DataforseoApiResponse<BusinessListingItem[]>> {
  const response = await businessDataApi().businessListingsSearchLive([
    new BusinessDataBusinessListingsSearchLiveRequestInfo({
      categories: input.categories,
      title: input.title,
      location_coordinate: input.locationCoordinate,
      order_by: input.orderBy,
      limit: input.limit,
    }),
  ]);
  // "No Search Results" (40501) is a valid empty result for obscure
  // businesses/keywords — DataForSEO still charges for it, so treat it as an
  // empty success instead of surfacing a charged-task error to the user.
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  return {
    data: task.result?.[0]?.items ?? [],
    billing: buildTaskBilling(task),
  };
}

// Q&A results carry both answered (`items`) and unanswered
// (`items_without_answers`) rows; the SDK types this result as `any`, so we
// validate a generic record shape and flatten both.
const questionsResultSchema = z
  .object({
    items: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
    items_without_answers: z
      .array(z.record(z.string(), z.unknown()))
      .nullable()
      .optional(),
  })
  .passthrough();

function combinedQuestionItems(results: unknown): Record<string, unknown>[] {
  const list = Array.isArray(results) ? results : [];
  return list.flatMap((result) => {
    const parsed = questionsResultSchema.safeParse(result ?? {});
    if (!parsed.success) return [];
    return [
      ...(parsed.data.items ?? []),
      ...(parsed.data.items_without_answers ?? []),
    ];
  });
}

// Google Business Profile entity for a local establishment: NAP, category,
// rating (value + count), coordinates. Items are loosely typed in the SDK, so
// the fields we consume are narrowed with an explicit guard (oxlint pattern).
const myBusinessInfoItemSchema = z
  .object({
    title: z.string().nullish(),
    address: z.string().nullish(),
    phone: z.string().nullish(),
    url: z.string().nullish(),
    domain: z.string().nullish(),
    category: z.string().nullish(),
    cid: z.string().nullish(),
    latitude: z.number().nullish(),
    longitude: z.number().nullish(),
    rating: z
      .object({
        rating_type: z.string().nullish(),
        value: z.number().nullish(),
        votes_count: z.number().nullish(),
      })
      .nullish(),
  })
  .passthrough();

export type MyBusinessInfoItem = z.infer<typeof myBusinessInfoItemSchema>;

/** Google Business Profile info for one establishment (live endpoint). */
export async function fetchMyBusinessInfo(input: {
  keyword: string;
  locationCode?: number;
  locationCoordinate?: string;
  languageCode?: string;
}): Promise<DataforseoApiResponse<MyBusinessInfoItem | null>> {
  const response = await businessDataApi().googleMyBusinessInfoLive([
    new BusinessDataGoogleMyBusinessInfoLiveRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      location_coordinate: input.locationCoordinate,
      language_code: input.languageCode,
    }),
  ]);
  // "No Search Results" (40501) is a valid empty result for obscure
  // businesses/keywords — DataForSEO still charges for it, so treat it as an
  // empty success instead of surfacing a charged-task error to the user.
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  const raw = task.result?.[0]?.items?.[0] ?? null;
  const parsed = raw ? myBusinessInfoItemSchema.safeParse(raw) : null;
  return {
    data: parsed?.success ? parsed.data : null,
    billing: buildTaskBilling(task),
  };
}

// ---------------------------------------------------------------------------
// Google reviews (task_post/task_get flow — no live endpoint in the API)
// ---------------------------------------------------------------------------

export type GoogleReviewItem = {
  reviewId: string | null;
  author: string | null;
  rating: number | null;
  text: string | null;
  createdAt: string | null;
  ownerAnswer: string | null;
};

/** Reviews text is loosely typed in the SDK; narrow the fields we consume. */
const reviewItemSchema = z
  .object({
    review_id: z.string().nullish(),
    profile_name: z.string().nullish(),
    rating: z
      .object({ value: z.number().nullish() })
      .nullish(),
    review_text: z.string().nullish(),
    timestamp: z.string().nullish(),
    owner_answer: z.string().nullish(),
  })
  .passthrough();

export async function postGoogleReviewsTask(input: {
  keyword: string;
  locationCode?: number;
  locationCoordinate?: string;
  languageCode?: string;
  depth?: number;
}): Promise<DataforseoApiResponse<{ taskId: string }>> {
  const response = await businessDataApi().googleReviewsTaskPost([
    new BusinessDataGoogleReviewsTaskPostRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      location_coordinate: input.locationCoordinate,
      language_code: input.languageCode,
      depth: input.depth,
    }),
  ]);
  const task = assertOk(response);
  return {
    data: { taskId: task.id ?? "" },
    billing: buildTaskBilling(task),
  };
}

/** Fetch completed reviews for a posted task; returns null while still pending. */
export async function fetchGoogleReviewsTask(taskId: string): Promise<
  DataforseoApiResponse<GoogleReviewItem[] | null>
> {
  const response = await businessDataApi().googleReviewsTaskGet(taskId);
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  if (task.status_code === 40601 || task.status_code === 40602) {
    // Task queued/in progress — tell the caller to poll again.
    return { data: null, billing: buildTaskBilling(task) };
  }
  const reviews = (task.result?.[0]?.items ?? [])
    .map((item) => reviewItemSchema.safeParse(item))
    .filter((parsed) => parsed.success)
    .map((parsed) => ({
      reviewId: parsed.data.review_id ?? null,
      author: parsed.data.profile_name ?? null,
      rating: parsed.data.rating?.value ?? null,
      text: parsed.data.review_text ?? null,
      createdAt: parsed.data.timestamp ?? null,
      ownerAnswer: parsed.data.owner_answer ?? null,
    }));
  return { data: reviews, billing: buildTaskBilling(task) };
}

export async function fetchQuestionsAnswers(input: {
  keyword: string;
  locationCoordinate: string;
  languageCode: string;
  depth: number;
}): Promise<DataforseoApiResponse<Record<string, unknown>[]>> {
  const response = await businessDataApi().googleQuestionsAndAnswersLive([
    new BusinessDataGoogleQuestionsAndAnswersLiveRequestInfo({
      keyword: input.keyword,
      location_coordinate: input.locationCoordinate,
      language_code: input.languageCode,
      depth: input.depth,
    }),
  ]);
  // "No Search Results" (40501) is a valid empty result for obscure
  // businesses/keywords — DataForSEO still charges for it, so treat it as an
  // empty success instead of surfacing a charged-task error to the user.
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  return {
    data: combinedQuestionItems(task.result),
    billing: buildTaskBilling(task),
  };
}
