import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { feedback } from "@/db/schema";

export type FeedbackRow = typeof feedback.$inferSelect;
export type FeedbackStatus = FeedbackRow["status"];

export interface ListFeedbackFilters {
  type?: "bug" | "feature" | undefined;
  status?: FeedbackStatus | undefined;
  search?: string | undefined;
  page: number;
  pageSize: number;
}

export const FeedbackRepository = {
  /** Highest display number; single-row display counter (not a unique key). */
  async nextDisplayNumber(): Promise<number> {
    const [row] = await db
      .select({
        max: sql<number>`COALESCE(MAX(${feedback.displayNumber}), 0)`,
      })
      .from(feedback);
    return Number(row?.max ?? 0) + 1;
  },

  async insert(input: FeedbackRow): Promise<void> {
    await db.insert(feedback).values(input);
  },

  async getById(id: string): Promise<FeedbackRow | null> {
    const rows = await db
      .select()
      .from(feedback)
      .where(eq(feedback.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async list(filters: ListFeedbackFilters): Promise<{
    items: FeedbackRow[];
    total: number;
  }> {
    const conditions = [
      filters.type ? eq(feedback.type, filters.type) : undefined,
      filters.status ? eq(feedback.status, filters.status) : undefined,
      filters.search
        ? or(
            like(feedback.title, `%${filters.search}%`),
            like(feedback.email, `%${filters.search}%`),
            sql`${feedback.displayNumber} = ${Number(filters.search) || 0}`,
          )
        : undefined,
    ].filter(Boolean);

    const where = conditions.length ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(feedback)
      .where(where)
      .orderBy(desc(feedback.createdAt))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize);

    const [countRow] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(feedback)
      .where(where);

    return {
      items,
      total: Number(countRow?.count ?? 0),
    };
  },

  async countNew(): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(feedback)
      .where(eq(feedback.status, "new"));
    return Number(row?.count ?? 0);
  },

  async updateStatus(input: {
    id: string;
    status: FeedbackStatus;
    adminNote: string | null;
    resolvedInVersion: string | null;
    nowIso: string;
  }): Promise<FeedbackRow | null> {
    const [row] = await db
      .update(feedback)
      .set({
        status: input.status,
        adminNote: input.adminNote,
        resolvedInVersion: input.resolvedInVersion,
        updatedAt: input.nowIso,
        resolvedAt:
          input.status === "resolved" || input.status === "wont_fix"
            ? input.nowIso
            : null,
      })
      .where(eq(feedback.id, input.id))
      .returning();
    return row ?? null;
  },

  /**
   * Atomically claim the "email the user" step: the UPDATE only matches when
   * no notification has gone out yet, so webhook-like retries or double
   * clicks can never email the reporter twice.
   */
  async claimResolvedNotification(
    id: string,
    nowIso: string,
  ): Promise<boolean> {
    const rows = await db
      .update(feedback)
      .set({ notifiedAt: nowIso, updatedAt: nowIso })
      .where(and(eq(feedback.id, id), isNull(feedback.notifiedAt)))
      .returning({ id: feedback.id });
    return rows.length > 0;
  },
};
