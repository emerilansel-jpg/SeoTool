import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/server/lib/errors";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("https://seotool.im/privacy"),
}));

const resolveMock = vi.hoisted(() => ({
  resolveUserContextFromHeaders: vi.fn(),
}));

vi.mock("./ensure-user/resolve", () => resolveMock);

vi.mock("@/middleware/ensure-user/hosted", () => ({
  E2E_ORG_ID: "e2e-org-id",
  E2E_USER_ID: "e2e-user-id",
}));

vi.mock("@/server/features/projects/repositories/ProjectRepository", () => ({
  ProjectRepository: {
    getProjectForOrganization: vi.fn(async () => null),
  },
}));

import { ensureUserMiddleware } from "./ensureUser";

type MiddlewareHandler = (opts: {
  data?: unknown;
  serverFnMeta?: { id: string; name: string; filename: string };
  next: (ctx?: { context?: Record<string, unknown> }) => Promise<unknown>;
}) => Promise<unknown>;

const handler =
  // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- tests invoke the compiled middleware handler shape directly
  (
    ensureUserMiddleware as unknown as {
      options: { server: MiddlewareHandler };
    }
  ).options.server;

const authenticatedContext = {
  userId: "user-1",
  userEmail: "user@example.com",
  emailVerified: true,
  organizationId: "org-1",
};

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

beforeEach(() => {
  resolveMock.resolveUserContextFromHeaders.mockReset();
});

describe("ensureUserMiddleware anonymous access", () => {
  it("lets public CMS functions run without a session", async () => {
    resolveMock.resolveUserContextFromHeaders.mockRejectedValue(
      new AppError("UNAUTHENTICATED", "No session"),
    );
    const next = vi.fn(async () => ({ ok: true }));

    const result = await handler({
      data: { slug: "privacy" },
      serverFnMeta: cmsMeta,
      next,
    });

    expect(result).toEqual({ ok: true });
  });

  it("still rejects anonymous calls to non-public functions", async () => {
    resolveMock.resolveUserContextFromHeaders.mockRejectedValue(
      new AppError("UNAUTHENTICATED", "No session"),
    );
    const next = vi.fn(async () => ({ ok: true }));

    await expect(
      handler({ data: { projectId: "p1" }, serverFnMeta: toolMeta, next }),
    ).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    expect(next).not.toHaveBeenCalled();
  });

  it("scopes the anonymous allowlist to the CMS file, not the function name", async () => {
    resolveMock.resolveUserContextFromHeaders.mockRejectedValue(
      new AppError("UNAUTHENTICATED", "No session"),
    );
    const next = vi.fn(async () => ({ ok: true }));

    await expect(
      handler({
        data: {},
        serverFnMeta: { ...cmsMeta, filename: "src/serverFunctions/audit.ts" },
        next,
      }),
    ).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
  });

  it("keeps resolving the user for public functions when a session exists", async () => {
    resolveMock.resolveUserContextFromHeaders.mockResolvedValue(
      authenticatedContext,
    );
    const next = vi.fn(async () => ({ ok: true }));

    await handler({ data: { slug: "privacy" }, serverFnMeta: cmsMeta, next });

    // Authenticated reads keep their user context so caching/analytics stay consistent.
    expect(next).toHaveBeenCalled();
  });

  it("renders public content even when the session cookie is stale", async () => {
    resolveMock.resolveUserContextFromHeaders.mockRejectedValue(
      new AppError("UNAUTHENTICATED", "Expired session"),
    );
    const next = vi.fn(async () => ({ ok: true }));

    const result = await handler({
      data: { slug: "privacy" },
      serverFnMeta: cmsMeta,
      next,
    });

    expect(result).toEqual({ ok: true });
  });
});
