import { AppError } from "@/server/lib/errors";
import {
  clearAdminSettingsCache,
  getOptionalEnvValue,
} from "@/server/lib/runtime-env";
import {
  ADMIN_SETTING_GROUPS,
  type AdminSettingDefinition,
} from "@/shared/admin-settings";
import { AdminSettingsRepository } from "../repositories/AdminSettingsRepository";

export interface AdminSettingStatus {
  envKey: string;
  label: string;
  secret: boolean;
  editable: boolean;
  hint?: string;
  configured: boolean;
  source: "db" | "env" | null;
  /** Effective value, returned for non-secret settings only. */
  value: string | null;
  updatedAt: string | null;
}

export interface AdminSettingsStatuses {
  groups: Array<{ provider: string; settings: AdminSettingStatus[] }>;
}

function toStatus(
  definition: AdminSettingDefinition,
  dbValue: string | undefined,
  effectiveValue: string | undefined,
  updatedAt: string | null,
): AdminSettingStatus {
  const configured =
    dbValue !== undefined ? dbValue !== "" : effectiveValue !== undefined;
  return {
    envKey: definition.envKey,
    label: definition.label,
    secret: definition.secret,
    editable: definition.editable,
    hint: definition.hint,
    configured,
    source:
      dbValue !== undefined && dbValue !== ""
        ? "db"
        : effectiveValue !== undefined
          ? "env"
          : null,
    value: definition.secret ? null : (effectiveValue ?? null),
    updatedAt,
  };
}

export const AdminSettingsService = {
  async getStatuses(): Promise<AdminSettingsStatuses> {
    const rows = await AdminSettingsRepository.listAll();
    const dbByKey = new Map(rows.map((row) => [row.key, row]));

    const groups = await Promise.all(
      ADMIN_SETTING_GROUPS.map(async (group) => ({
        provider: group.provider,
        settings: await Promise.all(
          group.settings.map(async (definition) => {
            const row = dbByKey.get(definition.envKey);
            // getOptionalEnvValue resolves DB override over env, which is
            // exactly the effective value the server code sees.
            const effectiveValue = await getOptionalEnvValue(definition.envKey);
            return toStatus(
              definition,
              row?.value,
              effectiveValue,
              row?.updatedAt ?? null,
            );
          }),
        ),
      })),
    );

    return { groups };
  },

  async saveSetting(
    input: { envKey: string; value: string },
    adminUserId: string,
  ): Promise<void> {
    const definition = findEditableDefinition(input.envKey);
    await AdminSettingsRepository.upsert({
      key: input.envKey,
      value: input.value,
      isSecret: definition.secret,
      updatedByUserId: adminUserId,
    });
    clearAdminSettingsCache();
  },

  async removeOverride(envKey: string): Promise<void> {
    const definition = findEditableDefinition(envKey);
    // Non-editable keys can still have a stale override removed.
    if (!definition) {
      const row = await AdminSettingsRepository.get(envKey);
      if (!row) {
        throw new AppError("NOT_FOUND", "No override stored for this key.");
      }
    }
    await AdminSettingsRepository.remove(envKey);
    clearAdminSettingsCache();
  },
};

function findEditableDefinition(envKey: string): AdminSettingDefinition {
  for (const group of ADMIN_SETTING_GROUPS) {
    for (const setting of group.settings) {
      if (setting.envKey === envKey) {
        if (!setting.editable) {
          throw new AppError(
            "VALIDATION_ERROR",
            "This key is read at deploy time and cannot be edited at runtime.",
          );
        }
        return setting;
      }
    }
  }
  throw new AppError("VALIDATION_ERROR", "Unknown setting key.");
}
