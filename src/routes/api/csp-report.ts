import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/csp-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null);
          if (body && typeof body === "object") {
            const report = (body as Record<string, unknown>)["csp-report"];
            if (report && typeof report === "object") {
              console.warn("[CSP Report]:", JSON.stringify(report));
            }
          }
        } catch {
          // Ignore parse errors from malformed reports
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
