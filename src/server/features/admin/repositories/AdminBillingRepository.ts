import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import {
  member,
  organization,
  paypalWebhookEvents,
  subscription,
  user,
} from "@/db/schema";

export interface AdminSubscriptionListItem {
  organizationId: string;
  organizationName: string;
  ownerEmail: string | null;
  ownerUserId: string | null;
  planTier: string;
  status: string;
  paypalSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  updatedAt: string | null;
}

export interface AdminWebhookEventItem {
  id: string;
  eventType: string;
  organizationId: string | null;
  status: string;
  errorMessage: string | null;
  receivedAt: string | null;
}

export const AdminBillingRepository = {
  async listSubscriptions(input: {
    search?: string;
    limit: number;
    offset: number;
  }): Promise<{ subscriptions: AdminSubscriptionListItem[]; total: number }> {
    const searchFilter = input.search
      ? or(
          ilike(organization.name, `%${input.search}%`),
          ilike(user.email, `%${input.search}%`),
        )
      : undefined;

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          organizationId: organization.id,
          organizationName: organization.name,
          ownerEmail: user.email,
          ownerUserId: user.id,
          planTier: subscription.planTier,
          status: subscription.status,
          paypalSubscriptionId: subscription.paypalSubscriptionId,
          currentPeriodEnd: subscription.currentPeriodEnd,
          updatedAt: subscription.updatedAt,
        })
        .from(subscription)
        .innerJoin(
          organization,
          eq(organization.id, subscription.organizationId),
        )
        .leftJoin(
          member,
          and(
            eq(member.organizationId, organization.id),
            eq(member.role, "owner"),
          ),
        )
        .leftJoin(user, eq(user.id, member.userId))
        .where(searchFilter)
        .orderBy(desc(subscription.updatedAt))
        .limit(input.limit)
        .offset(input.offset),
      db
        .select({ value: count() })
        .from(subscription)
        .innerJoin(
          organization,
          eq(organization.id, subscription.organizationId),
        )
        .leftJoin(
          member,
          and(
            eq(member.organizationId, organization.id),
            eq(member.role, "owner"),
          ),
        )
        .leftJoin(user, eq(user.id, member.userId))
        .where(searchFilter),
    ]);

    return {
      subscriptions: rows.map((row) => ({
        ...row,
        updatedAt: row.updatedAt ?? null,
      })),
      total: totalRows[0]?.value ?? 0,
    };
  },

  async listWebhookEvents(limit: number): Promise<AdminWebhookEventItem[]> {
    const rows = await db
      .select({
        id: paypalWebhookEvents.id,
        eventType: paypalWebhookEvents.eventType,
        organizationId: paypalWebhookEvents.organizationId,
        status: paypalWebhookEvents.status,
        errorMessage: paypalWebhookEvents.errorMessage,
        receivedAt: paypalWebhookEvents.receivedAt,
      })
      .from(paypalWebhookEvents)
      .orderBy(desc(paypalWebhookEvents.receivedAt))
      .limit(limit);
    return rows;
  },
};
