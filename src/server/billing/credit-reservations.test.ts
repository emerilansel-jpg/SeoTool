import type { Client } from "@libsql/client";
import type { BatchItem } from "drizzle-orm/batch";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(
  () =>
    ({
      client: null,
      db: null,
    }) as {
      client: Client | null;
      db: LibSQLDatabase<Record<string, unknown>> | null;
    },
);

vi.mock("@/db/schema", async () => import("@/db/d1/schema"));

vi.mock("@/db", async () => {
  const [{ createClient: createLibsqlClient }, { drizzle }, schema] =
    await Promise.all([
      import("@libsql/client"),
      import("drizzle-orm/libsql"),
      import("@/db/d1/schema"),
    ]);
  testState.client = createLibsqlClient({ url: "file::memory:" });
  testState.db = drizzle(testState.client, { schema });
  return { db: testState.db };
});

vi.mock("@/db/runBatch", () => ({
  runBatch: async (
    build: (
      tx: LibSQLDatabase<Record<string, unknown>>,
    ) => readonly BatchItem<"sqlite">[],
  ): Promise<void> => {
    if (!testState.db) throw new Error("Test database is not initialized");
    const [first, ...remaining] = build(testState.db);
    if (!first) return;
    await testState.db.batch([first, ...remaining]);
  },
}));

import {
  reserveUsageCredits,
  settleUsageCreditReservation,
} from "@/server/billing/credit-reservations";
import { KeywordProMembershipPaymentRepository } from "@/server/features/keywords/repositories/KeywordProMembershipPaymentRepository";
import { KeywordProCohortSeatRepository } from "@/server/features/keywords/repositories/KeywordProCohortSeatRepository";
import { KeywordProReferralRewardRepository } from "@/server/features/keywords/repositories/KeywordProReferralRewardRepository";

function client() {
  if (!testState.client) throw new Error("Test database is not initialized");
  return testState.client;
}

async function balances() {
  const result = await client().execute(
    "SELECT feature, used FROM usage_quota ORDER BY feature",
  );
  return Object.fromEntries(
    result.rows.map((row) => [
      typeof row.feature === "string" ? row.feature : "",
      Number(row.used),
    ]),
  );
}

