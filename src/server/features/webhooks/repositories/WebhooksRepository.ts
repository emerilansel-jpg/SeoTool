import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { automationWebhookDeliveries, automationWebhooks } from "@/db/schema";

export type AutomationWebhook = typeof automationWebhooks.$inferSelect;
export type WebhookDelivery = typeof automationWebhookDeliveries.$inferSelect;

async function listForOrganization(
  organizationId: string,
): Promise<AutomationWebhook[]> {
  return db
    .select()
    .from(automationWebhooks)
    .where(eq(automationWebhooks.organizationId, organizationId))
    .orderBy(desc(automationWebhooks.createdAt));
}

/** Active webhooks subscribed to `event` for the org, optionally narrowed to
 *  one project (org-wide rows always fire). */
async function findSubscribers(
  organizationId: string,
  projectId: string | null,
  event: string,
): Promise<AutomationWebhook[]> {
  const rows = await db
    .select()
    .from(automationWebhooks)
    .where(
      and(
        eq(automationWebhooks.organizationId, organizationId),
        eq(automationWebhooks.active, true),
        projectId
          ? or(
              isNull(automationWebhooks.projectId),
              eq(automationWebhooks.projectId, projectId),
            )
          : isNull(automationWebhooks.projectId),
      ),
    );
  return rows.filter((row) => {
    try {
      const events = JSON.parse(row.events) as unknown;
      return Array.isArray(events) && events.includes(event);
    } catch {
      return false;
    }
  });
}

async function createWebhook(input: {
  organizationId: string;
  projectId: string | null;
  url: string;
  secret: string;
  events: string[];
}): Promise<AutomationWebhook> {
  const [row] = await db
    .insert(automationWebhooks)
    .values({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      projectId: input.projectId,
      url: input.url,
      secret: input.secret,
      events: JSON.stringify(input.events),
    })
    .returning();
  if (!row) throw new Error("Failed to insert automation_webhooks");
  return row;
}

async function updateWebhook(
  organizationId: string,
  webhookId: string,
  patch: { url?: string; events?: string[]; active?: boolean },
): Promise<void> {
  await db
    .update(automationWebhooks)
    .set({
      ...(patch.url ? { url: patch.url } : {}),
      ...(patch.events ? { events: JSON.stringify(patch.events) } : {}),
      ...(patch.active !== undefined ? { active: patch.active } : {}),
    })
    .where(
      and(
        eq(automationWebhooks.id, webhookId),
        eq(automationWebhooks.organizationId, organizationId),
      ),
    );
}

async function deleteWebhook(
  organizationId: string,
  webhookId: string,
): Promise<void> {
  await db
    .delete(automationWebhooks)
    .where(
      and(
        eq(automationWebhooks.id, webhookId),
        eq(automationWebhooks.organizationId, organizationId),
      ),
    );
}

async function recordDelivery(input: {
  webhookId: string;
  organizationId: string;
  event: string;
  payload: string;
  status: "delivered" | "failed";
  attempts: number;
  responseStatus: number | null;
  lastError: string | null;
}): Promise<void> {
  await db.insert(automationWebhookDeliveries).values({
    id: crypto.randomUUID(),
    ...input,
  });
}

async function listDeliveries(
  organizationId: string,
  limit = 30,
): Promise<WebhookDelivery[]> {
  return db
    .select()
    .from(automationWebhookDeliveries)
    .where(eq(automationWebhookDeliveries.organizationId, organizationId))
    .orderBy(desc(automationWebhookDeliveries.createdAt))
    .limit(limit);
}

export const WebhooksRepository = {
  listForOrganization,
  findSubscribers,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  recordDelivery,
  listDeliveries,
};
