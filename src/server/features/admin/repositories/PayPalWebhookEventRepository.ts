import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { paypalWebhookEvents } from "@/db/schema";

/** Audit log for received PayPal webhooks. The PayPal event id is the row id,
 *  which makes duplicate deliveries (PayPal retries) detectable. */
export const PayPalWebhookEventRepository = {
  /** Insert the event row. A previously failed event is atomically reclaimed
   * for PayPal's retry; received/processed duplicates remain no-ops. */
  async record(input: {
    id: string;
    eventType: string;
    organizationId: string | null;
    payload: string;
  }): Promise<boolean> {
    const rows = await db
      .insert(paypalWebhookEvents)
      .values({
        id: input.id,
        eventType: input.eventType,
        organizationId: input.organizationId,
        status: "received",
        payload: input.payload,
      })
      .onConflictDoNothing()
      .returning({ id: paypalWebhookEvents.id });
    if (rows.length > 0) return true;

    const reclaimed = await db
      .update(paypalWebhookEvents)
      .set({
        eventType: input.eventType,
        organizationId: input.organizationId,
        status: "received",
        errorMessage: null,
        payload: input.payload,
      })
      .where(
        and(
          eq(paypalWebhookEvents.id, input.id),
          eq(paypalWebhookEvents.status, "failed"),
        ),
      )
      .returning({ id: paypalWebhookEvents.id });
    return reclaimed.length > 0;
  },

  async markStatus(
    id: string,
    status: "processed" | "failed",
    errorMessage: string | null,
  ): Promise<void> {
    await db
      .update(paypalWebhookEvents)
      .set({ status, errorMessage })
      .where(eq(paypalWebhookEvents.id, id));
  },
};
