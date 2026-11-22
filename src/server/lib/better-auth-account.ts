import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { account } from "@/db/schema";

/** Resolve the Better Auth internal account row ID from a provider account ID.
 *  Better Auth 1.7 getAccessToken selects by account.id, while our feature
 *  connections intentionally persist provider accountId (Google sub). */
export async function findBetterAuthAccountId(input: {
  userId: string;
  providerId: string;
  providerAccountId?: string;
}): Promise<string | null> {
  const conditions = [
    eq(account.userId, input.userId),
    eq(account.providerId, input.providerId),
  ];
  if (input.providerAccountId) {
    conditions.push(eq(account.accountId, input.providerAccountId));
  }
  const rows = await db
    .select({ id: account.id })
    .from(account)
    .where(and(...conditions))
    .limit(1);
  return rows[0]?.id ?? null;
}
