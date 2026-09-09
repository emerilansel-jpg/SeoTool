import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getOptionalEnvValue,
  isHostedServerAuthMode,
} from "@/server/lib/runtime-env";
import { requireProjectContext } from "@/serverFunctions/middleware";

const OPENROUTER_KEY_MISSING_MESSAGE =
  "OPENROUTER_API_KEY is not set for this deployment yet. Add it to your environment, restart SeoTool.im, then confirm here.";

const projectScopedSchema = z.object({ projectId: z.string().min(1) });

export type JetAccessStatus = {
  enabled: boolean;
  errorMessage: string | null;
};

export type SamAccessStatus = JetAccessStatus;

// Gates the in-app AI agent (Jet) on an API key being configured.
export const getJetAccessSetupStatus = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(projectScopedSchema)
  .handler(async (): Promise<JetAccessStatus> => {
    if (await isHostedServerAuthMode()) {
      return { enabled: true, errorMessage: null };
    }

    const enabled = Boolean(await getOptionalEnvValue("OPENROUTER_API_KEY"));
    return {
      enabled,
      errorMessage: enabled ? null : OPENROUTER_KEY_MISSING_MESSAGE,
    };
  });

export const getSamAccessSetupStatus = getJetAccessSetupStatus;
