import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { organization } from "../better-auth-schema";

export const byokSettings = sqliteTable("byok_settings", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  dataforseoApiKey: text("dataforseo_api_key"),
  aiProvider: text("ai_provider").notNull().default("pesatrouter"),
  aiBaseUrl: text("ai_base_url"),
  aiApiKey: text("ai_api_key"),
  aiModel: text("ai_model"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
