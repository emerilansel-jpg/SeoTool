import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { account } from "@/db/schema";
import { GA4_OAUTH_PROVIDER_ID } from "@/shared/ga4";
import { AppError } from "@/server/lib/errors";
import {
  createGa4Client,
  Ga4ApiError,
  Ga4TokenError,
  type Ga4Property,
  type Ga4ReportRequest,
  type Ga4ReportResponse,
} from "@/server/lib/ga4Client";
import {
  buildReportRequest,
  type Ga4ReportInput,
} from "@/server/features/ga4/analyticsRequest";
import {
  Ga4ConnectionRepository,
  type Ga4Connection,
} from "@/server/features/ga4/repositories/Ga4ConnectionRepository";

type Ga4ReportResult = {
  propertyId: string;
  propertyName: string | null;
  connectedBy: string | null;
  request: Ga4ReportRequest;
  response: Ga4ReportResponse;
};

type Ga4PropertyListResult = {
  accounts: Array<{
    accountId: string;
    email: string | null;
    requiresReconnect: boolean;
    properties: Ga4Property[];
  }>;
};

/** Thrown when a project has no connected GA4 property. */
export class Ga4NotConnectedError extends Error {
  constructor(public readonly projectId: string) {
    super("Google Analytics is not connected for this project");
    this.name = "Ga4NotConnectedError";
  }
}

async function getConnection(projectId: string): Promise<Ga4Connection | null> {
  return Ga4ConnectionRepository.getByProjectId(projectId);
}

/** Whether this user has linked a google-analytics grant (regardless of whether
 *  they've picked a property yet). Drives the connect-vs-pick UI. */
async function userHasGrant(userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: account.id })
    .from(account)
    .where(
      and(
        eq(account.userId, userId),
        eq(account.providerId, GA4_OAUTH_PROVIDER_ID),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

async function listGrantsForUser(userId: string) {
  return db
    .select({ id: account.id, accountId: account.accountId })
    .from(account)
    .where(
      and(
        eq(account.userId, userId),
        eq(account.providerId, GA4_OAUTH_PROVIDER_ID),
      ),
    );
}

/** Expected ways a stored grant fails to reach Google Analytics: no token
 *  could be minted (refresh token revoked or expired), or Google rejected the
 *  call (401/403). These surface a reconnect prompt without fault logging. */
export function isExpectedGrantFailure(error: unknown): boolean {
  if (error instanceof Ga4TokenError) return true;
  return (
    error instanceof Ga4ApiError &&
    (error.status === 401 || error.status === 403)
  );
}

async function listPropertiesForUserWithGrantStatus(
  userId: string,
): Promise<Ga4PropertyListResult> {
  const grants = await listGrantsForUser(userId);
  const accounts = await Promise.all(
    grants.map(async (grant) => {
      const client = createGa4Client({
        userId,
        ga4AccountId: grant.accountId,
      });

      try {
        const properties = await client.listProperties();
        let email: string | null = null;
        try {
          email = await client.getUserInfoEmail();
        } catch {
          email = null;
        }
        return {
          accountId: grant.accountId,
          email,
          requiresReconnect: false,
          properties,
        };
      } catch (error) {
        if (!isExpectedGrantFailure(error)) {
          console.error(
            "Failed to list Google Analytics properties for account",
            grant.accountId,
            error,
          );
        }
        return {
          accountId: grant.accountId,
          email: null,
          requiresReconnect: true,
          properties: [],
        };
      }
    }),
  );
  return { accounts };
}

/** Map a GA4 property to a project. Rejects properties not present on the
 *  connector's grant (the Admin API only returns properties the grant can see,
 *  so presence implies access). */
async function setProperty(input: {
  projectId: string;
  organizationId: string;
  propertyId: string;
  accountId: string;
  userId: string;
}): Promise<Ga4Connection> {
  const grants = await listGrantsForUser(input.userId);
  if (!grants.some((grant) => grant.accountId === input.accountId)) {
    throw new AppError(
      "NOT_FOUND",
      "That Google account isn't connected to your SeoTool.im account.",
    );
  }

  const client = createGa4Client({
    userId: input.userId,
    ga4AccountId: input.accountId,
  });
  const properties = await client.listProperties();
  const match = properties.find((p) => p.property === input.propertyId);
  if (!match) {
    throw new AppError(
      "NOT_FOUND",
      "That Google Analytics property isn't available on your connected Google account.",
    );
  }
  let connectedAccountEmail: string | null = null;
  try {
    connectedAccountEmail = await client.getUserInfoEmail();
  } catch {
    connectedAccountEmail = null;
  }
  return Ga4ConnectionRepository.upsert({
    projectId: input.projectId,
    organizationId: input.organizationId,
    propertyId: input.propertyId,
    propertyName: match.displayName,
    connectedByUserId: input.userId,
    ga4AccountId: input.accountId,
    connectedAccountEmail,
  });
}

async function unlinkUserGrant(
  userId: string,
  ga4AccountId: string,
): Promise<void> {
  await db
    .delete(account)
    .where(
      and(
        eq(account.userId, userId),
        eq(account.providerId, GA4_OAUTH_PROVIDER_ID),
        eq(account.accountId, ga4AccountId),
      ),
    );
}

async function disconnect(input: {
  projectId: string;
  userId: string;
}): Promise<void> {
  const connection = await Ga4ConnectionRepository.getByProjectId(
    input.projectId,
  );
  await Ga4ConnectionRepository.deleteByProjectId(input.projectId);
  if (
    connection?.ga4AccountId &&
    connection.connectedByUserId === input.userId
  ) {
    const stillUsed = await Ga4ConnectionRepository.existsForConnectorAccount(
      input.userId,
      connection.ga4AccountId,
    );
    if (!stillUsed) {
      await unlinkUserGrant(input.userId, connection.ga4AccountId);
    }
  }
}

/** Pass-through of GA4 Data API `runReport` for a project's connected property. */
async function getReport(input: Ga4ReportInput): Promise<Ga4ReportResult> {
  const connection = await Ga4ConnectionRepository.getByProjectId(
    input.projectId,
  );
  if (!connection) {
    throw new Ga4NotConnectedError(input.projectId);
  }
  const request = buildReportRequest(input);
  const client = createGa4Client({
    userId: connection.connectedByUserId,
    ga4AccountId: connection.ga4AccountId ?? undefined,
  });
  const response = await client.runReport(connection.propertyId, request);
  return {
    propertyId: connection.propertyId,
    propertyName: connection.propertyName,
    connectedBy: connection.connectedAccountEmail,
    request,
    response,
  };
}

export const Ga4Service = {
  getConnection,
  userHasGrant,
  listPropertiesForUserWithGrantStatus,
  setProperty,
  disconnect,
  getReport,
};
