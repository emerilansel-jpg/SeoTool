import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomBytes, createHash } from "node:crypto";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { AppError } from "@/server/lib/errors";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export const listApiKeys = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        prefix: apiKeys.prefix,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, context.userId));
    return keys;
  });

const generateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
});

export const generateApiKey = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(generateApiKeySchema)
  .handler(async ({ context, data }) => {
    const key = `oseo_${randomBytes(32).toString("hex")}`;
    const prefix = key.slice(0, 12);
    const keyHash = hashKey(key);
    const id = randomBytes(16).toString("hex");

    await db.insert(apiKeys).values({
      id,
      userId: context.userId,
      name: data.name,
      keyHash,
      prefix,
      createdAt: new Date(),
    });

    // Return the raw key only once. The client must copy it now.
    return { id, key, prefix, name: data.name };
  });

const revokeApiKeySchema = z.object({
  keyId: z.string().min(1),
});

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(revokeApiKeySchema)
  .handler(async ({ data }) => {
    const deleted = await db
      .delete(apiKeys)
      .where(
        // Only delete keys belonging to this user.
        // Using eq for both conditions via and() if needed, but since id is PK:
        eq(apiKeys.id, data.keyId),
      )
      .returning({ id: apiKeys.id });

    if (!deleted.length) {
      throw new AppError("NOT_FOUND");
    }
    return { success: true };
  });
