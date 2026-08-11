import { createFileRoute } from "@tanstack/react-router";
import { responseForAppError } from "@/server/lib/http-errors";

// Hosted-only: GA4 OAuth callbacks resolve through the Better Auth session.
// The previous self-hosted path (Cloudflare Access / local_noauth) has been
// removed.

export const Route = createFileRoute("/api/ga4/oauth/callback")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Hosted mode: the Better Auth session handles the callback via
          // the genericOAuth plugin configured in auth-config. This route is
          // only reached for the legacy self-hosted flow, which is gone.
          return new Response("Not found", { status: 404 });
        } catch (error) {
          return responseForAppError(error, "Google Analytics OAuth failed");
        }
      },
    },
  },
});
