import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3101",
    actionTimeout: 5_000,
    navigationTimeout: 30_000,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    // E2E isolation: the test server is launched with the auth-bypass and
    // fixture flags injected here so they never leak into `npm run dev` via
    // .dev.vars. `env` is used instead of a shell `VAR=x` prefix because that
    // syntax fails on Windows cmd.
    command: "pnpm exec vite dev --host 127.0.0.1 --strictPort",
    url: "http://localhost:3101",
    env: {
      BYPASS_AUTH: "true",
      BYPASS_EMAIL_VERIFICATION: "true",
      VITE_E2E_BYPASS_AUTH: "true",
      VITE_E2E_DOMAIN_FIXTURES: "1",
      VITE_E2E_KEYWORD_FIXTURES: "1",
      PLATFORM_ADMIN_USER_IDS: "e2e-user-id",
      PORT: "3101",
    },
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
