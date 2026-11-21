import { AppError } from "@/server/lib/errors";
import { APP_VERSION } from "@/shared/appVersion";
import type { SubmitFeedbackInput } from "@/types/schemas/feedback";
import {
  sendFeedbackOwnerEmail,
  sendFeedbackResolvedEmail,
} from "@/server/email/feedbackEmails";
import { FeedbackRepository, type FeedbackRow } from "./feedbackRepository";

const MAX_REPORTS_PER_HOUR = 5;

interface RateEntry {
  timestamps: number[];
}

/** In-process sliding-window limiter (per isolate). Abuse floods from other
 *  colos are handled by the Cloudflare WAF rate rule — see the auth rate
 *  limit note in src/lib/auth-options.ts for the same trade-off. */
const rateBuckets = new Map<string, RateEntry>();

export function checkFeedbackRateLimit(
  key: string,
  nowMs: number,
  max = MAX_REPORTS_PER_HOUR,
): boolean {
  const bucket = rateBuckets.get(key) ?? { timestamps: [] };
  const windowStart = nowMs - 3_600_000;
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);
  if (bucket.timestamps.length >= max) {
    return false;
  }
  bucket.timestamps.push(nowMs);
  rateBuckets.set(key, bucket);
  if (rateBuckets.size > 10_000) {
    // Prevent unbounded growth from spoofed keys.
    for (const [k, v] of rateBuckets) {
      if (v.timestamps.every((t) => t <= windowStart)) rateBuckets.delete(k);
    }
  }
  return true;
}

export function resetFeedbackRateLimit(key: string): void {
  rateBuckets.delete(key);
}

/** Strip control characters that could poison logs or the email pipeline. */
function sanitizeText(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export interface SubmitFeedbackContext {
  userId: string | null;
  clientIp: string | null;
}

export async function submitFeedback(input: {
  data: SubmitFeedbackInput;
  context: SubmitFeedbackContext;
}): Promise<{ displayNumber: number; email: string }> {
  const nowMs = Date.now();
  const rateKey = input.context.clientIp ?? input.data.email;
  if (!checkFeedbackRateLimit(`${rateKey}:${input.data.email}`, nowMs)) {
    throw new AppError(
      "VALIDATION_ERROR",
      "You have sent several reports recently. Please try again in an hour, or email us directly at support@seotool.im.",
    );
  }

  const nowIso = new Date(nowMs).toISOString();
  const displayNumber = await FeedbackRepository.nextDisplayNumber();

  const row: FeedbackRow = {
    id: crypto.randomUUID(),
    displayNumber,
    type: input.data.type,
    title: sanitizeText(input.data.title),
    description: sanitizeText(input.data.description),
    email: input.data.email.toLowerCase(),
    userId: input.context.userId,
    screenshotBase64: input.data.screenshotBase64 ?? null,
    screenshotMime: input.data.screenshotMime ?? null,
    pageUrl: input.data.pageUrl
      ? sanitizeText(input.data.pageUrl).slice(0, 500)
      : null,
    userAgent: input.data.userAgent
      ? sanitizeText(input.data.userAgent).slice(0, 300)
      : null,
    appVersion: APP_VERSION,
    status: "new",
    adminNote: null,
    resolvedInVersion: null,
    notifiedAt: null,
    createdAt: nowIso,
    updatedAt: nowIso,
    resolvedAt: null,
  };
  await FeedbackRepository.insert(row);

  // Best-effort owner notification; never blocks the reporter.
  void sendFeedbackOwnerEmail({
    displayNumber,
    type: input.data.type,
    title: row.title,
    reporterEmail: row.email,
    pageUrl: row.pageUrl,
  }).catch(() => undefined);

  return { displayNumber, email: row.email };
}

export interface ResolvedEmailOutcome {
  emailed: boolean;
  /** False when a notification had already gone out for this report. */
  claimed: boolean;
}

export async function notifyReporterOfResolution(input: {
  id: string;
  email: string;
  displayNumber: number;
  title: string;
  messageToUser: string | null;
}): Promise<ResolvedEmailOutcome> {
  const nowIso = new Date().toISOString();
  const claimed = await FeedbackRepository.claimResolvedNotification(
    input.id,
    nowIso,
  );
  if (!claimed) {
    return { emailed: false, claimed: false };
  }

  const emailed = await sendFeedbackResolvedEmail({
    email: input.email,
    displayNumber: input.displayNumber,
    title: input.title,
    messageToUser: input.messageToUser,
  });

  return { emailed, claimed: true };
}
