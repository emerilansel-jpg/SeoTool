import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  DfsConfigError,
  DfsUpstreamError,
  fetchChatGptMentions,
} from "@/lib/dfs-ai";

const checkSchema = z.object({
  domain: z.string().trim().min(1).max(253),
});

/**
 * Public, unauthenticated endpoint for the free AI visibility checker.
 *
 * Cost control: every uncached check is a paid DataForSEO live call, so the
 * endpoint keeps a 24h in-memory cache per domain and a per-IP rate limit.
 * The maps live per isolate (Workers/Node), which is sufficient to bound
 * abuse from a single source; the 24h cache absorbs repeat traffic globally.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 2000;

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_CHECKS = 5;
const RATE_MAX_TRACKED_IPS = 5000;

const visibilityCache = new Map<string, { body: string; expires: number }>();
const rateHits = new Map<string, number[]>();

function json(body: unknown, status: number, extraHeaders?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

/** Strip scheme, path, query, and www; validate as a bare hostname. */
function normalizeDomain(raw: string): string | null {
  let value = raw.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "");
  value = value.split("/")[0].split("?")[0].split("#")[0];
  value = value.replace(/\/+$/, "");
  value = value.replace(/\s+/g, "");
  if (value.startsWith("www.")) value = value.slice(4);
  if (value.includes("@") || value.includes(":")) return null;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value)) return null;
  if (value.includes("..")) return null;
  const labels = value.split(".");
  if (labels.some((label) => label.startsWith("-") || label.endsWith("-"))) {
    return null;
  }
  if (labels[labels.length - 1].length < 2) return null;
  return value;
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function takeRateSlot(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const timestamps = (rateHits.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_MAX_CHECKS) {
    rateHits.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  rateHits.set(ip, timestamps);

  if (rateHits.size > RATE_MAX_TRACKED_IPS) {
    for (const [key, hits] of rateHits) {
      if (hits.every((t) => t <= windowStart)) rateHits.delete(key);
    }
  }
  return true;
}

function pruneCache() {
  if (visibilityCache.size <= CACHE_MAX_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of visibilityCache) {
    if (entry.expires <= now) visibilityCache.delete(key);
  }
}

export const Route = createFileRoute("/api/ai-visibility")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(
            { ok: false, code: "invalid", error: "Invalid request body" },
            400,
          );
        }

        const parsed = checkSchema.safeParse(body);
        if (!parsed.success) {
          return json(
            {
              ok: false,
              code: "invalid",
              error: "Enter a domain like yourdomain.com",
            },
            400,
          );
        }

        const domain = normalizeDomain(parsed.data.domain);
        if (!domain) {
          return json(
            {
              ok: false,
              code: "invalid",
              error: "Enter a valid domain like yourdomain.com",
            },
            400,
          );
        }

        if (!takeRateSlot(clientIp(request))) {
          return json(
            {
              ok: false,
              code: "rate_limited",
              error: "Too many checks. Try again in a few minutes.",
            },
            429,
            { "Retry-After": "300" },
          );
        }

        const cached = visibilityCache.get(domain);
        if (cached && cached.expires > Date.now()) {
          return json({ ...JSON.parse(cached.body), cached: true }, 200);
        }

        try {
          const metrics = await fetchChatGptMentions(domain);
          const result = {
            ok: true as const,
            cached: false as const,
            domain,
            platform: "chat_gpt" as const,
            mentions: metrics.mentions,
            aiSearchVolume: metrics.aiSearchVolume,
            checkedAt: new Date().toISOString(),
          };
          visibilityCache.set(domain, {
            body: JSON.stringify(result),
            expires: Date.now() + CACHE_TTL_MS,
          });
          pruneCache();
          return json(result, 200);
        } catch (error) {
          if (error instanceof DfsConfigError) {
            return json(
              {
                ok: false,
                code: "unavailable",
                error:
                  "The checker is temporarily unavailable. Create a free account to run a full AI visibility report.",
              },
              503,
            );
          }
          const message =
            error instanceof DfsUpstreamError
              ? error.message
              : "The visibility check failed. Please try again.";
          return json({ ok: false, code: "unavailable", error: message }, 502);
        }
      },
    },
  },
});
