import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { d1Db } from "../src/db/d1/client";
import { pgDb } from "../src/db/pg/client";
import { getDatabaseProvider } from "../src/db/provider";
import * as d1BetterAuth from "../src/db/better-auth-schema";
import * as pgBetterAuth from "../src/db/pg/better-auth-schema";
import * as pgQuota from "../src/db/pg/quota.schema";

const ADMIN_EMAIL = "info@jetdigitalpro.com";
const ADMIN_PASSWORD = "SeoTool.im11!";
const ADMIN_USER_ID = "usr_admin_jetdigital";
const ADMIN_ORG_ID = "org_admin_jetdigital";

async function main() {
  const provider = getDatabaseProvider();
  console.log(`Seeding primary admin ${ADMIN_EMAIL} into ${provider}...`);

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  if (provider === "postgres") {
    // 1. User
    const existingUser = await pgDb
      .select()
      .from(pgBetterAuth.user)
      .where(eq(pgBetterAuth.user.email, ADMIN_EMAIL))
      .limit(1);

    let resolvedUserId = ADMIN_USER_ID;
    if (existingUser.length > 0 && existingUser[0]) {
      resolvedUserId = existingUser[0].id;
      await pgDb
        .update(pgBetterAuth.user)
        .set({
          role: "admin",
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(pgBetterAuth.user.id, resolvedUserId));
    } else {
      await pgDb.insert(pgBetterAuth.user).values({
        id: resolvedUserId,
        name: "Admin JetDigital",
        email: ADMIN_EMAIL,
        emailVerified: true,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 2. Credential account
    await pgDb
      .delete(pgBetterAuth.account)
      .where(eq(pgBetterAuth.account.userId, resolvedUserId));

    await pgDb.insert(pgBetterAuth.account).values({
      id: `acc_${resolvedUserId}`,
      accountId: resolvedUserId,
      providerId: "credential",
      userId: resolvedUserId,
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Organization & Member
    const existingMember = await pgDb
      .select()
      .from(pgBetterAuth.member)
      .where(eq(pgBetterAuth.member.userId, resolvedUserId))
      .limit(1);

    let resolvedOrgId = ADMIN_ORG_ID;
    if (existingMember.length > 0 && existingMember[0]) {
      resolvedOrgId = existingMember[0].organizationId;
    } else {
      await pgDb
        .insert(pgBetterAuth.organization)
        .values({
          id: resolvedOrgId,
          name: "JetDigital Workspace",
          slug: "jetdigital-workspace",
          createdAt: new Date(),
        })
        .onConflictDoNothing();

      await pgDb
        .insert(pgBetterAuth.member)
        .values({
          id: `mem_${resolvedUserId}`,
          organizationId: resolvedOrgId,
          userId: resolvedUserId,
          role: "owner",
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    }

    // 4. Subscription -> agency
    await pgDb
      .insert(pgQuota.subscription)
      .values({
        organizationId: resolvedOrgId,
        planTier: "agency",
        status: "active",
        currentPeriodEnd: "2099-12-31T23:59:59.999Z",
      })
      .onConflictDoUpdate({
        target: pgQuota.subscription.organizationId,
        set: {
          planTier: "agency",
          status: "active",
          currentPeriodEnd: "2099-12-31T23:59:59.999Z",
        },
      });

    // 5. Unlimited Credits
    await pgDb
      .insert(pgQuota.usageQuota)
      .values({
        id: `quota_credits_${resolvedOrgId}`,
        organizationId: resolvedOrgId,
        feature: "credits",
        period: "monthly",
        used: 999_999_999,
        windowStart: new Date().toISOString(),
        windowEnd: "2099-12-31T23:59:59.999Z",
      })
      .onConflictDoUpdate({
        target: [
          pgQuota.usageQuota.organizationId,
          pgQuota.usageQuota.feature,
          pgQuota.usageQuota.period,
        ],
        set: {
          used: 999_999_999,
          windowEnd: "2099-12-31T23:59:59.999Z",
        },
      });

    await pgDb
      .insert(pgQuota.usageQuota)
      .values({
        id: `quota_topup_${resolvedOrgId}`,
        organizationId: resolvedOrgId,
        feature: "topup_credits",
        period: "monthly",
        used: 999_999_999,
        windowStart: new Date().toISOString(),
        windowEnd: "2099-12-31T23:59:59.999Z",
      })
      .onConflictDoUpdate({
        target: [
          pgQuota.usageQuota.organizationId,
          pgQuota.usageQuota.feature,
          pgQuota.usageQuota.period,
        ],
        set: {
          used: 999_999_999,
          windowEnd: "2099-12-31T23:59:59.999Z",
        },
      });

    console.log(`✅ Admin ${ADMIN_EMAIL} successfully configured in Postgres!`);
  } else {
    console.log("Local D1 mode - updating user & credential...");
    const existing = await d1Db
      .select()
      .from(d1BetterAuth.user)
      .where(eq(d1BetterAuth.user.email, ADMIN_EMAIL))
      .get();

    let resolvedUserId = ADMIN_USER_ID;
    if (existing) {
      resolvedUserId = existing.id;
      await d1Db
        .update(d1BetterAuth.user)
        .set({ role: "admin", emailVerified: true })
        .where(eq(d1BetterAuth.user.id, resolvedUserId));
    } else {
      await d1Db.insert(d1BetterAuth.user).values({
        id: resolvedUserId,
        name: "Admin JetDigital",
        email: ADMIN_EMAIL,
        emailVerified: true,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await d1Db
      .delete(d1BetterAuth.account)
      .where(eq(d1BetterAuth.account.userId, resolvedUserId));

    await d1Db.insert(d1BetterAuth.account).values({
      id: `acc_${resolvedUserId}`,
      accountId: resolvedUserId,
      providerId: "credential",
      userId: resolvedUserId,
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Admin ${ADMIN_EMAIL} successfully configured in D1!`);
  }
}

main().catch((err) => {
  console.error("Failed to seed admin user:", err);
  process.exit(1);
});
