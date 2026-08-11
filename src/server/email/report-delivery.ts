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
    console.error("Loops report delivery error:", {
      status: response.status,
      email,
      errorPayload,
    });
  }
}

/**
 * Send a scheduled report delivery email via Loops. Gracefully skips if
 * LOOPS_API_KEY or LOOPS_TRANSACTIONAL_REPORT_ID is not set (self-hosted
 * without email configured).
 */
export async function sendReportDeliveryEmail(input: {
  snapshotId: string;
  reportId: string;
  projectId: string;
  recipients: string;
  reportName: string;
  snapshotUrl: string;
}) {
  const apiKey = getOptionalEnv("LOOPS_API_KEY");
  const templateId = getOptionalEnv("LOOPS_TRANSACTIONAL_REPORT_ID");
  if (!apiKey || !templateId) {
    // Delivery is best-effort when email is not configured (self-hosted
    // deployments that skip email). Snapshot is already persisted.
    return;
  }

  const emails = input.recipients
    .split(",")
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && r.includes("@"));

  for (const email of emails) {
    try {
      await sendLoopsEmail({
        apiKey,
        email,
        transactionalId: templateId,
        dataVariables: {
          reportName: input.reportName,
          snapshotUrl: input.snapshotUrl,
          appName: "OpenSEO",
        },
      });
    } catch (error) {
      console.error(`Failed to send report delivery email to ${email}:`, error);
    }
  }
}
