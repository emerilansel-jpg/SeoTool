import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";
import { describe, expect, it } from "vitest";

describe("Keyword Research Pro SQLite migration", () => {
  it("creates all normalized membership and referral tables", async () => {
    const client = createClient({ url: "file::memory:" });
    try {
      await client.execute("PRAGMA foreign_keys=ON");
      await client.execute(
        "CREATE TABLE organization (id text PRIMARY KEY NOT NULL)",
      );
      const migration = readFileSync(
        new URL("../../drizzle/0056_keyword_research_pro.sql", import.meta.url),
        "utf8",
      );
      for (const statement of migration
        .split("--> statement-breakpoint")
        .map((value) => value.trim())
        .filter(Boolean)) {
        await client.execute(statement);
      }
      const result = await client.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'keyword_pro_%' ORDER BY name",
      );
      expect(result.rows.map((row) => row.name)).toEqual([
        "keyword_pro_memberships",
        "keyword_pro_referral_attributions",
        "keyword_pro_referral_codes",
        "keyword_pro_referral_commissions",
      ]);
    } finally {
      client.close();
    }
  });
});
