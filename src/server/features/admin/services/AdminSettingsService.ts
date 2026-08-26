import { AppError } from "@/server/lib/errors";
import {
  clearAdminSettingsCache,
  getOptionalEnvValue,
  getRequiredEnvValue,
} from "@/server/lib/runtime-env";
import {
  ADMIN_SETTING_GROUPS,
  type AdminSettingDefinition,
} from "@/shared/admin-settings";
import { clearPaypalAccessTokenCache, paypal } from "@/server/billing/paypal";
import { getEffectivePlanConfigs } from "@/server/billing/plan-config";
import { AdminSettingsRepository } from "../repositories/AdminSettingsRepository";
import { KeywordProConfigService } from "@/server/features/keywords/services/KeywordProConfigService";

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
    const value = validateSettingValue(input.envKey, input.value);
    await AdminSettingsRepository.upsert({
      key: input.envKey,
      value,
      isSecret: definition.secret,
      updatedByUserId: adminUserId,
    });
    clearAdminSettingsCache();
    if (isPaypalSetting(input.envKey)) clearPaypalAccessTokenCache();
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
    if (isPaypalSetting(envKey)) clearPaypalAccessTokenCache();
  },

  /** Read-only live check for the admin UI. It verifies credentials by
   * fetching every active paid plan and confirms PayPal's price matches the
   * price shown by SeoTool.im. No order or charge is created. */
  async testPaypalConfiguration(): Promise<{
    mode: "live" | "sandbox";
    plans: Array<{ tier: string; planId: string; priceUsd: number }>;
  }> {
    const mode = await getRequiredEnvValue("PAYPAL_MODE");
    if (mode !== "live" && mode !== "sandbox") {
      throw new AppError(
        "VALIDATION_ERROR",
        'PAYPAL_MODE must be exactly "live" or "sandbox".',
      );
    }
    await getRequiredEnvValue("PAYPAL_WEBHOOK_ID");

    const configs = await getEffectivePlanConfigs();
    const activePaidConfigs = Object.values(configs).filter(
      (config) => config.tier !== "free" && config.active,
    );
    if (activePaidConfigs.length === 0) {
      throw new AppError(
        "VALIDATION_ERROR",
        "No active paid plan is configured.",
      );
    }

    const basePlans = await Promise.all(
      activePaidConfigs.map(async (config) => {
        if (!config.paypalPlanId) {
          throw new AppError(
            "VALIDATION_ERROR",
            `${config.tier} is active but has no PayPal plan ID.`,
          );
        }
        const plan = await paypal.billingPlans.get(config.paypalPlanId);
        if (plan.status !== "ACTIVE") {
          throw new AppError(
            "VALIDATION_ERROR",
            `PayPal plan ${config.paypalPlanId} for ${config.tier} is not active.`,
          );
        }

        const regularCycle = plan.billing_cycles?.find(
          (cycle) => cycle.tenure_type === "REGULAR",
        );
        const fixedPrice = regularCycle?.pricing_scheme?.fixed_price;
        const paypalPriceUsd = Number(fixedPrice?.value);
        if (
          fixedPrice?.currency_code !== "USD" ||
          !Number.isFinite(paypalPriceUsd) ||
          Math.round(paypalPriceUsd * 100) !== config.priceUsdCents
        ) {
          throw new AppError(
            "VALIDATION_ERROR",
            `PayPal price for ${config.tier} does not match SeoTool.im.`,
          );
        }

        return {
          tier: config.tier,
          planId: config.paypalPlanId,
          priceUsd: paypalPriceUsd,
        };
      }),
    );

    const keywordProCohorts = (
      await KeywordProConfigService.getCohorts()
    ).filter((cohort) => cohort.active);
    const keywordProPlans = await Promise.all(
      keywordProCohorts.map(async (cohort) => {
        if (!cohort.paypalPlanId) {
          throw new AppError(
            "VALIDATION_ERROR",
            `${cohort.label} is active but has no PayPal plan ID. Use Set up PayPal plans in Admin > Pricing.`,
          );
        }
        const plan = await paypal.billingPlans.get(cohort.paypalPlanId);
        const regularCycle = plan.billing_cycles?.find(
          (cycle) => cycle.tenure_type === "REGULAR",
        );
        const fixedPrice = regularCycle?.pricing_scheme?.fixed_price;
        const paypalPriceUsd = Number(fixedPrice?.value);
        if (
          plan.status !== "ACTIVE" ||
          fixedPrice?.currency_code !== "USD" ||
          !Number.isFinite(paypalPriceUsd) ||
          Math.round(paypalPriceUsd * 100) !== cohort.priceUsdCents
        ) {
          throw new AppError(
            "VALIDATION_ERROR",
            `PayPal plan for ${cohort.label} is inactive or its USD price does not match SeoTool.im.`,
          );
        }
        return {
          tier: cohort.key,
          planId: cohort.paypalPlanId,
          priceUsd: paypalPriceUsd,
        };
      }),
    );

    return { mode, plans: [...basePlans, ...keywordProPlans] };
  },
};

function isPaypalSetting(envKey: string): boolean {
  return envKey.startsWith("PAYPAL_");
}

function validateSettingValue(envKey: string, rawValue: string): string {
  if (!isPaypalSetting(envKey)) return rawValue;

  const value = rawValue.trim();
  if (!value) {
    throw new AppError(
      "VALIDATION_ERROR",
      `${envKey} cannot be empty. Remove the override to use the deploy value.`,
    );
  }
  if (envKey === "PAYPAL_MODE" && value !== "live" && value !== "sandbox") {
    throw new AppError(
      "VALIDATION_ERROR",
      'PAYPAL_MODE must be exactly "live" or "sandbox".',
    );
  }
  return value;
}

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
