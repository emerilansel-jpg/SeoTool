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

import { GscRankTrackerRepository } from "./GscRankTrackerRepository";

function client() {
  if (!testState.client) throw new Error("Test database is not initialized");
  return testState.client;
}

const ORG = "org-1";
const PROJECT = "proj-1";

describe("GSC rank tracker repository", () => {
  beforeAll(async () => {
    // Each CREATE runs as one statement — the in-memory libsql harness only
    // executes a single statement per execute() call.
    await client().execute(
      "CREATE TABLE organization (id text PRIMARY KEY NOT NULL, name text NOT NULL)",
    );
    await client().execute(
      "CREATE TABLE projects (id text PRIMARY KEY NOT NULL, organization_id text, name text, slug text, created_by text, created_at text, updated_at text, archived_at text, name_unique text)",
    );
    await client().execute(`
      CREATE TABLE gsc_tracked_keywords (
        id text PRIMARY KEY NOT NULL,
        project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
        keyword text NOT NULL,
        last_position real,
        last_impressions integer DEFAULT 0 NOT NULL,
        last_clicks integer DEFAULT 0 NOT NULL,
        last_url text,
        last_day text,
        status text DEFAULT 'active' NOT NULL,
        first_seen_at text DEFAULT (current_timestamp) NOT NULL,
        last_synced_at text,
        created_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
    await client().execute(
      "CREATE UNIQUE INDEX gsc_tracked_keywords_project_keyword_idx ON gsc_tracked_keywords (project_id, keyword)",
    );
    await client().execute(`
      CREATE TABLE gsc_rank_history (
        id text PRIMARY KEY NOT NULL,
        project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        keyword_id text NOT NULL REFERENCES gsc_tracked_keywords(id) ON DELETE CASCADE,
        day text NOT NULL,
        position real,
        impressions integer DEFAULT 0 NOT NULL,
        clicks integer DEFAULT 0 NOT NULL,
        url text,
        updated_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
    await client().execute(
      "CREATE UNIQUE INDEX gsc_rank_history_keyword_day_idx ON gsc_rank_history (keyword_id, day)",
    );
  });

  beforeEach(async () => {
    await client().execute("DELETE FROM gsc_rank_history");
    await client().execute("DELETE FROM gsc_tracked_keywords");
    await client().execute("DELETE FROM projects");
    await client().execute("DELETE FROM organization");
    await client().execute(
      "INSERT INTO organization (id, name) VALUES ('org-1', 'Test Org')",
    );
    await client().execute(
      "INSERT INTO projects (id, organization_id, name, slug) VALUES ('proj-1', 'org-1', 'P', 'p')",
    );
  });

  it("upserts keywords and history rows from a sync batch", async () => {
    const result = await GscRankTrackerRepository.syncKeywordDays(
      PROJECT,
      ORG,
      [
        {
          keyword: "seo tools",
          day: "2026-11-19",
          position: 4.2,
          impressions: 120,
          clicks: 8,
          url: "https://example.com/seo-tools",
        },
        {
          keyword: "rank tracker",
          day: "2026-11-19",
          position: 11.5,
          impressions: 60,
          clicks: 2,
          url: null,
        },
      ],
    );

    expect(result.keywordsTouched).toBe(2);
    expect(result.historyRows).toBe(2);
    expect(result.syncedToDay).toBe("2026-11-19");

    const list = await GscRankTrackerRepository.listKeywords({
      projectId: PROJECT,
      limit: 10,
      offset: 0,
      sortBy: "position",
      sortDir: "asc",
    });
    expect(list.total).toBe(2);
    expect(list.rows[0].keyword).toBe("seo tools");
    expect(list.rows[0].lastPosition).toBeCloseTo(4.2);
    expect(list.rows[0].lastUrl).toBe("https://example.com/seo-tools");
  });

  it("merges duplicate keyword-day rows keeping the higher impressions", async () => {
    await GscRankTrackerRepository.syncKeywordDays(PROJECT, ORG, [
      {
        keyword: "kw",
        day: "2026-11-18",
        position: 5,
        impressions: 10,
        clicks: 1,
        url: null,
      },
    ]);
    await GscRankTrackerRepository.syncKeywordDays(PROJECT, ORG, [
      {
        keyword: "kw",
        day: "2026-11-18",
        position: 5,
        impressions: 25,
        clicks: 2,
        url: null,
      },
    ]);

    const list = await GscRankTrackerRepository.listKeywords({
      projectId: PROJECT,
      limit: 10,
      offset: 0,
      sortBy: "keyword",
      sortDir: "asc",
    });
    expect(list.total).toBe(1);
    const { getKeywordWithHistory } = GscRankTrackerRepository;
    const detail = await getKeywordWithHistory({
      projectId: PROJECT,
      keyword: "kw",
      days: 7,
    });
    expect(detail?.history).toHaveLength(1);
    expect(detail?.history[0].impressions).toBe(25);
  });

  it("updates denormalized metrics to the latest day and tracks the sync cursor", async () => {
    await GscRankTrackerRepository.syncKeywordDays(PROJECT, ORG, [
      {
        keyword: "kw",
        day: "2026-11-17",
        position: 9,
        impressions: 5,
        clicks: 0,
        url: null,
      },
    ]);
    await GscRankTrackerRepository.syncKeywordDays(PROJECT, ORG, [
      {
        keyword: "kw",
        day: "2026-11-19",
        position: 3,
        impressions: 50,
        clicks: 4,
        url: "https://example.com/updated",
      },
    ]);

    const list = await GscRankTrackerRepository.listKeywords({
      projectId: PROJECT,
      limit: 10,
      offset: 0,
      sortBy: "position",
      sortDir: "asc",
    });
    expect(list.rows[0].lastDay).toBe("2026-11-19");
    expect(list.rows[0].lastPosition).toBeCloseTo(3);

    const cursor = await GscRankTrackerRepository.getLastSyncedDay(PROJECT);
    expect(cursor).toBe("2026-11-19");
  });

  it("summarizes tracked counts and weekly movement", async () => {
    const today = new Date();
    const dayAt = (offset: number) => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - offset);
      return d.toISOString().slice(0, 10);
    };
    // keyword A: position 8 in the previous week, 3 in the last week (improved)
    // keyword B: position 3 -> 9 (declined)
    await GscRankTrackerRepository.syncKeywordDays(PROJECT, ORG, [
      {
        keyword: "kw-a",
        day: dayAt(10),
        position: 8,
        impressions: 10,
        clicks: 0,
        url: null,
      },
      {
        keyword: "kw-a",
        day: dayAt(2),
        position: 3,
        impressions: 10,
        clicks: 0,
        url: null,
      },
      {
        keyword: "kw-b",
        day: dayAt(10),
        position: 3,
        impressions: 10,
        clicks: 0,
        url: null,
      },
      {
        keyword: "kw-b",
        day: dayAt(2),
        position: 9,
        impressions: 10,
        clicks: 0,
        url: null,
      },
    ]);

    const summary = await GscRankTrackerRepository.summarize(PROJECT);
    expect(summary.trackedCount).toBe(2);
    expect(summary.improved).toBe(1);
    expect(summary.declined).toBe(1);
    expect(summary.avgPosition).not.toBeNull();
  });

  it("ignores keywords for list counts but keeps their history", async () => {
    await GscRankTrackerRepository.syncKeywordDays(PROJECT, ORG, [
      {
        keyword: "keep",
        day: "2026-11-19",
        position: 2,
        impressions: 10,
        clicks: 1,
        url: null,
      },
      {
        keyword: "noise",
        day: "2026-11-19",
        position: 50,
        impressions: 2,
        clicks: 0,
        url: null,
      },
    ]);
    await GscRankTrackerRepository.setKeywordStatus(
      PROJECT,
      "noise",
      "ignored",
    );

    const summary = await GscRankTrackerRepository.summarize(PROJECT);
    expect(summary.trackedCount).toBe(1);
  });
});
