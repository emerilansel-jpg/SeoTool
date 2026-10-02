import { sql } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";

const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

export const byokSettings = pgTable("byok_settings", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  dataforseoApiKey: text("dataforseo_api_key"),
  aiProvider: text("ai_provider").notNull().default("pesatrouter"),
  aiBaseUrl: text("ai_base_url"),
  aiApiKey: text("ai_api_key"),
  aiModel: text("ai_model"),
  createdAt: text("created_at").notNull().default(isoNow),
  updatedAt: text("updated_at").notNull().default(isoNow),
});
