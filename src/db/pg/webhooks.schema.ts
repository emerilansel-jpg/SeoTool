import { sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, text } from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

// See src/db/pg/app.schema.ts for why timestamps are ISO-8601 UTC text.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// Automations webhooks: outbound POST notifications when scans/reports
// finish. One endpoint per row with its own HMAC secret; deliveries are
// logged with attempts and response status for the execution history UI.
export const automationWebhooks = pgTable(
  "automation_webhooks",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // null = fires for every project in the org; otherwise scoped to one project.
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    url: text("url").notNull(),
    // Random hex secret used for the HMAC signature header.
    secret: text("secret").notNull(),
    // JSON array of subscribed events, e.g. ["audit.completed","report.generated"].
    events: text("events").notNull().default("[]"),
    active: boolean("active").notNull().default(true),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("automation_webhooks_organization_idx").on(table.organizationId),
    index("automation_webhooks_project_idx").on(table.projectId),
  ],
);

export const automationWebhookDeliveries = pgTable(
  "automation_webhook_deliveries",
  {
    id: text("id").primaryKey(),
    webhookId: text("webhook_id")
      .notNull()
      .references(() => automationWebhooks.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    payload: text("payload").notNull(),
    // "delivered" | "failed"
    status: text("status").notNull(),
    attempts: integer("attempts").notNull().default(1),
    responseStatus: integer("response_status"),
    lastError: text("last_error"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("automation_webhook_deliveries_webhook_idx").on(
      table.webhookId,
      table.createdAt,
    ),
  ],
);
