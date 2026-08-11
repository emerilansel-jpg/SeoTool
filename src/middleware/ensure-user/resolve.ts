import { resolveHostedContext } from "./hosted";
import type { EnsuredUserContext } from "./types";

// Resolves the authenticated user for a request's headers. Shared by
// ensureUserMiddleware (server functions) and raw API routes, which can't use
// function middleware.
//
// The app is hosted-only now: every request resolves through a Better Auth
// session. The previous Cloudflare Access and local_noauth paths have been
// removed.
export async function resolveUserContextFromHeaders(
  headers: Headers,
): Promise<EnsuredUserContext> {
  return resolveHostedContext(headers);
}
