import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { member, organization } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { AppError } from "@/server/lib/errors";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

const deleteAccountSchema = z.object({
  password: z.string().min(1),
});

/**
 * Permanently delete the signed-in user's account and all associated data.
 *
 * Deletion happens in two stages so that project-level data (keywords, rank
 * tracking, backlinks, audits, reports, etc.) is fully removed:
 *
 *  1. Delete every organization the user belongs to.  Project tables cascade
 *     off organization.id, so this wipes all business data in one shot.
 *  2. Delete the user via the Better Auth API.  This verifies the password,
 *     then cascades to sessions, accounts, invitations, and remaining member
 *     rows.
 */
export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(deleteAccountSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const auth = getAuth();

    // 1. Collect every organization the user is a member of, then delete
    //    them. Deleting the org cascades all project data.
    const memberships = await db
      .select({ orgId: member.organizationId })
      .from(member)
      .where(eq(member.userId, context.userId));

    for (const { orgId } of memberships) {
      await db.delete(organization).where(eq(organization.id, orgId));
    }

    // 2. Delete the user through Better Auth. This verifies the password
    //    against the stored hash and cascades sessions, accounts, and any
    //    member rows that remain.
    try {
      await auth.api.deleteUser({
        headers: request.headers,
        body: { password: data.password },
      });
    } catch {
      throw new AppError("FORBIDDEN", "Incorrect password. Please try again.");
    }

    return { success: true };
  });
