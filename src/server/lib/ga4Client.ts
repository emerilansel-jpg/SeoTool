import { getAuth } from "@/lib/auth";
import { GA4_OAUTH_PROVIDER_ID } from "@/shared/ga4";

const GA4_DATA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";
const GA4_ADMIN_API_BASE = "https://analyticsadmin.googleapis.com/v1beta";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

/** A GA4 REST call returned a non-2xx status. `status` drives user-facing messaging. */
export class Ga4ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "Ga4ApiError";
  }
}

/** No fresh access token could be minted — the user revoked the grant, or the
 *  refresh token expired (e.g. weekly in Google's OAuth "Testing" mode). */
export class Ga4TokenError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "Ga4TokenError";
  }
}

export type Ga4Property = {
  /** Resource name, e.g. "properties/123456789". */
  property: string;
  displayName: string;
  /** Parent Google Analytics account id ("accounts/123"). */
  accountId: string;
};

// Subset of the Admin API `accountSummaries` response we consume. The wire
// shape is richer; extra fields are ignored.
type AccountSummariesResponse = {
  accountSummaries?: Array<{
    account?: { name?: string };
    propertySummaries?: Array<{
      property?: string;
      displayName?: string;
    }>;
  }>;
};

/** GA4 Data API `runReport` request body. Keep permissive — filters and order
 *  clauses are passed through unchanged. */
export type Ga4ReportRequest = {
  dateRanges: Array<{ startDate: string; endDate: string }>;
  dimensions?: Array<{ name: string }>;
  metrics?: Array<{ name: string }>;
  dimensionFilter?: unknown;
  orderBys?: unknown[];
  limit?: number;
  offset?: number;
  metricAggregations?: string[];
  keepEmptyRows?: boolean;
};

export type Ga4ReportRow = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

export type Ga4ReportTotals = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

export type Ga4ReportResponse = {
  dimensionHeaders?: Array<{ name?: string }>;
  metricHeaders?: Array<{ name?: string; type?: string }>;
  rows?: Ga4ReportRow[];
  /** One entry per metricAggregation requested, aligned to that aggregation. */
  totals?: Ga4ReportTotals[];
  rowCount?: number;
  metadata?: {
    currencyCode?: string;
    timezone?: string;
    dataLossFromOtherRow?: boolean;
  };
};

function messageForStatus(status: number, body: string): string {
  if (status === 401 || status === 403) {
    return "Google Analytics denied access to this property (no permission, or the connection was revoked).";
  }
  if (status === 403 && /access/i.test(body)) {
    return "Google Analytics denied access to this property. Reconnect with an account that has access.";
  }
  if (status === 404) {
    return "Google Analytics property not found. It may have been deleted.";
  }
  if (status === 429) {
    return "Google Analytics rate limit reached. Retry shortly.";
  }
  return `Google Analytics API error (${status}): ${body.slice(0, 300)}`;
}

/** Free Google Analytics Data API client. Like GSC it is first-party data with
 *  no per-call cost and is NOT metered. Access tokens are minted (and
 *  auto-refreshed) by Better Auth from the connector's stored google-analytics
 *  grant. */
export function createGa4Client(opts: {
  userId: string;
  ga4AccountId?: string;
}) {
  async function getToken(): Promise<string> {
    let result: { accessToken?: string } | undefined;
    try {
      // Headerless call: getAccessToken trusts body.userId when no request
      // session is present, and auto-refreshes via the genericOAuth provider.
      result = await getAuth().api.getAccessToken({
        body: {
          providerId: GA4_OAUTH_PROVIDER_ID,
          userId: opts.userId,
          ...(opts.ga4AccountId ? { accountId: opts.ga4AccountId } : {}),
        },
      });
    } catch (error) {
      throw new Ga4TokenError(
        "Could not mint a Google Analytics access token (grant revoked or expired).",
        error,
      );
    }
    if (!result?.accessToken) {
      throw new Ga4TokenError(
        "Google Analytics returned no access token (grant revoked or expired).",
      );
    }
    return result.accessToken;
  }

  async function request<T>(
    url: string,
    init?: { method?: string; body?: unknown },
  ): Promise<T> {
    const token = await getToken();
    const hasBody = init?.body !== undefined;
    const response = await fetch(url, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body: hasBody ? JSON.stringify(init?.body) : undefined,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Ga4ApiError(
        response.status,
        messageForStatus(response.status, body),
        body,
      );
    }
    return (await response.json()) as T;
  }

  return {
    async getUserInfoEmail(): Promise<string | null> {
      const data = await request<{ email?: unknown }>(GOOGLE_USERINFO_URL);
      return typeof data.email === "string" ? data.email : null;
    },

    /** Admin API `accountSummaries.list` — every GA4 property the grant can
     *  see, flattened to a selectable list. Each property is a
     *  "properties/NNN" resource name used verbatim by runReport. */
    async listProperties(): Promise<Ga4Property[]> {
      const data = await request<AccountSummariesResponse>(
        `${GA4_ADMIN_API_BASE}/accountSummaries`,
      );
      const properties: Ga4Property[] = [];
      for (const summary of data.accountSummaries ?? []) {
        const accountId = summary.account?.name;
        if (!accountId) continue;
        for (const prop of summary.propertySummaries ?? []) {
          if (!prop.property) continue;
          properties.push({
            property: prop.property,
            displayName: prop.displayName ?? prop.property,
            accountId,
          });
        }
      }
      return properties;
    },

    /** Data API `properties/{property}:runReport`. `property` is the verbatim
     *  "properties/NNN" resource name. */
    async runReport(
      property: string,
      body: Ga4ReportRequest,
    ): Promise<Ga4ReportResponse> {
      return request<Ga4ReportResponse>(
        `${GA4_DATA_API_BASE}/${property}:runReport`,
        { method: "POST", body },
      );
    },
  };
}
