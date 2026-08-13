import { getRequiredEnvValue } from "@/server/lib/runtime-env";
import { paypal } from "./paypal";

// ---------------------------------------------------------------------------
// PayPal webhook signature verification.
//
// PayPal sends these headers on every webhook:
//   PayPal-Transmission-Id
//   PayPal-Transmission-Time
//   PayPal-Cert-Url
//   PayPal-Transmission-Sig
//
// We verify via PayPal's /v1/notifications/verify-webhook-signature API.
// See: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notificationVerification/
// ---------------------------------------------------------------------------

export interface PayPalWebhookHeaders {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  transmissionSig: string;
}

export function extractWebhookHeaders(
  headers: Headers,
): PayPalWebhookHeaders | null {
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const transmissionSig = headers.get("paypal-transmission-sig");

  if (!transmissionId || !transmissionTime || !certUrl || !transmissionSig) {
    return null;
  }

  return { transmissionId, transmissionTime, certUrl, transmissionSig };
}

export async function verifyWebhookSignature(args: {
  headers: PayPalWebhookHeaders;
  rawBody: string;
}): Promise<boolean> {
  try {
    const webhookEvent = JSON.parse(args.rawBody) as unknown;
    const result = await paypal.webhooks.verify({
      transmission_id: args.headers.transmissionId,
      transmission_time: args.headers.transmissionTime,
      cert_url: args.headers.certUrl,
      actual_sig: args.headers.transmissionSig,
      webhook_event: webhookEvent,
    });

    return result.verification_status === "SUCCESS";
  } catch (error) {
    console.error("PayPal webhook verification failed:", error);
    return false;
  }
}
