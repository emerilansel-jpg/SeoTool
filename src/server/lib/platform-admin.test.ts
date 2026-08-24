import { beforeEach, describe, expect, it, vi } from "vitest";

const env = vi.hoisted(() => ({ getOptionalEnvValue: vi.fn() }));

vi.mock("@/server/lib/runtime-env", () => ({
  getOptionalEnvValue: env.getOptionalEnvValue,
}));

import { isPlatformAdmin } from "./platform-admin";

beforeEach(() => {
  vi.clearAllMocks();
  env.getOptionalEnvValue.mockResolvedValue(undefined);
});

describe("isPlatformAdmin", () => {
  it("grants access by a configured stable user id", async () => {
    env.getOptionalEnvValue.mockImplementation(async (key: string) =>
      key === "PLATFORM_ADMIN_USER_IDS" ? " admin-1,admin-2 " : undefined,
    );

    await expect(
      isPlatformAdmin({ userId: "admin-2", userEmail: "user@example.com" }),
    ).resolves.toBe(true);
  });

  it("supports an explicitly configured case-insensitive email allowlist", async () => {
    env.getOptionalEnvValue.mockImplementation(async (key: string) =>
      key === "PLATFORM_ADMIN_EMAILS" ? "Admin@Example.com" : undefined,
    );

    await expect(
      isPlatformAdmin({ userId: "user-1", userEmail: "admin@example.com" }),
    ).resolves.toBe(true);
  });

  it("does not grant admin access when neither runtime allowlist matches", async () => {
    await expect(
      isPlatformAdmin({ userId: "user-1", userEmail: "qa@tester.com" }),
    ).resolves.toBe(false);
  });
});
