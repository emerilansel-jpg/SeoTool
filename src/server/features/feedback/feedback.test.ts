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
  checkFeedbackRateLimit,
  notifyReporterOfResolution,
  resetFeedbackRateLimit,
  submitFeedback,
} from "./feedbackService";
import { FeedbackRepository } from "./feedbackRepository";

// Owner notification and resolved emails are external; tests observe calls.
const emailCalls: string[] = [];
vi.mock("@/server/email/feedbackEmails", () => ({
  sendFeedbackOwnerEmail: vi.fn(async () => {
    emailCalls.push("owner");
    return true;
  }),
  sendFeedbackResolvedEmail: vi.fn(async (input: { displayNumber: number }) => {
    emailCalls.push(`resolved:${input.displayNumber}`);
    return true;
  }),
}));

function client() {
  if (!testState.client) throw new Error("Test database is not initialized");
  return testState.client;
}

describe("feedback service", () => {
  beforeAll(async () => {
    await client().execute(
      "CREATE TABLE feedback (id text PRIMARY KEY NOT NULL, display_number integer NOT NULL, type text NOT NULL, title text NOT NULL, description text NOT NULL, email text NOT NULL, user_id text, screenshot_base64 text, screenshot_mime text, page_url text, user_agent text, app_version text, status text DEFAULT 'new' NOT NULL, admin_note text, resolved_in_version text, notified_at text, created_at text DEFAULT (current_timestamp) NOT NULL, updated_at text DEFAULT (current_timestamp) NOT NULL, resolved_at text)",
    );
  });

  beforeEach(async () => {
    await client().execute("DELETE FROM feedback");
    emailCalls.length = 0;
    resetFeedbackRateLimit("ip:tester@x.com");
  });

  const validInput = {
    type: "bug" as const,
    title: "The audit button does nothing",
    description: "Clicking Run Free Audit does nothing on Chrome.",
    email: "tester@x.com",
  };

  it("stores a report with a sequential display number and notifies the owner", async () => {
    const first = await submitFeedback({
      data: validInput,
      context: { userId: null, clientIp: "1.2.3.4" },
    });
    const second = await submitFeedback({
      data: { ...validInput, type: "feature" as const },
      context: { userId: "user-1", clientIp: "1.2.3.4" },
    });

    expect(first.displayNumber).toBe(1);
    expect(second.displayNumber).toBe(2);
    expect(emailCalls).toEqual(["owner", "owner"]);
  });

  it("rate limits to 5 reports per hour per ip+email", async () => {
    for (let i = 0; i < 5; i += 1) {
      const now = Date.now();
      expect(checkFeedbackRateLimit("ip:spam@x.com", now)).toBe(true);
    }
    expect(checkFeedbackRateLimit("ip:spam@x.com", Date.now())).toBe(false);

    // The service surfaces the limit as a friendly validation error.
    resetFeedbackRateLimit("ip:spam@x.com");
    for (let i = 0; i < 5; i += 1) {
      await submitFeedback({
        data: validInput,
        context: { userId: null, clientIp: "9.9.9.9" },
      });
    }
    await expect(
      submitFeedback({
        data: validInput,
        context: { userId: null, clientIp: "9.9.9.9" },
      }),
    ).rejects.toThrow("several reports recently");
  });

  it("emails the reporter exactly once when a report is marked resolved", async () => {
    const submitted = await submitFeedback({
      data: validInput,
      context: { userId: "user-1", clientIp: "1.2.3.4" },
    });
    await FeedbackRepository.updateStatus({
      id: (await FeedbackRepository.list({ page: 1, pageSize: 10 })).items[0]
        .id,
      status: "resolved",
      adminNote: "Fixed in the latest release.",
      resolvedInVersion: "1.1.0",
      nowIso: new Date().toISOString(),
    });
    const id = (await FeedbackRepository.list({ page: 1, pageSize: 10 }))
      .items[0].id;

    const first = await notifyReporterOfResolution({
      id,
      email: "tester@x.com",
      displayNumber: submitted.displayNumber,
      title: validInput.title,
      messageToUser: "Fixed in the latest release.",
    });
    expect(first).toEqual({ emailed: true, claimed: true });

    // Retrying the same resolution (double click, retry, page reload) must
    // not email the reporter twice.
    const second = await notifyReporterOfResolution({
      id,
      email: "tester@x.com",
      displayNumber: submitted.displayNumber,
      title: validInput.title,
      messageToUser: "Fixed in the latest release.",
    });
    expect(second).toEqual({ emailed: false, claimed: false });

    const resolvedEmails = emailCalls.filter((call) =>
      call.startsWith("resolved:"),
    );
    expect(resolvedEmails).toHaveLength(1);
  });
});
