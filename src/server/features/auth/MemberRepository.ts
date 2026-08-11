import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { member } from "@/db/schema";

/**
 * Look up a user's role within an organization. Returns `null` when the user
 * isn't a member (the caller decides the fallback — RBAC middleware treats a
 * null role as the least-privileged viewer).
 */
export async function getMemberRole(
  userId: string,
  organizationId: string,
): Promise<string | null> {
  const rows = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
    )
    .limit(1);
  return rows[0]?.role ?? null;
}
