// oxlint-disable typescript-eslint(no-unsafe-type-assertion)
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/billing/subscription", () => ({
  customerHasPaidPlan: vi.fn(async () => false),
}));

vi.mock("@/server/lib/runtime-env", () => ({
  isHostedServerAuthMode: vi.fn(async () => true),
  getOptionalEnvValue: vi.fn(async () => undefined),
}));

vi.mock("@/server/lib/platform-admin", () => ({
  isPlatformAdmin: vi.fn(async () => false),
}));

import { paidPlanGateMiddleware } from "./paid-plan-gate";

type MiddlewareHandler = (opts: {
  context?: Record<string, unknown>;
  serverFnMeta?: { id: string; name: string; filename: string };
  next: (ctx?: { context?: Record<string, unknown> }) => Promise<unknown>;
}) => Promise<unknown>;

const handler = (
  paidPlanGateMiddleware as unknown as {
    options: { server: MiddlewareHandler };
  }
).options.server;

const cmsMeta = {
  id: "fn-1",
  name: "getPublishedPage",
  filename: "src/serverFunctions/cms-public.ts",
};

const toolMeta = {
  id: "fn-2",
  name: "runAudit",
  filename: "src/serverFunctions/audit.ts",
};

const anonymousContext = {};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("paidPlanGateMiddleware hosted mode", () => {
  it("lets anonymous callers read public CMS functions (legal/blog pages)", async () => {
    const next = vi.fn(async () => ({ ok: true }));

    const result = await handler({
      context: anonymousContext,
      serverFnMeta: cmsMeta,
      next,
    });

    expect(result).toEqual({ ok: true });
  });

  it("still blocks anonymous callers on gated tool functions", async () => {
    const next = vi.fn(async () => ({ ok: true }));

    await expect(
      handler({ context: anonymousContext, serverFnMeta: toolMeta, next }),
    ).rejects.toMatchObject({ code: "PAYMENT_REQUIRED" });
    expect(next).not.toHaveBeenCalled();
  });
});
