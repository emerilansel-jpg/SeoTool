import { env } from "cloudflare:workers";

function getOptionalEnv(name: string) {
  const value: unknown = Reflect.get(env, name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

const LOOPS_TRANSACTIONAL_URL = "https://app.loops.so/api/v1/transactional";

async function sendLoopsEmail({
  apiKey,
  email,
  transactionalId,
  dataVariables,
}: {
  apiKey: string;
  email: string;
  transactionalId: string;
  dataVariables: Record<string, string>;
}) {
  const response = await fetch(LOOPS_TRANSACTIONAL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      transactionalId,
      email,
      addToAudience: false,
      dataVariables,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    console.error("Loops alert notification error:", {
      status: response.status,
      email,
      errorPayload,
    });
  }
}

/**
 * Send an alert notification email via Loops. Gracefully skips if
 * LOOPS_API_KEY or LOOPS_TRANSACTIONAL_ALERT_ID is not set (self-hosted
 * without email configured).
 */
export async function sendAlertNotificationEmail(input: {
  alertName: string;
  recipients: string;
  summary: string;
  details: string[];
  dashboardUrl: string;
}) {
  const apiKey = getOptionalEnv("LOOPS_API_KEY");
  const templateId = getOptionalEnv("LOOPS_TRANSACTIONAL_ALERT_ID");
  if (!apiKey || !templateId) {
    return;
  }

  const emails = input.recipients
    .split(",")
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && r.includes("@"));

  const detailsText = input.details.join("\n");

  for (const email of emails) {
    try {
      await sendLoopsEmail({
        apiKey,
        email,
        transactionalId: templateId,
        dataVariables: {
          alertName: input.alertName,
          summary: input.summary,
          details: detailsText,
          dashboardUrl: input.dashboardUrl,
          appName: "OpenSEO",
        },
      });
    } catch (error) {
      console.error(
        `Failed to send alert notification email to ${email}:`,
        error,
      );
    }
  }
}
