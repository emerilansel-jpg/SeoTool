import { and, eq, lte } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { alertRules } from "@/db/schema";
import type {
  createAlertRuleSchema,
  updateAlertRuleSchema,
} from "@/types/schemas/alerts";

export const AlertRepository = {
  async listForProject(projectId: string) {
    return db
      .select()
      .from(alertRules)
      .where(eq(alertRules.projectId, projectId));
  },

  async getById(id: string, projectId: string) {
    const rows = await db
      .select()
      .from(alertRules)
      .where(and(eq(alertRules.id, id), eq(alertRules.projectId, projectId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async listDue(now: Date) {
    const rows = await db
      .select()
      .from(alertRules)
      .where(
        and(eq(alertRules.enabled, true), lte(alertRules.nextCheckAt, now)),
      );
    return rows;
  },

  async create(id: string, data: z.infer<typeof createAlertRuleSchema>) {
    const nextCheckAt = computeNextCheckAt(data.frequency, new Date());
    await db.insert(alertRules).values({
      id,
      projectId: data.projectId,
      name: data.name,
      metricType: data.metricType,
      conditionJson: JSON.stringify(data.condition),
      enabled: data.enabled,
      frequency: data.frequency,
      nextCheckAt,
      recipients: data.recipients,
    });
    return AlertRepository.getById(id, data.projectId);
  },

  async update(
    id: string,
    projectId: string,
    data: z.infer<typeof updateAlertRuleSchema>,
  ) {
    const setValues: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) setValues.name = data.name;
    if (data.metricType !== undefined) setValues.metricType = data.metricType;
    if (data.condition !== undefined)
      setValues.conditionJson = JSON.stringify(data.condition);
    if (data.enabled !== undefined) setValues.enabled = data.enabled;
    if (data.frequency !== undefined) {
      setValues.frequency = data.frequency;
      setValues.nextCheckAt = computeNextCheckAt(data.frequency, new Date());
    }
    if (data.recipients !== undefined) setValues.recipients = data.recipients;

    await db
      .update(alertRules)
      .set(setValues)
      .where(and(eq(alertRules.id, id), eq(alertRules.projectId, projectId)));

    return AlertRepository.getById(id, projectId);
  },

  async delete(id: string, projectId: string) {
    await db
      .delete(alertRules)
      .where(and(eq(alertRules.id, id), eq(alertRules.projectId, projectId)));
  },

  async markTriggered(id: string) {
    await db
      .update(alertRules)
      .set({ lastTriggeredAt: new Date() })
      .where(eq(alertRules.id, id));
  },

  async advanceNextCheck(id: string, frequency: string) {
    const nextCheckAt = computeNextCheckAt(frequency, new Date());
    await db
      .update(alertRules)
      .set({ nextCheckAt })
      .where(eq(alertRules.id, id));
  },
};

/** Compute the next check timestamp for the given frequency. */
export function computeNextCheckAt(frequency: string, from: Date): Date {
  const next = new Date(from);
  if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else {
    // Default: daily
    next.setDate(next.getDate() + 1);
  }
  return next;
}
