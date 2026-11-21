import { createDataforseoClient } from "@/server/lib/dataforseo";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { AppError } from "@/server/lib/errors";
import {
  GbpRepository,
  type GbpProfileSnapshot,
} from "../repositories/GbpRepository";

// google_reviews is a task_post/task_get flow; tasks usually finish within
// 5-30 seconds. Poll until the deadline, then hand the task id back to the
// client so it can call the status endpoint again.
const REVIEWS_POLL_BUDGET_MS = 55_000;
const REVIEWS_POLL_INTERVAL_MS = 4_000;

async function fetchProfile(
  input: {
    projectId: string;
    keyword: string;
    locationCode?: number;
    languageCode?: string;
  },
  billingCustomer: BillingCustomerContext,
): Promise<GbpProfileSnapshot> {
  if (!input.keyword.trim()) {
    throw new AppError("VALIDATION_ERROR", "A business keyword is required.");
  }
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const dataforseo = createDataforseoClient(billingCustomer);
  const item = await dataforseo.business.myBusinessInfo({
    keyword: input.keyword.trim(),
    locationCode,
    languageCode,
  });
  if (!item) {
    throw new AppError(
      "NOT_FOUND",
      "No Google Business Profile matched that keyword and location. Try adding the city or the CID.",
    );
  }
  const profile: GbpProfileSnapshot = {
    title: item.title ?? null,
    address: item.address ?? null,
    phone: item.phone ?? null,
    url: item.url ?? null,
    category: item.category ?? null,
    ratingValue: item.rating?.value ?? null,
    ratingCount: item.rating?.votes_count ?? null,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
  };
  await GbpRepository.upsertProfile({
    projectId: input.projectId,
    organizationId: billingCustomer.organizationId,
    keyword: input.keyword.trim(),
    locationCode,
    languageCode,
    profile,
  });
  return profile;
}

async function getProfile(projectId: string) {
  return GbpRepository.getProfile(projectId);
}

async function listReviews(projectId: string, limit?: number) {
  return GbpRepository.listReviews(projectId, limit);
}

/** Post the reviews task and poll until results land (or the budget runs out). */
async function fetchReviews(
  input: {
    projectId: string;
    keyword: string;
    locationCode?: number;
    languageCode?: string;
    depth?: number;
  },
  billingCustomer: BillingCustomerContext,
): Promise<{ taskId: string; status: "done" | "pending"; fetched: number }> {
  if (!input.keyword.trim()) {
    throw new AppError("VALIDATION_ERROR", "A business keyword is required.");
  }
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const dataforseo = createDataforseoClient(billingCustomer);

  const posted = await dataforseo.business.reviewsTaskPost({
    keyword: input.keyword.trim(),
    locationCode,
    languageCode,
    depth: input.depth ?? 20,
  });
  const taskId = posted.taskId;
  if (!taskId) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO did not return a task id.",
    );
  }

  const deadline = Date.now() + REVIEWS_POLL_BUDGET_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) =>
      setTimeout(resolve, REVIEWS_POLL_INTERVAL_MS),
    );
    const result = await dataforseo.business.reviewsTaskGet(taskId);
    if (result) {
      const fetched = await GbpRepository.upsertReviews({
        projectId: input.projectId,
        organizationId: billingCustomer.organizationId,
        reviews: result.map((review) => ({
          reviewId: review.reviewId ?? crypto.randomUUID(),
          author: review.author,
          rating: review.rating === null ? null : Math.round(review.rating),
          text: review.text?.slice(0, 4000) ?? null,
          ownerAnswer: review.ownerAnswer?.slice(0, 4000) ?? null,
          reviewedAt: review.createdAt,
        })),
      });
      return { taskId, status: "done", fetched };
    }
  }
  return { taskId, status: "pending", fetched: 0 };
}

/** Check a previously posted task without re-posting (client polling path). */
async function checkReviewsTask(
  input: { projectId: string; taskId: string },
  billingCustomer: BillingCustomerContext,
): Promise<{ status: "done" | "pending"; fetched: number }> {
  const dataforseo = createDataforseoClient(billingCustomer);
  const result = await dataforseo.business.reviewsTaskGet(input.taskId);
  if (!result) return { status: "pending", fetched: 0 };
  const fetched = await GbpRepository.upsertReviews({
    projectId: input.projectId,
    organizationId: billingCustomer.organizationId,
    reviews: result.map((review) => ({
      reviewId: review.reviewId ?? crypto.randomUUID(),
      author: review.author,
      rating: review.rating === null ? null : Math.round(review.rating),
      text: review.text?.slice(0, 4000) ?? null,
      ownerAnswer: review.ownerAnswer?.slice(0, 4000) ?? null,
      reviewedAt: review.createdAt,
    })),
  });
  return { status: "done", fetched };
}

export const GbpService = {
  fetchProfile,
  getProfile,
  listReviews,
  fetchReviews,
  checkReviewsTask,
};
