import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { member, notifications } from "@/db/schema";

export const NotificationRepository = {
  async listForUser(userId: string, limit = 30) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  },

  async countUnread(userId: string) {
    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      );
    return rows.length;
  },

  async markRead(id: string, userId: string) {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  },

  async markAllRead(userId: string) {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      );
  },

  /**
   * Fan a single notification out to every member of an organization. Used by
   * background workflows (alert triggered, report delivered) so each teammate
   * gets their own unread inbox entry.
   */
  async createForOrganization(
    organizationId: string,
    input: {
      type: string;
      title: string;
      body?: string | null;
      linkPath?: string | null;
    },
  ) {
    const members = await db
      .select({ userId: member.userId })
      .from(member)
      .where(eq(member.organizationId, organizationId));
    if (members.length === 0) return;

    const now = new Date();
    await db.insert(notifications).values(
      members.map((m) => ({
        id: crypto.randomUUID(),
        userId: m.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        linkPath: input.linkPath ?? null,
        createdAt: now,
      })),
    );
  },
};
