import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";
import { describe, expect, it } from "vitest";

async function applyMigration(
  client: ReturnType<typeof createClient>,
  path: string,
) {
  const migration = readFileSync(new URL(path, import.meta.url), "utf8");
  for (const statement of migration
    .split("--> statement-breakpoint")
    .map((value) => value.trim())
    .filter(Boolean)) {
    await client.execute(statement);
  }
}

describe("Keyword Research Pro SQLite migration", () => {
  it("creates normalized tables and backfills capped cohort seats", async () => {
    const client = createClient({ url: "file::memory:" });
    try {
      await client.execute("PRAGMA foreign_keys=ON");
      await client.execute(
        "CREATE TABLE organization (id text PRIMARY KEY NOT NULL)",
      );
      await client.execute(`
        CREATE TABLE plan_config (
          tier text PRIMARY KEY NOT NULL,
          price_usd_cents integer NOT NULL,
          monthly_credits integer NOT NULL,
          paypal_plan_id text,
          sync_status text DEFAULT 'synced' NOT NULL,
          active integer DEFAULT true NOT NULL,
          updated_by_user_id text,
          updated_at text DEFAULT (current_timestamp) NOT NULL
        )
      `);
      await applyMigration(
        client,
        "../../drizzle/0056_keyword_research_pro.sql",
      );
      await client.execute("INSERT INTO organization (id) VALUES ('org-1')");
      await client.execute(`
        INSERT INTO plan_config (
          tier, price_usd_cents, monthly_credits, paypal_plan_id
        ) VALUES ('krp_founder_10', 2900, 0, 'P-FOUNDER')
      `);
      await client.execute(`
        INSERT INTO keyword_pro_memberships (
          organization_id,
          cohort_key,
          locked_price_usd_cents,
          status,
          paypal_plan_id,
          paypal_subscription_id
        ) VALUES (
          'org-1',
          'krp_founder_10',
          2900,
          'ACTIVE',
          'P-FOUNDER',
          'I-FOUNDER'
        )
      `);
      await applyMigration(
        client,
        "../../drizzle/0057_keyword_pro_cohort_seats.sql",
      );
      await applyMigration(
        client,
        "../../drizzle/0058_keyword_pro_checkout_safety.sql",
      );
      await applyMigration(
        client,
        "../../drizzle/0059_usage_credit_reservations.sql",
      );
      const result = await client.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'keyword_pro_%' ORDER BY name",
      );
      expect(result.rows.map((row) => row.name)).toEqual([
        "keyword_pro_membership_payments",
        "keyword_pro_memberships",
        "keyword_pro_referral_attributions",
        "keyword_pro_referral_codes",
        "keyword_pro_referral_commissions",
      ]);
      const membership = await client.execute(
        "SELECT seat_reserved FROM keyword_pro_memberships WHERE organization_id = 'org-1'",
      );
      expect(membership.rows[0]?.seat_reserved).toBe(1);
      const cohort = await client.execute(
        "SELECT reserved_seats FROM plan_config WHERE tier = 'krp_founder_10'",
      );
      expect(cohort.rows[0]?.reserved_seats).toBe(1);

      const membershipColumns = await client.execute(
        "PRAGMA table_info(keyword_pro_memberships)",
      );
      expect(membershipColumns.rows.map((row) => row.name)).toEqual(
        expect.arrayContaining(["checkout_expires_at", "seat_release_token"]),
      );
      const reservationColumns = await client.execute(
        "PRAGMA table_info(usage_credit_reservations)",
      );
      expect(reservationColumns.rows.map((row) => row.name)).toEqual(
        expect.arrayContaining([
          "reserved_credits",
          "monthly_reserved",
          "topup_reserved",
          "actual_credits",
        ]),
      );
    } finally {
      client.close();
    }
  });
});
