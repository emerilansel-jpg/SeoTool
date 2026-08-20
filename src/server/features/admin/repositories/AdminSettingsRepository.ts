import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { appSettings } from "@/db/schema";

export interface AppSettingRow {
  key: string;
  value: string;
  isSecret: boolean;
  updatedByUserId: string | null;
  updatedAt: string;
}

export const AdminSettingsRepository = {
  async listAll(): Promise<AppSettingRow[]> {
    return db.select().from(appSettings);
  },

  async get(key: string): Promise<AppSettingRow | null> {
    const rows = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key))
      .limit(1);
    return rows[0] ?? null;
  },

  async upsert(entry: {
    key: string;
    value: string;
    isSecret: boolean;
    updatedByUserId: string;
  }): Promise<AppSettingRow> {
    const [row] = await db
      .insert(appSettings)
      .values(entry)
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          value: entry.value,
          isSecret: entry.isSecret,
          updatedByUserId: entry.updatedByUserId,
          updatedAt: sql`(current_timestamp)`,
        },
      })
      .returning();
    if (!row) throw new Error("Failed to upsert app setting");
    return row;
  },

  async remove(key: string): Promise<void> {
    await db.delete(appSettings).where(eq(appSettings.key, key));
  },
};
