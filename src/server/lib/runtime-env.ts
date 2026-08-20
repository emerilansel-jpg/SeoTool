import { isHostedAuthMode } from "@/lib/auth-mode";

let workersEnvPromise: Promise<Record<string, unknown> | null> | null = null;

// ---------------------------------------------------------------------------
// Admin settings overrides (app_settings table).
//
// Values stored by the admin UI win over env vars; empty values fall back to
// env. The DB read is cached per isolate (60s) with in-flight dedup so the
// hot path (every env read) costs at most one query per minute. All failures
// degrade silently to env-only behavior.
// ---------------------------------------------------------------------------

const SETTINGS_CACHE_TTL_MS = 60_000;

let settingsCache: { values: Map<string, string>; at: number } | null = null;
let settingsLoadPromise: Promise<Map<string, string>> | null = null;

/** Drop the cached admin settings so the next env read picks up a fresh
 *  value. Called after the admin UI writes a setting. */
export function clearAdminSettingsCache(): void {
  settingsCache = null;
}

async function loadAdminSettings(): Promise<Map<string, string>> {
  try {
    // Dynamic import keeps @/db out of module init (and out of unit tests
    // that never touch overrides); any failure just means env-only mode.
    const [{ db }, schemaModule] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);
    const rows = await db
      .select({
        key: schemaModule.appSettings.key,
        value: schemaModule.appSettings.value,
      })
      .from(schemaModule.appSettings);
    return new Map(
      rows.filter((row) => row.value !== "").map((row) => [row.key, row.value]),
    );
  } catch {
    return new Map();
  }
}

async function getAdminSettingsOverrides(): Promise<Map<string, string>> {
  if (settingsCache && Date.now() - settingsCache.at < SETTINGS_CACHE_TTL_MS) {
    return settingsCache.values;
  }
  if (!settingsLoadPromise) {
    settingsLoadPromise = loadAdminSettings().then((values) => {
      settingsCache = { values, at: Date.now() };
      settingsLoadPromise = null;
      return values;
    });
  }
  return settingsLoadPromise;
}

export async function getOptionalEnvValue(
  name: string,
): Promise<string | undefined> {
  const overrides = await getAdminSettingsOverrides();
  const override = overrides.get(name);
  if (override) {
    return override;
  }
  return getEnvValueSync((await getWorkersEnv()) ?? {}, name);
}

/**
 * Sync variant for callers that already hold an env record (e.g. a Durable
 * Object's `this.env`, needed because Think's `getModel()` hook is sync).
 * Same policy as the async form: process.env first (where local `.env.local`
 * secrets land in dev), skipping empty strings, then the given env.
 */
export function getEnvValueSync(
  // `object` so interface-typed envs (e.g. Cloudflare.Env) are accepted
  // without a cast.
  env: object,
  name: string,
): string | undefined {
  const processValue =
    typeof process !== "undefined" ? process.env?.[name] : undefined;
  if (processValue) {
    return processValue;
  }
  const value: unknown = Reflect.get(env, name);
  return typeof value === "string" && value !== "" ? value : undefined;
}

export async function getRequiredEnvValue(name: string): Promise<string> {
  const value = await getOptionalEnvValue(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Always true — the app is hosted-only now. Kept as an async function for
// call-site compatibility; the await is harmless and tree-shaken branches are
// eliminated by the compiler.
export async function isHostedServerAuthMode(): Promise<boolean> {
  return isHostedAuthMode(await getOptionalEnvValue("AUTH_MODE"));
}

async function getWorkersEnv(): Promise<Record<string, unknown> | null> {
  if (!workersEnvPromise) {
    workersEnvPromise = loadWorkersEnv();
  }
  return workersEnvPromise;
}

async function loadWorkersEnv(): Promise<Record<string, unknown> | null> {
  try {
    const workersModule = await import("cloudflare:workers");
    return isRecord(workersModule.env) ? workersModule.env : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
