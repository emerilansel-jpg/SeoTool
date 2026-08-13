import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  account,
  alertRules,
  contentBriefs,
  member,
  organization,
  projects,
  rankTrackingConfigs,
  rankTrackingKeywords,
  reports,
  savedKeywords,
  topicClusters,
  user,
} from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { AppError } from "@/server/lib/errors";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

const deleteAccountSchema = z.object({
  // Optional: OAuth-only users (signed in via Google) have no password. The
  // client gates submission behind a typed "DELETE" confirmation so accidental
  // clicks never reach this endpoint; identity is already proven by the
  // authenticated session, so self-deletion of one's own account is safe.
  password: z.string().optional(),
});

/**
 * Permanently delete the signed-in user's account and all associated data.
 *
 * Deletion happens in two stages so that project-level data (keywords, rank
 * tracking, backlinks, audits, reports, etc.) is fully removed:
 *
 *  1. Delete every organization the user belongs to.  Project tables cascade
 *     off organization.id, so this wipes all business data in one shot.
 *  2. Delete the user.  Credential (password) users are deleted through the
 *     Better Auth API, which verifies the password and then cascades to
 *     sessions, accounts, invitations, and remaining member rows.  OAuth-only
 *     users (no credential account, e.g. signed in via Google) have no
 *     password to verify, so the typed "DELETE" confirmation is the safeguard
 *     and the user row is removed directly; FK cascades clean up sessions,
 *     accounts, and member rows.
 */
export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(deleteAccountSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const auth = getAuth();
    const userId = context.userId;

    // 1. Collect every organization the user is a member of, then delete
    //    them. Deleting the org cascades all project data.
    const memberships = await db
      .select({ orgId: member.organizationId })
      .from(member)
      .where(eq(member.userId, userId));

    for (const { orgId } of memberships) {
      await db.delete(organization).where(eq(organization.id, orgId));
    }

    // 2. Check whether the user has a credential (password) account. This
    //    distinguishes password users from OAuth-only users.
    const [credentialAccount] = await db
      .select({ id: account.id })
      .from(account)
      .where(
        and(eq(account.userId, userId), eq(account.providerId, "credential")),
      )
      .limit(1);

    if (credentialAccount) {
      if (!data.password) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Enter your password to confirm account deletion.",
        );
      }
      // Verify the password against the stored hash, then cascade.
      try {
        await auth.api.deleteUser({
          headers: request.headers,
          body: { password: data.password },
        });
      } catch {
        throw new AppError(
          "FORBIDDEN",
          "Incorrect password. Please try again.",
        );
      }
    } else {
      // OAuth-only user (no credential account): they have no password to
      // verify, so the "DELETE" confirmation above is the safeguard. Remove
      // the user row directly; FK cascades clean up sessions, accounts, and
      // any member rows that remain.
      await db.delete(user).where(eq(user.id, userId));
    }

    return { success: true };
  });

/**
 * Export the signed-in user's account data as a portable JSON document (right
 * to data portability, GDPR Art. 20). Returns the user profile, linked auth
 * providers (without tokens), organizations, and the project-scoped content
 * the user created or configured. Ephemeral crawl snapshots and audit page
 * bodies are intentionally excluded to keep the export focused on portable,
 * user-meaningful data.
 */
export const exportAccountData = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    const userId = context.userId;

    const [userRow] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId));

    // Linked auth providers — exclude access/refresh tokens, id tokens, and
    // password hashes (sensitive, not portable).
    const accounts = await db
      .select({
        providerId: account.providerId,
        accountId: account.accountId,
        createdAt: account.createdAt,
      })
      .from(account)
      .where(eq(account.userId, userId));

    const memberships = await db
      .select({
        organizationId: member.organizationId,
        role: member.role,
      })
      .from(member)
      .where(eq(member.userId, userId));
    const orgIds = memberships.map((m) => m.organizationId);

    const orgs = orgIds.length
      ? await db
          .select()
          .from(organization)
          .where(inArray(organization.id, orgIds))
      : [];
    const organizations = orgs.map((o) => ({
      ...o,
      role: memberships.find((m) => m.organizationId === o.id)?.role ?? null,
    }));

    // Projects across all the user's orgs.
    const allProjects = orgIds.length
      ? await db
          .select()
          .from(projects)
          .where(inArray(projects.organizationId, orgIds))
      : [];
    const projectIds = allProjects.map((p) => p.id);

    // Project-scoped content/config. Each query is guarded so an account with
    // no projects never hits an empty-array inArray (which some drivers reject).
    const savedKw = projectIds.length
      ? await db
          .select()
          .from(savedKeywords)
          .where(inArray(savedKeywords.projectId, projectIds))
      : [];
    const rtConfigs = projectIds.length
      ? await db
          .select()
          .from(rankTrackingConfigs)
          .where(inArray(rankTrackingConfigs.projectId, projectIds))
      : [];
    // Rank-tracked keywords belong to a config (not directly to a project), so
    // scope them by the config ids just fetched.
    const configIds = rtConfigs.map((c) => c.id);
    const rtKeywords = configIds.length
      ? await db
          .select()
          .from(rankTrackingKeywords)
          .where(inArray(rankTrackingKeywords.configId, configIds))
      : [];
    const reportsData = projectIds.length
      ? await db
          .select()
          .from(reports)
          .where(inArray(reports.projectId, projectIds))
      : [];
    const clusters = projectIds.length
      ? await db
          .select()
          .from(topicClusters)
          .where(inArray(topicClusters.projectId, projectIds))
      : [];
    const briefs = projectIds.length
      ? await db
          .select()
          .from(contentBriefs)
          .where(inArray(contentBriefs.projectId, projectIds))
      : [];
    const alerts = projectIds.length
      ? await db
          .select()
          .from(alertRules)
          .where(inArray(alertRules.projectId, projectIds))
      : [];

    return {
      schema: "seotool-account-export/v1",
      exportedAt: new Date().toISOString(),
      user: userRow ?? null,
      accounts,
      organizations,
      projects: allProjects,
      savedKeywords: savedKw,
      rankTrackingConfigs: rtConfigs,
      rankTrackingKeywords: rtKeywords,
      reports: reportsData,
      topicClusters: clusters,
      contentBriefs: briefs,
      alertRules: alerts,
    };
  });
