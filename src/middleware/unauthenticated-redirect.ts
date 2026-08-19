import { createMiddleware } from "@tanstack/react-start";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";

// Paths that must stay reachable without a session: marketing pages, auth
// pages, API endpoints, server-function RPC, and static asset roots.
const PUBLIC_PATH_PREFIXES = [
  "/pricing",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/accept-invitation",
  "/oauth-consent",
  "/api/",
  "/_serverFn/",
  "/.well-known/",
  "/assets/",
  "/favicon",
  "/apple-touch-icon",
  "/site.webmanifest",
];

async function isE2EBypassEnabled(): Promise<boolean> {
  // Same check as ensure-user/hosted.ts: the Vite define first, then the
  // runtime env, so the Playwright webServer shell variable is honored.
  try {
    if (import.meta.env.BYPASS_AUTH === "true") return true;
  } catch {
    // import.meta.env may not be available in all runtimes
  }
  return (await getOptionalEnvValue("BYPASS_AUTH")) === "true";
}

// Direct browser loads of app pages without a session cookie are redirected
// at the request layer, before SSR ships an empty app shell. Client-side
// navigations never hit this middleware; real session validation still
// happens in the server-function middleware and the client route guard.
export const unauthenticatedRedirectMiddleware = createMiddleware().server(
  async (ctx) => {
    const { request } = ctx;

    // E2E bypass: the Playwright server runs with BYPASS_AUTH=true and a
    // fake session; tests expect to land on app pages directly.
    if (await isE2EBypassEnabled()) {
      return ctx.next();
    }

    if (request.method !== "GET") {
      return ctx.next();
    }

    const url = new URL(request.url);
    if (
      // The landing page is the app's public homepage.
      url.pathname === "/" ||
      PUBLIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
    ) {
      return ctx.next();
    }

    const cookies = request.headers.get("cookie") ?? "";
    if (cookies.includes("better-auth.session_token")) {
      return ctx.next();
    }

    const redirectTo = `${url.pathname}${url.search}`;
    const search =
      redirectTo === "/" ? "" : `?redirect=${encodeURIComponent(redirectTo)}`;

    return Response.redirect(new URL(`/sign-in${search}`, url.origin), 307);
  },
);
