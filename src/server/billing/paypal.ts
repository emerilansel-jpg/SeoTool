import { getRequiredEnvValue } from "@/server/lib/runtime-env";

// ---------------------------------------------------------------------------
// PayPal REST API client for Cloudflare Workers.
//
// Uses native fetch (no npm SDK) to stay worker-compatible and avoid the
// heavyweight PayPal SDK bundle. OAuth2 tokens are cached for 7.5 hours
// (PayPal tokens last 8 hours; we refresh slightly early).
// ---------------------------------------------------------------------------

let tokenPromise: Promise<{ token: string; expiresAt: number }> | undefined;

/** Drop the cached OAuth token after an admin changes PayPal credentials or
 * mode. Without this, a live settings update can keep using the previous
 * account's token for almost eight hours. */
export function clearPaypalAccessTokenCache(): void {
  tokenPromise = undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenPromise) {
    try {
      const cached = await tokenPromise;
      if (cached.expiresAt > now) return cached.token;
    } catch {
      // A transient token failure must not poison this worker isolate until
      // its next restart. The fresh request below gets another chance.
      tokenPromise = undefined;
    }
  }

  tokenPromise = fetchToken();
  try {
    const result = await tokenPromise;
    return result.token;
  } catch (error) {
    tokenPromise = undefined;
    throw error;
  }
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

  const data: unknown = await response.json();
  if (
    !isRecord(data) ||
    typeof data.access_token !== "string" ||
    typeof data.expires_in !== "number"
  ) {
    throw new Error("PayPal token response had an unexpected shape");
  }

  return {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // refresh 60s early
  };
}

async function getApiBaseUrl(): Promise<string> {
  const mode = await getRequiredEnvValue("PAYPAL_MODE");
  if (mode === "live") return "https://api-m.paypal.com";
  if (mode === "sandbox") return "https://api-m.sandbox.paypal.com";
  throw new Error('PAYPAL_MODE must be exactly "live" or "sandbox"');
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
    // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic endpoint envelope: the 204 contract carries no body, so T is structurally undefined here
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const details =
      isRecord(data) && Array.isArray(data.details)
        ? data.details.filter(isRecord).map((d) => ({
            issue: typeof d.issue === "string" ? d.issue : undefined,
            description:
              typeof d.description === "string" ? d.description : undefined,
          }))
        : [];
    const msg =
      details.map((d) => d.description ?? d.issue).join("; ") ??
      response.statusText;
    throw new Error(
      `PayPal ${method} ${path} failed (${response.status}): ${msg}`,
    );
  }

  // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic endpoint envelope; each call site owns the shape it requested
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
  billing_cycles?: Array<{
    tenure_type?: string;
    pricing_scheme?: {
      fixed_price?: { value?: string; currency_code?: string };
    };
  }>;
}

export interface PayPalOrder {
  id: string;
  status:
    | "CREATED"
    | "SAVED"
    | "APPROVED"
    | "VOIDED"
    | "COMPLETED"
    | "PAYER_ACTION_REQUIRED";
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        custom_id?: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
  links?: Array<{ rel: string; href: string; method: string }>;
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
    get: (planId: string) =>
      paypalRequest<PayPalBillingPlan>("GET", `/v1/billing/plans/${planId}`),

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
    /** Create a subscription and return the buyer approval link. */
    create: (args: {
      plan_id: string;
      custom_id: string;
      subscriber: { email_address: string };
      application_context: {
        brand_name: string;
        locale: string;
        shipping_preference: string;
        user_action: string;
        return_url: string;
        cancel_url: string;
      };
    }) =>
      paypalRequest<{
        id: string;
        links: Array<{ rel: string; href: string; method: string }>;
      }>("POST", "/v1/billing/subscriptions", args),

    /** Get subscription details. */
    get: (subscriptionId: string) =>
      paypalRequest<PayPalSubscription>(
        "GET",
        `/v1/billing/subscriptions/${subscriptionId}`,
      ),

    /** Move an existing subscription to another plan without creating a
     * second recurring charge. PayPal returns an approval link. */
    revise: (
      subscriptionId: string,
      args: {
        plan_id: string;
        application_context: {
          brand_name: string;
          locale: string;
          shipping_preference: string;
          user_action: string;
          return_url: string;
          cancel_url: string;
        };
      },
    ) =>
      paypalRequest<{
        id?: string;
        links: Array<{ rel: string; href: string; method: string }>;
      }>("POST", `/v1/billing/subscriptions/${subscriptionId}/revise`, args),

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

  /** One-time checkout order lifecycle. */
  orders: {
    create: (args: {
      intent: "CAPTURE";
      purchase_units: Array<{
        reference_id: string;
        description: string;
        custom_id: string;
        amount: { currency_code: "USD"; value: string };
      }>;
      application_context: {
        brand_name: string;
        locale: string;
        shipping_preference: string;
        user_action: string;
        return_url: string;
        cancel_url: string;
      };
    }) => paypalRequest<PayPalOrder>("POST", "/v2/checkout/orders", args),
    get: (orderId: string) =>
      paypalRequest<PayPalOrder>("GET", `/v2/checkout/orders/${orderId}`),
    capture: (orderId: string) =>
      paypalRequest<PayPalOrder>(
        "POST",
        `/v2/checkout/orders/${orderId}/capture`,
        {},
      ),
  },

  /** Buyer-facing PayPal page for managing automatic payments. PayPal does
   * not expose a Stripe-style billing-portal session endpoint. */
  billingPortal: {
    createSession: async (_subscriptionId: string) => {
      const baseUrl = await getApiBaseUrl();
      return {
        urls: {
          billing_portal:
            baseUrl === "https://api-m.paypal.com"
              ? "https://www.paypal.com/myaccount/autopay/"
              : "https://www.sandbox.paypal.com/myaccount/autopay/",
        },
      };
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
