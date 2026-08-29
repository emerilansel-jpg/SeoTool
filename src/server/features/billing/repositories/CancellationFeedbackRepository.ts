import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cancellationFeedback, organization } from "@/db/schema";

export type CancellationFeedbackRow = {
  id: string;
  organizationId: string;
  userId: string;
  planTier: string;
  reason: string;
  detail: string | null;
  offerAccepted: boolean;
  createdAt: Date;
};

export type CancellationFeedbackWithOrg = CancellationFeedbackRow & {
  organizationName: string | null;
};

export const CancellationFeedbackRepository = {
  async insert(row: CancellationFeedbackRow) {
    await db.insert(cancellationFeedback).values(row);
  },

  /** Newest-first feed for the platform admin billing page. Left-joins the
   *  organization name so recently cancelled orgs stay identifiable. */
  async listRecent(limit = 20): Promise<CancellationFeedbackWithOrg[]> {
    const rows = await db
      .select({
        id: cancellationFeedback.id,
        organizationId: cancellationFeedback.organizationId,
        userId: cancellationFeedback.userId,
        planTier: cancellationFeedback.planTier,
        reason: cancellationFeedback.reason,
        detail: cancellationFeedback.detail,
        offerAccepted: cancellationFeedback.offerAccepted,
        createdAt: cancellationFeedback.createdAt,
        organizationName: organization.name,
      })
      .from(cancellationFeedback)
      .leftJoin(
        organization,
        eq(organization.id, cancellationFeedback.organizationId),
      )
      .orderBy(desc(cancellationFeedback.createdAt))
      .limit(limit);
    return rows;
  },
};
