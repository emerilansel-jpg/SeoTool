import { beforeEach, describe, expect, it, vi } from "vitest";

const env = vi.hoisted(() => ({ getRequiredEnvValue: vi.fn() }));

vi.mock("@/server/lib/runtime-env", () => ({
  getRequiredEnvValue: env.getRequiredEnvValue,
}));

import { clearPaypalAccessTokenCache, paypal } from "./paypal";

beforeEach(() => {
  vi.clearAllMocks();
  clearPaypalAccessTokenCache();
});

describe("PayPal buyer billing management URL", () => {
  it("uses the live Automatic Payments page in live mode", async () => {
    env.getRequiredEnvValue.mockResolvedValue("live");
    await expect(paypal.billingPortal.createSession("I-123")).resolves.toEqual({
      urls: { billing_portal: "https://www.paypal.com/myaccount/autopay/" },
    });
  });

  it("keeps sandbox accounts on the sandbox PayPal host", async () => {
    env.getRequiredEnvValue.mockResolvedValue("sandbox");
    await expect(paypal.billingPortal.createSession("I-123")).resolves.toEqual({
      urls: {
        billing_portal: "https://www.sandbox.paypal.com/myaccount/autopay/",
      },
    });
  });

  it("rejects an invalid mode instead of silently using sandbox", async () => {
    env.getRequiredEnvValue.mockResolvedValue("production");
    await expect(paypal.billingPortal.createSession("I-123")).rejects.toThrow(
      'PAYPAL_MODE must be exactly "live" or "sandbox"',
    );
  });
});
