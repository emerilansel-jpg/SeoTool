import { describe, expect, it } from "vitest";
import {
  getHostedTurnstileSecretKey,
  hasHostedTurnstileConfig,
} from "@/lib/auth-turnstile";

describe("hosted Turnstile auth config", () => {
  it("enforces captcha from the server secret regardless of AUTH_MODE (hosted-only now)", () => {
    expect(
      getHostedTurnstileSecretKey({
        AUTH_MODE: "hosted",
        TURNSTILE_SECRET_KEY: " server-secret ",
      }),
    ).toBe("server-secret");
  });

  it("fails hosted config when a runtime site key is configured without a secret", () => {
    expect(
      hasHostedTurnstileConfig({
        AUTH_MODE: "hosted",
        TURNSTILE_SITE_KEY: "site-key",
      }),
    ).toBe(false);
  });

  it("allows hosted config with no runtime site key so build/runtime divergence can still enforce from the secret", () => {
    expect(
      hasHostedTurnstileConfig({
        AUTH_MODE: "hosted",
        TURNSTILE_SECRET_KEY: "server-secret",
      }),
    ).toBe(true);
  });
});
