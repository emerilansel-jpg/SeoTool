import { SubmitFeedbackSchema } from "@/types/schemas/feedback";
import { submitFeedback } from "@/server/features/feedback/feedbackService";
import { resolveUserContextFromHeaders } from "@/middleware/ensure-user/resolve";

export const FEEDBACK_API_PATH = "/api/feedback";

/**
 * Public feedback submission endpoint. Raw route (not a server function) so
 * anonymous visitors can report bugs without a session; the session is
 * resolved optionally to attach user_id when available.
 */
export async function handleFeedbackApiRequest(
  request: Request,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = SubmitFeedbackSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      { error: parsed.error.issues[0]?.message ?? "Invalid report." },
      400,
    );
  }

  // Optional session: anonymous visitors can report too.
  let userId: string | null = null;
  try {
    const context = await resolveUserContextFromHeaders(request.headers);
    userId = context.userId;
  } catch {
    userId = null;
  }

  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";

  try {
    const result = await submitFeedback({
      data: parsed.data,
      context: {
        userId,
        clientIp: forwardedFor.split(",")[0]?.trim() || null,
      },
    });

    return json(
      {
        received: true,
        displayNumber: result.displayNumber,
        email: result.email,
      },
      200,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send the report.";
    return json({ error: message }, 400);
  }
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
