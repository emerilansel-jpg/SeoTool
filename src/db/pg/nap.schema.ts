import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  real,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

// See src/db/pg/app.schema.ts for why timestamps are ISO-8601 UTC text.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// N.A.P Finder: citation audits for local businesses. Each run checks the
// business's Name/Address/Phone on the Google Business Profile and the major
// local directories via DataForSEO SERP, then stores per-directory verdicts.
export const napAudits = pgTable(
  "nap_audits",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    city: text("city").notNull(),
    // Reference NAP the directories are compared against.
    phone: text("phone"),
    address: text("address"),
    locationCode: integer("location_code").notNull().default(2840),
    languageCode: text("language_code").notNull().default("en"),
    // 0-100: share of checked sources whose phone/address matches the input.
    consistencyScore: integer("consistency_score"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("nap_audits_project_idx").on(table.projectId, table.createdAt),
    index("nap_audits_organization_idx").on(table.organizationId),
  ],
);

export const napResults = pgTable(
  "nap_results",
  {
    id: text("id").primaryKey(),
    auditId: text("audit_id")
      .notNull()
      .references(() => napAudits.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    // "google" or a directory host, e.g. "yelp.com".
    directory: text("directory").notNull(),
    // "consistent" | "mismatch" | "needs_review" | "not_found" | "error"
    status: text("status").notNull(),
    sourceUrl: text("source_url"),
    foundName: text("found_name"),
    foundPhone: text("found_phone"),
    foundAddress: text("found_address"),
    // Google rating value (google row only).
    ratingValue: real("rating_value"),
    ratingCount: integer("rating_count"),
    detail: text("detail"),
  },
  (table) => [
    index("nap_results_audit_idx").on(table.auditId),
    index("nap_results_project_idx").on(table.projectId),
  ],
);

// Google Reviews fetcher: one cached GBP info snapshot per project plus the
// latest fetched review rows (task_post/task_get flow).
export const gbpProfiles = pgTable(
  "gbp_profiles",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    locationCode: integer("location_code").notNull().default(2840),
    languageCode: text("language_code").notNull().default("en"),
    // JSON snapshot of the GBP info item (title/address/phone/rating/...).
    profileJson: text("profile_json"),
    fetchedAt: text("fetched_at"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    // Unique on projectId: the profile upsert targets ON CONFLICT (project_id).
    uniqueIndex("gbp_profiles_project_idx").on(table.projectId),
    index("gbp_profiles_organization_idx").on(table.organizationId),
  ],
);

export const gbpReviews = pgTable(
  "gbp_reviews",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    reviewId: text("review_id").notNull(),
    author: text("author"),
    rating: integer("rating"),
    text: text("text"),
    ownerAnswer: text("owner_answer"),
    reviewedAt: text("reviewed_at"),
    fetchedAt: text("fetched_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("gbp_reviews_project_review_idx").on(
      table.projectId,
      table.reviewId,
    ),
    index("gbp_reviews_project_idx").on(table.projectId, table.reviewedAt),
  ],
);