describe("usage-credit reservations", () => {
  beforeAll(async () => {
    await client().execute(`
      CREATE TABLE organization (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL
      )
    `);
    await client().execute(`
      CREATE TABLE usage_quota (
        id text PRIMARY KEY NOT NULL,
        organization_id text NOT NULL,
        feature text NOT NULL,
        period text NOT NULL,
        used integer DEFAULT 0 NOT NULL,
        window_start text NOT NULL,
        window_end text NOT NULL,
        created_at text DEFAULT (current_timestamp) NOT NULL,
        updated_at text DEFAULT (current_timestamp) NOT NULL,
        UNIQUE (organization_id, feature, period)
      )
    `);
    await client().execute(`
      CREATE TABLE usage_credit_reservations (
        id text PRIMARY KEY NOT NULL,
        organization_id text NOT NULL,
        provider text NOT NULL,
        billing_mode text DEFAULT 'standard' NOT NULL,
        credit_feature text,
        status text DEFAULT 'pending' NOT NULL,
        reserved_credits integer NOT NULL,
        monthly_reserved integer DEFAULT 0 NOT NULL,
        topup_reserved integer DEFAULT 0 NOT NULL,
        actual_credits integer,
        created_at text DEFAULT (current_timestamp) NOT NULL,
        updated_at text DEFAULT (current_timestamp) NOT NULL,
        settled_at text
      )
    `);
    await client().execute(`
      CREATE TABLE keyword_pro_membership_payments (
        paypal_sale_id text PRIMARY KEY NOT NULL,
        organization_id text NOT NULL,
        paypal_subscription_id text NOT NULL,
        gross_amount_usd_cents integer NOT NULL,
        status text DEFAULT 'pending' NOT NULL,
        created_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
    await client().execute(`
      CREATE TABLE plan_config (
        tier text PRIMARY KEY NOT NULL,
        active integer DEFAULT 1 NOT NULL,
        reserved_seats integer DEFAULT 0 NOT NULL,
        updated_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
    await client().execute(`
      CREATE TABLE keyword_pro_memberships (
        organization_id text PRIMARY KEY NOT NULL,
        cohort_key text NOT NULL,
        status text NOT NULL,
        paypal_subscription_id text NOT NULL,
        seat_reserved integer DEFAULT 0 NOT NULL,
        seat_release_token text,
        updated_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
    await client().execute(`
      CREATE TABLE keyword_pro_referral_attributions (
        id text PRIMARY KEY NOT NULL,
        status text DEFAULT 'pending' NOT NULL,
        rewarded_months integer DEFAULT 0 NOT NULL,
        max_reward_months integer DEFAULT 12 NOT NULL,
        referred_reward_granted integer DEFAULT 0 NOT NULL,
        qualified_at text,
        updated_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
    await client().execute(`
      CREATE TABLE keyword_pro_referral_commissions (
        id text PRIMARY KEY NOT NULL,
        attribution_id text NOT NULL,
        paypal_sale_id text NOT NULL UNIQUE,
        gross_amount_usd_cents integer NOT NULL,
        reward_credits integer NOT NULL,
        status text DEFAULT 'pending' NOT NULL,
        created_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
  });

  beforeEach(async () => {
    await client().execute("DELETE FROM keyword_pro_referral_commissions");
    await client().execute("DELETE FROM keyword_pro_referral_attributions");
    await client().execute("DELETE FROM keyword_pro_memberships");
    await client().execute("DELETE FROM plan_config");
    await client().execute("DELETE FROM keyword_pro_membership_payments");
    await client().execute("DELETE FROM usage_credit_reservations");
    await client().execute("DELETE FROM usage_quota");
    await client().execute("DELETE FROM organization");
    await client().execute(
      "INSERT INTO organization (id, name) VALUES ('org-1', 'Test')",
    );
  });

  async function seedCredits(monthly: number, topup: number) {
    const values = [
      ["monthly", "usage_credits", monthly],
      ["topup", "topup_credits", topup],
    ] as const;
    for (const [id, feature, used] of values) {
      await client().execute({
        sql: `INSERT INTO usage_quota (
          id, organization_id, feature, period, used, window_start, window_end
        ) VALUES (?, 'org-1', ?, 'monthly', ?, 'start', 'end')`,
        args: [id, feature, used],
      });
    }
  }

  it("holds monthly-first and refunds the unused ceiling on settlement", async () => {
    await seedCredits(10, 5);

    const reservation = await reserveUsageCredits({
      organizationId: "org-1",
      credits: 12,
      provider: "dataforseo",
      billingMode: "standard",
      creditFeature: "backlinks",
    });

    expect(reservation).toMatchObject({
      status: "reserved",
      monthlyReserved: 10,
      topupReserved: 2,
    });
    expect(await balances()).toMatchObject({
      usage_credits: 0,
      topup_credits: 3,
    });

    const settlement = await settleUsageCreditReservation(reservation.id, 5);
    expect(settlement).toMatchObject({
      monthlyCharged: 5,
      topupCharged: 0,
      totalCharged: 5,
      overageCredits: 0,
    });
    expect(await balances()).toMatchObject({
      usage_credits: 5,
      topup_credits: 5,
    });
  });

  it("rejects a hold larger than the combined balance without deducting", async () => {
    await seedCredits(1, 0);

    await expect(
      reserveUsageCredits({
        organizationId: "org-1",
        credits: 2,
        provider: "dataforseo",
        billingMode: "standard",
      }),
    ).rejects.toMatchObject({ code: "INSUFFICIENT_CREDITS" });

    expect(await balances()).toMatchObject({ usage_credits: 1 });
  });

  it("allows only one concurrent hold to spend a single balance", async () => {
    await seedCredits(10, 0);
    const reserve = () =>
      reserveUsageCredits({
        organizationId: "org-1",
        credits: 10,
        provider: "dataforseo",
        billingMode: "standard" as const,
      });

    const results = await Promise.allSettled([reserve(), reserve()]);

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
    expect(await balances()).toMatchObject({ usage_credits: 0 });
  });

  it("charges the full hold when provider cost exceeds the ceiling", async () => {
    await seedCredits(10, 0);
    const reservation = await reserveUsageCredits({
      organizationId: "org-1",
      credits: 5,
      provider: "dataforseo",
      billingMode: "standard",
    });

    const settlement = await settleUsageCreditReservation(reservation.id, 8);

    expect(settlement).toMatchObject({
      totalCharged: 5,
      overageCredits: 3,
    });
    expect(await balances()).toMatchObject({ usage_credits: 5 });
  });

  it("does not refill monthly credits when the same PayPal sale is replayed", async () => {
    await seedCredits(123, 0);
    const payment = await KeywordProMembershipPaymentRepository.record({
      paypalSaleId: "SALE-1",
      organizationId: "org-1",
      paypalSubscriptionId: "I-1",
      grossAmountUsdCents: 2_900,
    });
    expect(payment).not.toBeNull();

    await KeywordProMembershipPaymentRepository.applyMonthlyCredits({
      paypalSaleId: "SALE-1",
      organizationId: "org-1",
      credits: 1_000,
    });
    await client().execute(
      "UPDATE usage_quota SET used = 900 WHERE feature = 'usage_credits'",
    );
    await KeywordProMembershipPaymentRepository.applyMonthlyCredits({
      paypalSaleId: "SALE-1",
      organizationId: "org-1",
      credits: 1_000,
    });

    expect(await balances()).toMatchObject({ usage_credits: 900 });
  });

  it("releases one capped cohort seat exactly once under concurrent cleanup", async () => {
    await client().execute(
      "INSERT INTO plan_config (tier, reserved_seats) VALUES ('krp_founder_10', 1)",
    );
    await client().execute(`
      INSERT INTO keyword_pro_memberships (
        organization_id, cohort_key, status, paypal_subscription_id, seat_reserved
      ) VALUES ('org-1', 'krp_founder_10', 'ACTIVE', 'I-1', 1)
    `);

    await Promise.all([
      KeywordProCohortSeatRepository.releaseMembership("org-1"),
      KeywordProCohortSeatRepository.releaseMembership("org-1"),
    ]);

    const cohort = await client().execute(
      "SELECT reserved_seats FROM plan_config WHERE tier = 'krp_founder_10'",
    );
    const membership = await client().execute(
      "SELECT seat_reserved FROM keyword_pro_memberships WHERE organization_id = 'org-1'",
    );
    expect(cohort.rows[0]?.reserved_seats).toBe(0);
    expect(membership.rows[0]?.seat_reserved).toBe(0);
  });

  it("grants the referred reward exactly once under concurrent activation", async () => {
    await seedCredits(0, 0);
    await client().execute(`
      INSERT INTO keyword_pro_referral_attributions (
        id, status, referred_reward_granted
      ) VALUES ('attr-1', 'pending', 0)
    `);

    await Promise.all([
      KeywordProReferralRewardRepository.grantReferredReward({
        attributionId: "attr-1",
        referredOrganizationId: "org-1",
        rewardCredits: 5_000,
      }),
      KeywordProReferralRewardRepository.grantReferredReward({
        attributionId: "attr-1",
        referredOrganizationId: "org-1",
        rewardCredits: 5_000,
      }),
    ]);

    expect(await balances()).toMatchObject({ topup_credits: 5_000 });
  });

  it("allows only one commission to claim the final referral month", async () => {
    await seedCredits(0, 0);
    await client().execute(`
      INSERT INTO keyword_pro_referral_attributions (
        id, status, max_reward_months, referred_reward_granted
      ) VALUES ('attr-1', 'qualified', 1, 1)
    `);
    for (const id of ["commission-1", "commission-2"]) {
      await client().execute({
        sql: `INSERT INTO keyword_pro_referral_commissions (
          id, attribution_id, paypal_sale_id, gross_amount_usd_cents,
          reward_credits, status
        ) VALUES (?, 'attr-1', ?, 2900, 5800, 'pending')`,
        args: [id, `sale-${id}`],
      });
    }

    const results = await Promise.all([
      KeywordProReferralRewardRepository.creditReferralCommission({
        attributionId: "attr-1",
        commissionId: "commission-1",
        referrerOrganizationId: "org-1",
        rewardCredits: 5_800,
      }),
      KeywordProReferralRewardRepository.creditReferralCommission({
        attributionId: "attr-1",
        commissionId: "commission-2",
        referrerOrganizationId: "org-1",
        rewardCredits: 5_800,
      }),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await balances()).toMatchObject({ topup_credits: 5_800 });
    const commissions = await client().execute(
      "SELECT status FROM keyword_pro_referral_commissions ORDER BY id",
    );
    expect(
      commissions.rows
        .map((row) => (typeof row.status === "string" ? row.status : ""))
        .toSorted((left, right) => left.localeCompare(right)),
    ).toEqual(["cap_reached", "credited"]);
  });
});
