import type { CreateMcpHandlerOptions } from "agents/mcp";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("@/server/billing/quota-gate", () => ({
  assertFeatureQuota: vi.fn().mockResolvedValue(undefined),
  assertGaugeFeature: vi.fn().mockResolvedValue(undefined),
  assertFeatureAccess: vi.fn().mockResolvedValue(undefined),
  isFeatureAvailable: vi.fn().mockResolvedValue(true),
}));
vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getPlanTier: vi.fn().mockResolvedValue("free"),
    getUsageQuota: vi.fn().mockResolvedValue(null),
    incrementUsageQuota: vi.fn().mockResolvedValue(true),
  },
}));

const serverMocks = vi.hoisted(() => ({
  nextServerId: 0,
  serverIds: new WeakMap<McpServer, number>(),
  lastServer: undefined as McpServer | undefined,
}));

vi.mock("@/server/mcp/server", () => ({
  registerOpenSeoMcpTools: vi.fn(),
}));

vi.mock("agents/mcp", () => ({
  createMcpHandler: (_server: McpServer, options: CreateMcpHandlerOptions) => {
    serverMocks.nextServerId += 1;
    serverMocks.serverIds.set(_server, serverMocks.nextServerId);
    serverMocks.lastServer = _server;

    return async () =>
      new Response(
        JSON.stringify({
          serverId: serverMocks.serverIds.get(_server),
          options,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
  },
}));

// oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- test mock for ExecutionContext
const _ctx = {
  waitUntil() {},
  passThroughOnException() {},
  props: {},
} as unknown as ExecutionContext;

const _transportOptionsSchema = z.object({
  serverId: z.number().optional(),
  options: z.object({
    route: z.string().optional(),
    enableJsonResponse: z.boolean().optional(),
    authContext: z
      .object({
        props: z.record(z.string(), z.unknown()),
      })
      .optional(),
  }),
});

function _createMcpRequest() {
  return new Request("https://open-seo.test/mcp", {
    method: "POST",
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
    }),
  });
}

describe("handleSelfHostedOpenSeoMcpRequest (removed)", () => {
  // The self-hosted MCP path is gone — the app is hosted-only now. The handler
  // is kept as a 404 stub for backward compatibility with any caller that still
  // references it.
  it("returns 404 — self-hosted MCP is no longer supported", async () => {
    const { handleSelfHostedOpenSeoMcpRequest } =
      await import("@/server/mcp/transport");

    const response = await handleSelfHostedOpenSeoMcpRequest();
    expect(response.status).toBe(404);
  }, 20000);
});
