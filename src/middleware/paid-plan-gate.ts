import { createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import { customerHasPaidPlan } from "@/server/billing/subscription";
import {
  getOptionalEnvValue,
  isHostedServerAuthMode,
} from "@/server/lib/runtime-env";
import { AppError } from "@/server/lib/errors";
import { isPlatformAdmin } from "@/server/lib/platform-admin";
import type { EnsuredUserContext } from "@/middleware/ensure-user/types";

const ensuredUserContextSchema: z.ZodType<EnsuredUserContext> = z.object({
  userId: z.string(),
  userEmail: z.string(),
  emailVerified: z.boolean(),
  organizationId: z.string(),
  project: z.any().optional(),
});

// Files whose functions never hit the paywall: the subscription funnel
// itself, account management, onboarding, notifications, attribution
// capture, and app-shell reads.
const ALWAYS_ALLOWED_FILES = new Set([
  "src/serverFunctions/account.ts",
  "src/serverFunctions/admin-billing.ts",
  "src/serverFunctions/admin-content.ts",
  "src/serverFunctions/admin-pricing.ts",
  "src/serverFunctions/admin-settings.ts",
  "src/serverFunctions/admin-users.ts",
  "src/serverFunctions/analytics.ts",
  "src/serverFunctions/billing.ts",
  "src/serverFunctions/cms-public.ts",
  "src/serverFunctions/config.ts",
  "src/serverFunctions/notifications.ts",
  "src/serverFunctions/onboarding.ts",
  "src/serverFunctions/onboardingChat.ts",
  "src/serverFunctions/paypal-checkout.ts",
  "src/serverFunctions/keyword-pro-membership.ts",
  "src/serverFunctions/keyword-research-pro.ts",
  "src/serverFunctions/admin-keyword-pro.ts",
]);

// Read-only functions inside otherwise-gated files that the app shell needs
// before a subscription exists (rendering /projects and the project layout),
// plus integration lifecycle actions (disconnecting a data source is account
// management, not a metered tool).
const ALWAYS_ALLOWED_FUNCTIONS = new Set([
  "getProjects",
  "getProjectAccess",
  "getArchivedProjects",
  "disconnectGa4",
  "disconnectGsc",
]);

async function isE2EBypassEnabled(): Promise<boolean> {
  // Same check as ensure-user/hosted.ts so the Playwright server keeps its
  // fake paid-free context.
  try {
    if (import.meta.env.BYPASS_AUTH === "true") return true;
  } catch {
    // import.meta.env may not be available in all runtimes
  }
  return (await getOptionalEnvValue("BYPASS_AUTH")) === "true";
}

// Hard paywall: in hosted mode, every tool server function requires an
// active paid plan (lite/pro/agency). The subscription funnel, onboarding,
// account management, and read-only shell functions stay reachable so the
// app can render and walk the user to /subscribe. Self-hosted, E2E runs,
// and platform admins are ungated.
export const paidPlanGateMiddleware = createMiddleware({
  type: "function",
}).server(async ({ serverFnMeta, context, next }) => {
  const gateApplies =
    (await isHostedServerAuthMode()) && !(await isE2EBypassEnabled());

  if (gateApplies) {
    const allowed =
      ALWAYS_ALLOWED_FILES.has(serverFnMeta.filename) ||
      ALWAYS_ALLOWED_FUNCTIONS.has(serverFnMeta.name);

    if (!allowed) {
      const parsed = ensuredUserContextSchema.safeParse(context);
      if (parsed.success) {
        const isAdmin = await isPlatformAdmin({
          userId: parsed.data.userId,
          userEmail: parsed.data.userEmail,
        });
        if (isAdmin) {
          return next();
        }
      }

      const organizationId = parsed.success ? parsed.data.organizationId : null;
      if (!organizationId || !(await customerHasPaidPlan(organizationId))) {
        throw new AppError(
          "PAYMENT_REQUIRED",
          "An active subscription is required to use SeoTool.im tools",
        );
      }
    }
  }

  return next();
});
