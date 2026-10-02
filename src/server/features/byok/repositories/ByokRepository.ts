import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { byokSettings } from "@/db/schema";

export interface ByokSettingsRow {
  organizationId: string;
  dataforseoApiKey: string | null;
  aiProvider: string;
  aiBaseUrl: string | null;
  aiApiKey: string | null;
  aiModel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaskedByokSettings {
  dataforseoConfigured: boolean;
  dataforseoPrefix: string;
  aiProvider: string;
  aiBaseUrl: string;
  aiConfigured: boolean;
  aiPrefix: string;
  aiModel: string;
}

function maskKey(key: string | null | undefined): string {
  if (!key) return "";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`;
}

export const ByokRepository = {
  async getByOrganizationId(organizationId: string): Promise<ByokSettingsRow | null> {
    const rows = await db
      .select()
      .from(byokSettings)
      .where(eq(byokSettings.organizationId, organizationId))
      .limit(1);
    return rows[0] ?? null;
  },

  async getMasked(organizationId: string): Promise<MaskedByokSettings> {
    const current = await this.getByOrganizationId(organizationId);
    return {
      dataforseoConfigured: Boolean(current?.dataforseoApiKey?.trim()),
      dataforseoPrefix: maskKey(current?.dataforseoApiKey),
      aiProvider: current?.aiProvider || "pesatrouter",
      aiBaseUrl: current?.aiBaseUrl || "",
      aiConfigured: Boolean(current?.aiApiKey?.trim()),
      aiPrefix: maskKey(current?.aiApiKey),
      aiModel: current?.aiModel || "",
    };
  },

  async upsert(input: {
    organizationId: string;
    dataforseoApiKey?: string | null;
    aiProvider?: string;
    aiBaseUrl?: string | null;
    aiApiKey?: string | null;
    aiModel?: string | null;
  }): Promise<ByokSettingsRow> {
    const existing = await this.getByOrganizationId(input.organizationId);

    const values = {
      organizationId: input.organizationId,
      dataforseoApiKey:
        input.dataforseoApiKey !== undefined
          ? input.dataforseoApiKey
          : existing?.dataforseoApiKey ?? null,
      aiProvider: input.aiProvider ?? existing?.aiProvider ?? "pesatrouter",
      aiBaseUrl:
        input.aiBaseUrl !== undefined
          ? input.aiBaseUrl
          : existing?.aiBaseUrl ?? null,
      aiApiKey:
        input.aiApiKey !== undefined
          ? input.aiApiKey
          : existing?.aiApiKey ?? null,
      aiModel:
        input.aiModel !== undefined
          ? input.aiModel
          : existing?.aiModel ?? null,
    };

    const [row] = await db
      .insert(byokSettings)
      .values(values)
      .onConflictDoUpdate({
        target: byokSettings.organizationId,
        set: {
          dataforseoApiKey: values.dataforseoApiKey,
          aiProvider: values.aiProvider,
          aiBaseUrl: values.aiBaseUrl,
          aiApiKey: values.aiApiKey,
          aiModel: values.aiModel,
          updatedAt: sql`(current_timestamp)`,
        },
      })
      .returning();

    if (!row) throw new Error("Failed to save BYOK settings");
    return row;
  },
};
