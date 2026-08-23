import { env } from "cloudflare:workers";

type DatabaseProvider = "d1" | "postgres";

export function getDatabaseProvider(): DatabaseProvider {
  const provider = Reflect.get(env, "DATABASE_PROVIDER");

  if (provider === "postgres") {
    return "postgres";
  }

  if (provider === "d1" || provider === undefined || provider === "") {
    return "d1";
  }

  throw new Error(
    `Unsupported DATABASE_PROVIDER "${String(provider)}". Expected "d1" or "postgres".`,
  );
}

// On Cloudflare Workers, Postgres is reachable only through the HYPERDRIVE
// binding. In self-hosted Docker (vite preview, no workerd) the binding
// resolves to `localConnectionString` from wrangler.jsonc, which points at a
// host-local dev database (127.0.0.1:15432) that does not exist inside the
// container. A direct POSTGRES_DATABASE_URL must therefore take precedence
// there.
export function getPostgresConnectionString() {
  const directUrl: unknown = Reflect.get(env, "POSTGRES_DATABASE_URL");
  if (typeof directUrl === "string" && directUrl.trim()) {
    return directUrl.trim();
  }

  const hyperdrive = Reflect.get(env, "HYPERDRIVE") as
    | { connectionString?: string }
    | undefined;
  const hyperdriveUrl = hyperdrive?.connectionString?.trim();
  if (hyperdriveUrl) {
    return hyperdriveUrl;
  }

  throw new Error(
    "DATABASE_PROVIDER=postgres requires POSTGRES_DATABASE_URL (self-hosted) or a HYPERDRIVE binding (Cloudflare).",
  );
}
