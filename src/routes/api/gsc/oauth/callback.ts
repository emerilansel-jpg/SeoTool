import { createFileRoute } from "@tanstack/react-router";
import { responseForAppError } from "@/server/lib/http-errors";

// Hosted-only: GSC OAuth callbacks resolve through the Better Auth session.
// The previous self-hosted path (Cloudflare Access / local_noauth) has been
// removed. Self-hosted GSC setup was its own flow; see the original
// handleSelfHostedGscOAuthCallback for the legacy approach if it's ever
// needed again.

export const Route = createFileRoute("/api/gsc/oauth/callback")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Hosted mode: the Better Auth session handles the callback via
          // the genericOAuth plugin configured in auth-config. This route is
          // only reached for the legacy self-hosted flow, which is gone.
          return new Response("Not found", { status: 404 });
        } catch (error) {
          return responseForAppError(error, "Search Console OAuth failed");
        }
      },
    },
  },
});
