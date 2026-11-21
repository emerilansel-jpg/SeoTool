import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { gbpProfiles, gbpReviews } from "@/db/schema";

export type GbpProfile = typeof gbpProfiles.$inferSelect;
export type GbpReview = typeof gbpReviews.$inferSelect;

export type GbpProfileSnapshot = {
  title: string | null;
  address: string | null;
  phone: string | null;
  url: string | null;
  category: string | null;
  ratingValue: number | null;
  ratingCount: number | null;
  latitude: number | null;
  longitude: number | null;
};

async function getProfile(projectId: string): Promise<GbpProfile | null> {
  const rows = await db
    .select()
    .from(gbpProfiles)
    .where(eq(gbpProfiles.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

async function upsertProfile(input: {
  projectId: string;
  organizationId: string;
  keyword: string;
  locationCode: number;
  languageCode: string;
  profile: GbpProfileSnapshot;
}): Promise<GbpProfile> {
  const [row] = await db
    .insert(gbpProfiles)
    .values({
      id: crypto.randomUUID(),
      projectId: input.projectId,
      organizationId: input.organizationId,
      keyword: input.keyword,
      locationCode: input.locationCode,
      languageCode: input.languageCode,
      profileJson: JSON.stringify(input.profile),
      fetchedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: gbpProfiles.projectId,
      set: {
        keyword: input.keyword,
        locationCode: input.locationCode,
        languageCode: input.languageCode,
        profileJson: JSON.stringify(input.profile),
        fetchedAt: new Date().toISOString(),
      },
    })
    .returning();
  if (!row) throw new Error("Failed to upsert gbp_profiles");
  return row;
}

async function upsertReviews(input: {
  projectId: string;
  organizationId: string;
  reviews: Array<{
    reviewId: string;
    author: string | null;
    rating: number | null;
    text: string | null;
    ownerAnswer: string | null;
    reviewedAt: string | null;
  }>;
}): Promise<number> {
  if (input.reviews.length === 0) return 0;
  for (const review of input.reviews) {
    await db
      .insert(gbpReviews)
      .values({
        id: crypto.randomUUID(),
        projectId: input.projectId,
        organizationId: input.organizationId,
        reviewId: review.reviewId,
        author: review.author,
        rating: review.rating,
        text: review.text,
        ownerAnswer: review.ownerAnswer,
        reviewedAt: review.reviewedAt,
        fetchedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: [gbpReviews.projectId, gbpReviews.reviewId],
        set: {
          author: review.author,
          rating: review.rating,
          text: review.text,
          ownerAnswer: review.ownerAnswer,
          reviewedAt: review.reviewedAt,
          fetchedAt: new Date().toISOString(),
        },
      });
  }
  return input.reviews.length;
}

async function listReviews(
  projectId: string,
  limit = 100,
): Promise<GbpReview[]> {
  return db
    .select()
    .from(gbpReviews)
    .where(eq(gbpReviews.projectId, projectId))
    .orderBy(
      desc(sql`coalesce(${gbpReviews.reviewedAt}, ${gbpReviews.fetchedAt})`),
    )
    .limit(limit);
}

export const GbpRepository = {
  getProfile,
  upsertProfile,
  upsertReviews,
  listReviews,
};
