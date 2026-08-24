import { createMiddleware } from "@tanstack/react-start";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";

// Paths that must stay reachable without a session: marketing pages, auth
// pages, API endpoints, server-function RPC, and static asset roots.
const PUBLIC_PATH_PREFIXES = [
  "/pricing",
  "/blogs",
  "/pages",
  "/privacy",
  "/terms-and-conditions",
  "/cookie-policy",
  "/refund-policy",
  "/dpa",
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

// Known authenticated app route prefixes. Only these paths trigger a
// sign-in redirect for unauthenticated visitors. Unknown paths fall through
// to the 404 handler so anonymous users see a proper "not found" page.
const AUTHENTICATED_ROUTE_PREFIXES = [
  "/projects",
  "/settings",
  "/billing",
  "/admin",
  "/help",
  "/support",
  "/ai",
  "/p/",
  "/subscribe",
  "/onboarding",
  "/reports",
  "/alerts",
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

    // Only redirect known authenticated routes. Unknown paths fall through
    // to the 404 handler so anonymous users see a proper "not found" page
    // instead of being redirected to sign-in.
    const isKnownAppRoute = AUTHENTICATED_ROUTE_PREFIXES.some((prefix) =>
      url.pathname.startsWith(prefix),
    );
    if (!isKnownAppRoute) {
      return ctx.next();
    }

    const redirectTo = `${url.pathname}${url.search}`;
    const search =
      redirectTo === "/" ? "" : `?redirect=${encodeURIComponent(redirectTo)}`;

    // Force HTTPS in redirect URLs. Behind Cloudflare the incoming protocol
    // may be HTTP; always emit HTTPS so the browser lands on the secure origin.
    const httpsOrigin = url.origin.replace(/^http:/, "https:");
    return Response.redirect(new URL(`/sign-in${search}`, httpsOrigin), 307);
  },
);
