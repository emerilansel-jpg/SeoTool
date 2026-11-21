import type { Client } from "@libsql/client";
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

import {
  CouponRepository,
  generateCouponCode,
  normalizeCouponCode,
} from "./CouponRepository";

function client() {
  if (!testState.client) throw new Error("Test database is not initialized");
  return testState.client;
}

describe("coupon repository", () => {
  beforeAll(async () => {
    await client().execute(
      "CREATE TABLE organization (id text PRIMARY KEY NOT NULL, name text NOT NULL)",
    );
    await client().execute(`
      CREATE TABLE coupon_codes (
        id text PRIMARY KEY NOT NULL,
        code text NOT NULL UNIQUE,
        credits integer NOT NULL,
        max_redemptions integer,
        redeemed_count integer DEFAULT 0 NOT NULL,
        expires_at text,
        note text,
        is_active integer DEFAULT true NOT NULL,
        created_by text,
        created_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
    await client().execute(`
      CREATE TABLE coupon_redemptions (
        id text PRIMARY KEY NOT NULL,
        coupon_id text NOT NULL,
        organization_id text NOT NULL,
        credits_granted integer NOT NULL,
        created_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
    await client().execute(
      "CREATE UNIQUE INDEX coupon_redemptions_coupon_org_idx ON coupon_redemptions (coupon_id, organization_id)",
    );
  });

  beforeEach(async () => {
    await client().execute("DELETE FROM coupon_redemptions");
    await client().execute("DELETE FROM coupon_codes");
    await client().execute("DELETE FROM organization");
    await client().execute(
      "INSERT INTO organization (id, name) VALUES ('org-1', 'Test Org'), ('org-2', 'Other Org')",
    );
  });

  it("generates unambiguous SEO-prefixed codes", () => {
    const code = generateCouponCode();
    expect(code).toMatch(/^SEO-[A-HJ-NP-Z2-9]{10}$/);
    expect(normalizeCouponCode(" seo-abc12345de ")).toBe("SEO-ABC12345DE");
  });

  it("redeems a valid coupon exactly once per organization", async () => {
    await CouponRepository.create({
      id: "c1",
      code: "SEO-TESTCODE1",
      credits: 100000,
      maxRedemptions: null,
      expiresAt: null,
      note: null,
      createdBy: "admin",
    });

    const first = await CouponRepository.redeem({
      code: "SEO-TESTCODE1",
      organizationId: "org-1",
      nowIso: "2026-11-21T00:00:00.000Z",
      redemptionId: "r1",
    });
    expect(first).toEqual({ ok: true, couponId: "c1", credits: 100000 });

    const second = await CouponRepository.redeem({
      code: "SEO-TESTCODE1",
      organizationId: "org-1",
      nowIso: "2026-11-21T00:00:00.000Z",
      redemptionId: "r2",
    });
    expect(second).toEqual({ ok: false, reason: "already_redeemed" });

    // A different workspace can still redeem.
    const other = await CouponRepository.redeem({
      code: "SEO-TESTCODE1",
      organizationId: "org-2",
      nowIso: "2026-11-21T00:00:00.000Z",
      redemptionId: "r3",
    });
    expect(other.ok).toBe(true);
  });

  it("rolls back the claim when the redemption cap is reached", async () => {
    await CouponRepository.create({
      id: "c2",
      code: "SEO-TESTCODE2",
      credits: 50000,
      maxRedemptions: 1,
      expiresAt: null,
      note: null,
      createdBy: "admin",
    });

    const first = await CouponRepository.redeem({
      code: "SEO-TESTCODE2",
      organizationId: "org-1",
      nowIso: "2026-11-21T00:00:00.000Z",
      redemptionId: "r1",
    });
    expect(first.ok).toBe(true);

    const second = await CouponRepository.redeem({
      code: "SEO-TESTCODE2",
      organizationId: "org-2",
      nowIso: "2026-11-21T00:00:00.000Z",
      redemptionId: "r2",
    });
    expect(second).toEqual({ ok: false, reason: "exhausted" });

    // The rolled-back org can redeem again once capacity frees up, and no
    // orphan claim rows remain.
    const rows = await client().execute("SELECT * FROM coupon_redemptions");
    expect(rows.rows.length).toBe(1);
  });

  it("rejects expired and inactive coupons", async () => {
    await CouponRepository.create({
      id: "c3",
      code: "SEO-EXPIREDCD",
      credits: 10000,
      maxRedemptions: null,
      expiresAt: "2026-01-01T00:00:00.000Z",
      note: null,
      createdBy: "admin",
    });
    await CouponRepository.create({
      id: "c4",
      code: "SEO-DISABLEDC",
      credits: 10000,
      maxRedemptions: null,
      expiresAt: null,
      note: null,
      createdBy: "admin",
    });
    await client().execute(
      "UPDATE coupon_codes SET is_active = 0 WHERE id = 'c4'",
    );

    expect(
      await CouponRepository.redeem({
        code: "SEO-EXPIREDCD",
        organizationId: "org-1",
        nowIso: "2026-11-21T00:00:00.000Z",
        redemptionId: "r1",
      }),
    ).toEqual({ ok: false, reason: "expired" });

    expect(
      await CouponRepository.redeem({
        code: "SEO-DISABLEDC",
        organizationId: "org-1",
        nowIso: "2026-11-21T00:00:00.000Z",
        redemptionId: "r2",
      }),
    ).toEqual({ ok: false, reason: "inactive" });

    expect(
      await CouponRepository.redeem({
        code: "SEO-NOTEXIST1",
        organizationId: "org-1",
        nowIso: "2026-11-21T00:00:00.000Z",
        redemptionId: "r3",
      }),
    ).toEqual({ ok: false, reason: "not_found" });
  });
});
