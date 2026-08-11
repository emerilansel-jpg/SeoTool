import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SelfHostTelemetryDependencies } from "./self-host-telemetry";
import {
  getCheckIntervalMs,
  getHeartbeatIntervalMs,
} from "./self-host-telemetry";

vi.mock("cloudflare:workers", () => ({ env: {} }));
vi.mock("@/db", () => ({ db: {} }));

type StoredState = {
  installId: string;
  installedAt: Date | null;
  lastHeartbeatAt: Date | null;
  lastVersion: string | null;
  mcpToolCallCount: number;
};

const NOW = new Date("2026-07-18T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const emptyCounts = {
  userCount: 0,
  projectCount: 0,
  siteAuditCount: 0,
  rankTrackingKeywordCount: 0,
  savedKeywordCount: 0,
  gscConnected: false,
  samChatUsed: false,
};

function createHarness(
  initialState?: Partial<StoredState>,
  appVersion = "1.0.0",
) {
  const state: StoredState = {
    installId: "install-1",
    installedAt: new Date(NOW.getTime() - 3 * 60 * 60 * 1000),
    lastHeartbeatAt: null,
    lastVersion: null,
    mcpToolCallCount: 0,
    ...initialState,
  };
  const sendHeartbeat = vi.fn<SelfHostTelemetryDependencies["sendHeartbeat"]>();
  const claimHeartbeat = vi.fn(async (now: Date) => {
    if (
      state.lastHeartbeatAt &&
      now.getTime() - state.lastHeartbeatAt.getTime() <= DAY_MS
    ) {
      return null;
    }

    const previous = { ...state };
    state.lastHeartbeatAt = now;
    return previous;
  });
  const markHeartbeatSent = vi.fn(async (currentVersion: string) => {
    state.lastVersion = currentVersion;
    state.mcpToolCallCount = 0;
  });
  const dependencies: Partial<SelfHostTelemetryDependencies> = {
    now: () => NOW,
    isNonProductionBuild: () => false,
    claimHeartbeat,
    collectCounts: async () => emptyCounts,
    collectSetupIssues: async () => [],
    sendHeartbeat,
    markHeartbeatSent,
    getDbBackend: () => "d1",
    version: appVersion,
  };

  return {
    state,
    dependencies,
    sendHeartbeat,
    claimHeartbeat,
    markHeartbeatSent,
  };
}

async function runHeartbeat(harness: ReturnType<typeof createHarness>) {
  const { maybeSendSelfHostHeartbeat } = await import("./self-host-telemetry");
  await maybeSendSelfHostHeartbeat({
    dependencies: harness.dependencies,
    skipMemoryThrottle: true,
  });
}

describe("getHeartbeatIntervalMs", () => {
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;

  it("uses the 5-minute onboarding cadence during the first two hours", () => {
    expect(getHeartbeatIntervalMs(0)).toBe(5 * MINUTE);
    expect(getHeartbeatIntervalMs(2 * HOUR - 1)).toBe(5 * MINUTE);
  });

  it("uses the daily cadence from two hours onward", () => {
    expect(getHeartbeatIntervalMs(2 * HOUR)).toBe(24 * HOUR);
    expect(getHeartbeatIntervalMs(Number.POSITIVE_INFINITY)).toBe(24 * HOUR);
  });
});

describe("getCheckIntervalMs", () => {
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;

  it("checks immediately when the install age is unknown", () => {
    expect(getCheckIntervalMs(null)).toBe(0);
  });

  it("polls every minute during onboarding so 5-minute beats don't alias", () => {
    expect(getCheckIntervalMs(0)).toBe(MINUTE);
    expect(getCheckIntervalMs(2 * HOUR - 1)).toBe(MINUTE);
  });

  it("polls every 15 minutes once onboarding is over", () => {
    expect(getCheckIntervalMs(2 * HOUR)).toBe(15 * MINUTE);
  });
});

describe("maybeSendSelfHostHeartbeat", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("AUTH_MODE", "hosted");
  });

  // The app is hosted-only now. The self-host telemetry path checks
  // isHostedServerAuthMode() first, which always returns true, so the
  // heartbeat never fires in production. This test guards that contract.
  it("never sends in hosted mode (the app is hosted-only now)", async () => {
    const harness = createHarness();

    await runHeartbeat(harness);

    expect(harness.claimHeartbeat).not.toHaveBeenCalled();
    expect(harness.sendHeartbeat).not.toHaveBeenCalled();
  });

  it("does not send from non-production builds (dev, test, preview)", async () => {
    const harness = createHarness();
    delete harness.dependencies.isNonProductionBuild;

    await runHeartbeat(harness);

    expect(harness.claimHeartbeat).not.toHaveBeenCalled();
    expect(harness.sendHeartbeat).not.toHaveBeenCalled();
  });
});
