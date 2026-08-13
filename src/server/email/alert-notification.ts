import { env } from "cloudflare:workers";
import { captureServerError } from "@/server/lib/posthog";

function getOptionalEnv(name: string) {
  const value: unknown = Reflect.get(env, name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

const LOOPS_TRANSACTIONAL_URL = "https://app.loops.so/api/v1/transactional";

/** Aggregated outcome of a delivery attempt across all recipients. */
export interface EmailDeliveryResult {
  delivered: number;
  failed: number;
  errors: string[];
}

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
}): Promise<boolean> {
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

  if (response.ok) {
    return true;
  }

  // Don't swallow: surface the failure to PostHog so a misconfigured template
  // or a Loops outage is visible instead of silently dropping alert emails.
  const errorPayload = await response.json().catch(() => null);
  const message = `Loops rejected alert email (status ${response.status})`;
  console.error(message, { email, errorPayload });
  await captureServerError(new Error(message), {
    feature: "alert-notification",
    recipient: email,
    status: String(response.status),
  });
  return false;
}

/**
 * Send an alert notification email via Loops. Gracefully skips if
 * LOOPS_API_KEY or LOOPS_TRANSACTIONAL_ALERT_ID is not set (self-hosted
 * without email configured). Returns a per-recipient delivery summary so
 * callers can record failures instead of treating them as silent successes.
 */
export async function sendAlertNotificationEmail(input: {
  alertName: string;
  recipients: string;
  summary: string;
  details: string[];
  dashboardUrl: string;
}): Promise<EmailDeliveryResult> {
  const apiKey = getOptionalEnv("LOOPS_API_KEY");
  const templateId = getOptionalEnv("LOOPS_TRANSACTIONAL_ALERT_ID");
  if (!apiKey || !templateId) {
    return { delivered: 0, failed: 0, errors: ["email_not_configured"] };
  }

  const emails = input.recipients
    .split(",")
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && r.includes("@"));

  const detailsText = input.details.join("\n");
  const errors: string[] = [];
  let delivered = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      const ok = await sendLoopsEmail({
        apiKey,
        email,
        transactionalId: templateId,
        dataVariables: {
          alertName: input.alertName,
          summary: input.summary,
          details: detailsText,
          dashboardUrl: input.dashboardUrl,
          appName: "SeoTool.im",
        },
      });
      if (ok) {
        delivered += 1;
      } else {
        failed += 1;
        errors.push(`${email}: rejected`);
      }
    } catch (error) {
      failed += 1;
      const reason = error instanceof Error ? error.message : String(error);
      errors.push(`${email}: ${reason}`);
      console.error(
        `Failed to send alert notification email to ${email}:`,
        error,
      );
    }
  }

  if (failed > 0) {
    await captureServerError(
      new Error(`${failed} alert notification email(s) failed to send`),
      {
        feature: "alert-notification",
        alert_name: input.alertName,
        failed_count: String(failed),
        delivered_count: String(delivered),
        errors: errors.join("; ").slice(0, 500),
      },
    );
  }

  return { delivered, failed, errors };
}
