import { getAuth, hasHostedAuthConfig } from "@/lib/auth";
import { getActiveOrganizationId } from "@/lib/auth-session";
import { getOrCreateDefaultHostedOrganization } from "@/server/auth/default-hosted-organization";
import { AppError } from "@/server/lib/errors";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import type { EnsuredUserContext } from "./types";

export const E2E_USER_ID = "e2e-user-id";
export const E2E_ORG_ID = "e2e-org-id";

async function isE2EBypassEnabled(): Promise<boolean> {
  // Check both Vite's import.meta.env (client + SSR transform) and the
  // Workers env / process.env (runtime via .dev.vars or shell).
  try {
    if (import.meta.env.BYPASS_AUTH === "true") return true;
  } catch {
    // import.meta.env may not be available in all runtimes
  }
  const envValue = await getOptionalEnvValue("BYPASS_AUTH");
  return envValue === "true";
}

async function requireHostedSession(headers: Headers) {
  // E2E bypass: when running Playwright with BYPASS_AUTH enabled, inject a
  // deterministic session so tests don't need a real Google/Better-Auth flow.
  if (await isE2EBypassEnabled()) {
    const fakeUser = {
      id: E2E_USER_ID,
      email: "e2e@test.local",
      emailVerified: true,
      name: "E2E Test User",
    };
    return { user: fakeUser, session: { id: "e2e-session" } };
  }

  if (!hasHostedAuthConfig()) {
    throw new AppError(
      "AUTH_CONFIG_MISSING",
      "Missing Better Auth hosted configuration",
    );
  }

  const session = await getAuth().api.getSession({ headers });

  if (!session?.user?.id || !session.user.email) {
    throw new AppError("UNAUTHENTICATED");
  }

  return session;
}

export async function resolveHostedContext(
  headers: Headers,
): Promise<EnsuredUserContext> {
  const session = await requireHostedSession(headers);

  // E2E bypass: return a deterministic fake context. The server functions
  // that query the DB will still run, but with this fake org/user context.
  if (await isE2EBypassEnabled()) {
    return {
      userId: E2E_USER_ID,
      userEmail: "e2e@test.local",
      emailVerified: true,
      organizationId: E2E_ORG_ID,
    };
  }

  const activeOrganizationId = getActiveOrganizationId(session);

  if (activeOrganizationId) {
    return {
      userId: session.user.id,
      userEmail: session.user.email,
      emailVerified: session.user.emailVerified ?? false,
      organizationId: activeOrganizationId,
    };
  }

  const authApi = getAuth().api;
  const organizationId = await getOrCreateDefaultHostedOrganization(
    session.user.id,
    (body) => authApi.createOrganization({ body }),
  );

  await authApi.setActiveOrganization({ headers, body: { organizationId } });

  return {
    userId: session.user.id,
    userEmail: session.user.email,
    emailVerified: session.user.emailVerified ?? false,
    organizationId,
  };
}
