import { count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { member, organization, session, subscription, user } from "@/db/schema";
import { getCreditBalance } from "@/server/billing/credits";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  banned: boolean;
  banReason: string | null;
  createdAt: string | null;
  organizationId: string | null;
  organizationName: string | null;
  planTier: string | null;
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  banned: boolean;
  banReason: string | null;
  banCount: number;
  createdAt: string | null;
  sessionCount: number;
  orgs: Array<{
    id: string;
    name: string;
    role: string;
    planTier: string;
    status: string;
    currentPeriodEnd: string | null;
    monthlyCreditsRemaining: number;
    topupCreditsRemaining: number;
  }>;
}

function toIso(value: Date | string | null | undefined): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

export const AdminUserRepository = {
  async listUsers(input: {
    search?: string;
    limit: number;
    offset: number;
  }): Promise<{ users: AdminUserListItem[]; total: number }> {
    const searchFilter = input.search
      ? or(
          ilike(user.email, `%${input.search}%`),
          ilike(user.name, `%${input.search}%`),
        )
      : undefined;

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          banned: user.banned,
          banReason: user.banReason,
          createdAt: user.createdAt,
          organizationId: organization.id,
          organizationName: organization.name,
          planTier: subscription.planTier,
        })
        .from(user)
        .leftJoin(member, eq(member.userId, user.id))
        .leftJoin(organization, eq(organization.id, member.organizationId))
        .leftJoin(
          subscription,
          eq(subscription.organizationId, organization.id),
        )
        .where(searchFilter)
        .orderBy(desc(user.createdAt))
        .limit(input.limit)
        .offset(input.offset),
      db.select({ value: count() }).from(user).where(searchFilter),
    ]);

    return {
      users: rows.map((row) => ({
        ...row,
        createdAt: toIso(row.createdAt),
      })),
      total: totalRows[0]?.value ?? 0,
    };
  },

  async getUserDetail(userId: string): Promise<AdminUserDetail | null> {
    const userRows = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    const userRow = userRows[0];
    if (!userRow) return null;

    const [memberRows, sessionRows] = await Promise.all([
      db
        .select({
          id: organization.id,
          name: organization.name,
          role: member.role,
          planTier: subscription.planTier,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        })
        .from(member)
        .innerJoin(organization, eq(organization.id, member.organizationId))
        .leftJoin(
          subscription,
          eq(subscription.organizationId, organization.id),
        )
        .where(eq(member.userId, userId)),
      db
        .select({ value: count() })
        .from(session)
        .where(eq(session.userId, userId)),
    ]);

    const orgs = await Promise.all(
      memberRows.map(async (row) => {
        const balance = await getCreditBalance(row.id);
        return {
          id: row.id,
          name: row.name,
          role: row.role,
          planTier: row.planTier ?? "free",
          status: row.status ?? "active",
          currentPeriodEnd: row.currentPeriodEnd,
          monthlyCreditsRemaining: balance.monthlyRemaining,
          topupCreditsRemaining: balance.topupRemaining,
        };
      }),
    );

    return {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      emailVerified: userRow.emailVerified,
      banned: userRow.banned,
      banReason: userRow.banReason,
      banCount: userRow.banCount,
      createdAt: toIso(userRow.createdAt),
      sessionCount: sessionRows[0]?.value ?? 0,
      orgs,
    };
  },

  async banUser(userId: string, banReason: string | null): Promise<void> {
    await db
      .update(user)
      .set({
        banned: true,
        banReason,
        banExpires: null,
        banCount: sql`${user.banCount} + 1`,
      })
      .where(eq(user.id, userId));
    // Revoke every session so the ban takes effect immediately (the signed
    // cookie cache would otherwise keep them signed in for up to 5 minutes).
    await AdminUserRepository.revokeSessions(userId);
  },

  async unbanUser(userId: string): Promise<void> {
    await db
      .update(user)
      .set({
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .where(eq(user.id, userId));
  },

  async revokeSessions(userId: string): Promise<void> {
    await db.delete(session).where(eq(session.userId, userId));
  },
};
