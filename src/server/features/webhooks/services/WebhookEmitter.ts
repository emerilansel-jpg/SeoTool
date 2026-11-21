import { createHmac, randomBytes } from "node:crypto";
import { AppError } from "@/server/lib/errors";
import { WebhooksRepository } from "../repositories/WebhooksRepository";

// Events emitted by product surfaces. Keep this list small and real: every
// entry must have an emit call wired somewhere in the codebase.
export const WEBHOOK_EVENTS = [
  "audit.completed",
  "report.generated",
  "rank_check.completed",
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const WEBHOOK_SIGNATURE_HEADER = "x-seotool-signature";

function signPayload(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

const DELIVERY_TIMEOUT_MS = 10_000;
const RETRIES = 1;

type DeliveryOutcome = {
  ok: boolean;
  attempts: number;
  responseStatus: number | null;
  lastError: string | null;
};

/** POST the signed body to one webhook, retrying once on failure. */
async function deliverToWebhook(
  webhook: { id: string; url: string; secret: string },
  body: string,
): Promise<DeliveryOutcome> {
  let responseStatus: number | null = null;
  let lastError: string | null = null;
  for (let attempt = 1; attempt <= 1 + RETRIES; attempt += 1) {
    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [WEBHOOK_SIGNATURE_HEADER]: `sha256=${signPayload(webhook.secret, body)}`,
        },
        body,
        signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
      });
      responseStatus = response.status;
      if (response.ok) {
        return { ok: true, attempts: attempt, responseStatus, lastError: null };
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Delivery failed";
    }
  }
  return { ok: false, attempts: 1 + RETRIES, responseStatus, lastError };
}

/** Deliver `event` to every subscribed webhook of the org. Never throws —
 *  automation hooks must not break the work that triggered them. */
async function emitWebhookEvent(input: {
  organizationId: string;
  projectId?: string | null;
  event: WebhookEvent;
  payload: Record<string, unknown>;
}): Promise<{ delivered: number; failed: number }> {
  let delivered = 0;
  let failed = 0;
  try {
    const subscribers = await WebhooksRepository.findSubscribers(
      input.organizationId,
      input.projectId ?? null,
      input.event,
    );
    for (const webhook of subscribers) {
      const body = JSON.stringify({
        event: input.event,
        timestamp: new Date().toISOString(),
        projectId: input.projectId ?? null,
        data: input.payload,
      });

      const outcome = await deliverToWebhook(webhook, body);
      await WebhooksRepository.recordDelivery({
        webhookId: webhook.id,
        organizationId: input.organizationId,
        event: input.event,
        payload: body.slice(0, 10_000),
        status: outcome.ok ? "delivered" : "failed",
        attempts: outcome.attempts,
        responseStatus: outcome.responseStatus,
        lastError: outcome.lastError,
      });
      if (outcome.ok) delivered += 1;
      else failed += 1;
    }
  } catch (error) {
    console.error("[webhooks] emit failed:", error);
  }
  return { delivered, failed };
}

async function createWebhook(input: {
  organizationId: string;
  projectId?: string | null;
  url: string;
  events: string[];
}): Promise<{ webhookId: string; secret: string }> {
  const url = new URL(input.url);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new AppError("VALIDATION_ERROR", "Webhook URLs must use HTTPS.");
  }
  const secret = randomBytes(24).toString("hex");
  const row = await WebhooksRepository.createWebhook({
    organizationId: input.organizationId,
    projectId: input.projectId ?? null,
    url: input.url,
    secret,
    events: input.events,
  });
  return { webhookId: row.id, secret };
}

/** Send a signed test ping to the webhook and return the delivery result. */
async function sendTestPing(input: {
  organizationId: string;
  webhookId: string;
}): Promise<{ ok: boolean; detail: string }> {
  const webhooks = await WebhooksRepository.listForOrganization(
    input.organizationId,
  );
  const webhook = webhooks.find((row) => row.id === input.webhookId);
  if (!webhook) throw new AppError("NOT_FOUND", "Webhook not found.");

  const body = JSON.stringify({
    event: "ping",
    timestamp: new Date().toISOString(),
    data: { source: "seotool.im" },
  });
  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [WEBHOOK_SIGNATURE_HEADER]: `sha256=${signPayload(webhook.secret, body)}`,
      },
      body,
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
    await WebhooksRepository.recordDelivery({
      webhookId: webhook.id,
      organizationId: input.organizationId,
      event: "ping",
      payload: body.slice(0, 10_000),
      status: response.ok ? "delivered" : "failed",
      attempts: 1,
      responseStatus: response.status,
      lastError: response.ok ? null : `HTTP ${response.status}`,
    });
    return {
      ok: response.ok,
      detail: response.ok
        ? `HTTP ${response.status}`
        : `HTTP ${response.status}`,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Delivery failed";
    await WebhooksRepository.recordDelivery({
      webhookId: webhook.id,
      organizationId: input.organizationId,
      event: "ping",
      payload: body.slice(0, 10_000),
      status: "failed",
      attempts: 1,
      responseStatus: null,
      lastError: detail,
    });
    return { ok: false, detail };
  }
}

export const WebhookEmitter = {
  emitWebhookEvent,
  createWebhook,
  sendTestPing,
  WEBHOOK_EVENTS,
};
