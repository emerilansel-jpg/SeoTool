import { env } from "cloudflare:workers";
import { APP_VERSION } from "@/shared/appVersion";

const LOOPS_TRANSACTIONAL_URL = "https://app.loops.so/api/v1/transactional";

function getOptionalEnv(name: string) {
  const value: unknown = Reflect.get(env, name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getAppUrl(): string {
  const authUrl = getOptionalEnv("BETTER_AUTH_URL");
  return authUrl || "https://seotool.im";
}

/**
 * Send a Loops transactional email. Feedback emails are best-effort: a
 * missing template id (not yet configured in Loops) or a provider outage is
 * logged, never thrown — the report itself is already safely stored.
 */
async function sendLoopsTransactional(input: {
  templateIdEnv: string;
  email: string;
  dataVariables: Record<string, string>;
}): Promise<boolean> {
  const apiKey = getOptionalEnv("LOOPS_API_KEY");
  const transactionalId = getOptionalEnv(input.templateIdEnv);
  if (!apiKey || !transactionalId) {
    console.warn(
      `[feedback-email] skipped ${input.templateIdEnv}: env not configured`,
    );
    return false;
  }

  try {
    const response = await fetch(LOOPS_TRANSACTIONAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        transactionalId,
        email: input.email,
        addToAudience: false,
        dataVariables: input.dataVariables,
      }),
    });
    if (!response.ok) {
      console.error(
        `[feedback-email] Loops responded ${response.status} for ${input.templateIdEnv}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("[feedback-email] Loops request failed:", error);
    return false;
  }
}

export function sendFeedbackConfirmEmail(input: {
  email: string;
  displayNumber: number;
  type: "bug" | "feature";
  title: string;
}): Promise<boolean> {
  return sendLoopsTransactional({
    templateIdEnv: "LOOPS_TRANSACTIONAL_FEEDBACK_CONFIRM_ID",
    email: input.email,
    dataVariables: {
      reportNumber: `#${input.displayNumber}`,
      reportType: input.type === "bug" ? "bug report" : "feature request",
      reportTitle: input.title,
    },
  });
}

export function sendFeedbackResolvedEmail(input: {
  email: string;
  displayNumber: number;
  title: string;
  messageToUser: string | null;
}): Promise<boolean> {
  return sendLoopsTransactional({
    templateIdEnv: "LOOPS_TRANSACTIONAL_FEEDBACK_RESOLVED_ID",
    email: input.email,
    dataVariables: {
      reportNumber: `#${input.displayNumber}`,
      reportTitle: input.title,
      adminMessage: input.messageToUser || "Thanks for helping us improve.",
      resolvedVersion: APP_VERSION,
      appUrl: getAppUrl(),
    },
  });
}

/** Notify the owner about a newly submitted report (best-effort). */
export function sendFeedbackOwnerEmail(input: {
  displayNumber: number;
  type: "bug" | "feature";
  title: string;
  reporterEmail: string;
  pageUrl: string | null;
}): Promise<boolean> {
  const ownerEmail = getOptionalEnv("ADMIN_NOTIFICATION_EMAIL");
  if (!ownerEmail) {
    console.warn(
      "[feedback-email] ADMIN_NOTIFICATION_EMAIL not set; owner notification skipped",
    );
    return Promise.resolve(false);
  }
  return sendLoopsTransactional({
    templateIdEnv: "LOOPS_TRANSACTIONAL_FEEDBACK_OWNER_ID",
    email: ownerEmail,
    dataVariables: {
      reportNumber: `#${input.displayNumber}`,
      reportType: input.type,
      reportTitle: input.title,
      reporterEmail: input.reporterEmail,
      pageUrl: input.pageUrl || "unknown page",
    },
  });
}
