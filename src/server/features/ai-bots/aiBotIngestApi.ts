import { z } from "zod";
import { AiBotRepository } from "./repositories/AiBotRepository";
import { AiBotService } from "./services/AiBotService";

export const AI_BOTS_INGEST_PATH = "/api/ingest/ai-bots";

// On-site beacon endpoint: the snippet installed on the user's site POSTs
// detected AI-bot hits here with their ingest token. Auth is the project's
// bearer token, not a session — crawlers never carry cookies.
const IngestSchema = z.object({
  hits: z
    .array(
      z.object({
        url: z.string().min(1).max(2048),
        userAgent: z.string().max(512).nullish(),
        bot: z.string().max(64).nullish(),
        method: z.string().max(16).nullish(),
        statusCode: z.number().int().min(0).max(599).nullish(),
        at: z.string().max(64).nullish(),
        ip: z.string().max(64).nullish(),
      }),
    )
    .min(1)
    .max(500),
});

/**
 * Public ingest endpoint (raw route in src/server.ts, like the payment
 * webhooks). Bearer-token auth against ai_bot_sites.ingest_token.
 */
export async function handleAiBotIngestRequest(
  request: Request,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : (new URL(request.url).searchParams.get("token")?.trim() ?? "");

  if (!token) {
    return json({ error: "Missing ingest token" }, 401);
  }

  const site = await AiBotRepository.getByIngestToken(token);
  if (!site) {
    return json({ error: "Unknown ingest token" }, 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = IngestSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      { error: parsed.error.issues[0]?.message ?? "Invalid hits payload" },
      400,
    );
  }

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  const result = await AiBotService.ingestHits({
    site,
    hits: parsed.data.hits.map((hit) => ({
      ...hit,
      ip: hit.ip ?? clientIp,
    })),
    source: "ingest",
  });

  return json({ accepted: result.accepted, rejected: result.rejected }, 200);
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
