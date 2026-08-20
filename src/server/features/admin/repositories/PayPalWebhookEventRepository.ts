import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paypalWebhookEvents } from "@/db/schema";

/** Audit log for received PayPal webhooks. The PayPal event id is the row id,
 *  which makes duplicate deliveries (PayPal retries) detectable. */
export const PayPalWebhookEventRepository = {
  /** Insert the event row. Returns false when the id already exists, i.e.
   *  this is a duplicate delivery that was already processed. */
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
    return rows.length > 0;
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
