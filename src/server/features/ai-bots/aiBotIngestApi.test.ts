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
  AI_BOTS_INGEST_PATH,
  handleAiBotIngestRequest,
} from "./aiBotIngestApi";

function client() {
  if (!testState.client) throw new Error("Test database is not initialized");
  return testState.client;
}

const TOKEN = "test-token-1";

function ingestRequest(body: unknown, token = TOKEN, ip = "198.51.100.5") {
  return new Request(`https://seotool.im${AI_BOTS_INGEST_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("AI bot ingest API", () => {
  beforeAll(async () => {
    await client().execute(
      "CREATE TABLE organization (id text PRIMARY KEY NOT NULL, name text NOT NULL)",
    );
    await client().execute(
      "CREATE TABLE projects (id text PRIMARY KEY NOT NULL, organization_id text, name text, slug text, created_by text, created_at text, updated_at text, archived_at text, name_unique text)",
    );
    await client().execute(`
      CREATE TABLE ai_bot_sites (
        id text PRIMARY KEY NOT NULL,
        project_id text NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
        organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
        domain text NOT NULL,
        ingest_token text NOT NULL UNIQUE,
        robots_compliance text,
        robots_checked_at text,
        last_hit_at text,
        created_at text DEFAULT (current_timestamp) NOT NULL,
        updated_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
    await client().execute(`
      CREATE TABLE ai_bot_hits (
        id text PRIMARY KEY NOT NULL,
        project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
        bot text NOT NULL,
        url text NOT NULL,
        user_agent text,
        status_code integer,
        ip_hash text,
        source text NOT NULL,
        hit_at text NOT NULL,
        created_at text DEFAULT (current_timestamp) NOT NULL
      )
    `);
  });

  beforeEach(async () => {
    await client().execute("DELETE FROM ai_bot_hits");
    await client().execute("DELETE FROM ai_bot_sites");
    await client().execute("DELETE FROM projects");
    await client().execute("DELETE FROM organization");
    await client().execute(
      "INSERT INTO organization (id, name) VALUES ('org-1', 'Org')",
    );
    await client().execute(
      "INSERT INTO projects (id, organization_id, name, slug) VALUES ('proj-1', 'org-1', 'P', 'p')",
    );
    await client().execute(
      `INSERT INTO ai_bot_sites (id, project_id, organization_id, domain, ingest_token) VALUES ('site-1', 'proj-1', 'org-1', 'example.com', '${TOKEN}')`,
    );
  });

  it("rejects unauthenticated and non-POST requests", async () => {
    const noAuth = await handleAiBotIngestRequest(
      ingestRequest({ hits: [] }, "wrong-token"),
    );
    expect(noAuth.status).toBe(401);

    const get = await handleAiBotIngestRequest(
      new Request(`https://seotool.im${AI_BOTS_INGEST_PATH}`, {
        method: "GET",
      }),
    );
    expect(get.status).toBe(405);
  });

  it("accepts known AI bot hits and hashes the IP", async () => {
    const response = await handleAiBotIngestRequest(
      ingestRequest({
        hits: [
          {
            url: "/blog/geo-guide",
            userAgent:
              "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)",
            statusCode: 200,
            at: "2026-11-20T10:00:00Z",
          },
        ],
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      accepted: number;
      rejected: number;
    };
    expect(body.accepted).toBe(1);
    expect(body.rejected).toBe(0);

    const rows = await client().execute("SELECT * FROM ai_bot_hits");
    expect(rows.rows).toHaveLength(1);
    const row = rows.rows[0] as Record<string, unknown>;
    expect(row.bot).toBe("openai_gptbot");
    expect(row.url).toBe("https://example.com/blog/geo-guide");
    expect(row.source).toBe("ingest");
    expect(row.ip_hash).toHaveLength(16);
  });

  it("rejects unknown crawler user agents", async () => {
    const response = await handleAiBotIngestRequest(
      ingestRequest({
        hits: [{ url: "/page", userAgent: "curl/8.4.0" }],
      }),
    );
    const body = (await response.json()) as {
      accepted: number;
      rejected: number;
    };
    expect(body.accepted).toBe(0);
    expect(body.rejected).toBe(1);
  });

  it("normalizes bare paths onto the site domain", async () => {
    await handleAiBotIngestRequest(
      ingestRequest({
        hits: [
          {
            url: "pricing",
            userAgent: "Mozilla/5.0 (compatible; PerplexityBot/1.0)",
          },
        ],
      }),
    );
    const rows = await client().execute("SELECT url FROM ai_bot_hits");
    expect((rows.rows[0] as Record<string, unknown>).url).toBe(
      "https://example.com/pricing",
    );
  });
});
