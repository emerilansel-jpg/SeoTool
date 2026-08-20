import { getRequiredEnvValue } from "@/server/lib/runtime-env";

// ---------------------------------------------------------------------------
// PayPal REST API client for Cloudflare Workers.
//
// Uses native fetch (no npm SDK) to stay worker-compatible and avoid the
// heavyweight PayPal SDK bundle. OAuth2 tokens are cached for 7.5 hours
// (PayPal tokens last 8 hours; we refresh slightly early).
// ---------------------------------------------------------------------------

const TOKEN_CACHE_TTL_MS = 7.5 * 60 * 60 * 1000;

let tokenPromise: Promise<{ token: string; expiresAt: number }> | undefined;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenPromise) {
    const cached = await tokenPromise;
    if (cached.expiresAt > now) return cached.token;
  }

  tokenPromise = fetchToken();
  const result = await tokenPromise;
  return result.token;
}

async function fetchToken(): Promise<{ token: string; expiresAt: number }> {
  const clientId = await getRequiredEnvValue("PAYPAL_CLIENT_ID");
  const secret = await getRequiredEnvValue("PAYPAL_CLIENT_SECRET");
  const baseUrl = await getApiBaseUrl();

  const credentials = btoa(`${clientId}:${secret}`);
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `PayPal token request failed (${response.status}): ${text}`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  return {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // refresh 60s early
  };
}

async function getApiBaseUrl(): Promise<string> {
  const mode = await getRequiredEnvValue("PAYPAL_MODE");
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

// ---------------------------------------------------------------------------
// Generic authenticated request helper
// ---------------------------------------------------------------------------

export type PayPalApiResponse<T = unknown> = { data: T; status: number };

export async function paypalRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await getAccessToken();
  const baseUrl = await getApiBaseUrl();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content (e.g. cancel subscription)
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const errData = data as Record<string, unknown>;
    const details = Array.isArray(errData.details)
      ? (errData.details as Array<{ issue?: string; description?: string }>)
      : [];
    const msg =
      details.map((d) => d.description ?? d.issue).join("; ") ??
      response.statusText;
    throw new Error(
      `PayPal ${method} ${path} failed (${response.status}): ${msg}`,
    );
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// PayPal subscription types
// ---------------------------------------------------------------------------

export type PayPalPlanId = string;

export interface PayPalSubscription {
  id: string;
  plan_id: string;
  status:
    | "APPROVAL_PENDING"
    | "APPROVED"
    | "ACTIVE"
    | "SUSPENDED"
    | "CANCELLED"
    | "EXPIRED"
    | "FAILED";
  custom_id?: string;
  subscriber?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
  };
  billing_info?: {
    cycle_executions?: Array<{
      tenure_type: string;
      cycles_completed: number;
      cycles_remaining: number;
    }>;
  };
  start_time?: string;
  next_billing_time?: string;
}

export interface PayPalBillingPlan {
  id: string;
  product_id: string;
  status: string;
  name: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Facade — typed wrappers around PayPal REST endpoints
// ---------------------------------------------------------------------------

export const paypal = {
  /** Get or create a PayPal product (cached per tier). */
  products: {
    create: (args: { name: string; description: string }) =>
      paypalRequest<{ id: string }>("POST", "/v1/catalogs/products", {
        name: args.name,
        description: args.description,
        type: "SERVICE",
        category: "SOFTWARE",
      }),
  },

  /** Billing plan management. */
  billingPlans: {
    create: (args: {
      product_id: string;
      name: string;
      description: string;
      monthly_price_cents: number;
    }) =>
      paypalRequest<PayPalBillingPlan>("POST", "/v1/billing/plans", {
        product_id: args.product_id,
        name: args.name,
        description: args.description,
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: { interval_unit: "MONTH", interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0, // infinite
            pricing_scheme: {
              fixed_price: {
                value: (args.monthly_price_cents / 100).toFixed(2),
                currency_code: "USD",
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          payment_failure_threshold: 3,
        },
      }),

    /** Update a plan's monthly price (what PayPal actually charges). */
    updatePricingScheme: (planId: string, monthlyPriceCents: number) =>
      paypalRequest<void>(
        "POST",
        `/v1/billing/plans/${planId}/update-pricing-scheme`,
        {
          pricing_schemes: [
            {
              billing_cycle_sequence: 1,
              pricing_scheme: {
                fixed_price: {
                  value: (monthlyPriceCents / 100).toFixed(2),
                  currency_code: "USD",
                },
              },
            },
          ],
        },
      ),
  },

  /** Subscription lifecycle. */
  subscriptions: {
    /** Get subscription details. */
    get: (subscriptionId: string) =>
      paypalRequest<PayPalSubscription>(
        "GET",
        `/v1/billing/subscriptions/${subscriptionId}`,
      ),

    /** Activate a subscription (used after approval). */
    activate: (subscriptionId: string, note?: string) =>
      paypalRequest<void>(
        "POST",
        `/v1/billing/subscriptions/${subscriptionId}/activate`,
        { note: note ?? "Subscription activated" },
      ),

    /** Cancel a subscription. */
    cancel: (subscriptionId: string, reason: string) =>
      paypalRequest<void>(
        "POST",
        `/v1/billing/subscriptions/${subscriptionId}/cancel`,
        { reason },
      ),
  },

  /** Customer portal (hosted billing management page). */
  billingPortal: {
    /** Create a billing portal session URL for the customer. */
    createSession: async (subscriptionId: string) => {
      const returnUrl = await getRequiredEnvValue("BETTER_AUTH_URL");
      return paypalRequest<{ urls: { billing_portal: string } }>(
        "POST",
        `/v1/billing/subscriptions/${subscriptionId}/revise`,
        {
          return_url: `${returnUrl}/billing`,
          cancel_url: `${returnUrl}/billing`,
        },
      );
    },
  },

  /** Webhook signature verification. */
  webhooks: {
    verify: (args: {
      transmission_id: string;
      transmission_time: string;
      cert_url: string;
      actual_sig: string;
      webhook_event: unknown;
      webhook_id: string;
    }) =>
      paypalRequest<{ verification_status: string }>(
        "POST",
        "/v1/notifications/verify-webhook-signature",
        {
          auth_algo: "SHA256withRSA",
          cert_url: args.cert_url,
          transmission_id: args.transmission_id,
          transmission_time: args.transmission_time,
          webhook_id: args.webhook_id,
          webhook_event: args.webhook_event,
          expected_signature: args.actual_sig,
        },
      ),
  },
};
