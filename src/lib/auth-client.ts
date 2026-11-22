import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  inferAdditionalFields,
  InferServerPlugin,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import type { getAuth } from "@/lib/auth";
import { captureClientEvent, resetAnalyticsUser } from "@/client/lib/posthog";
import { userAdditionalFields } from "@/lib/auth-options";
import { getSignInHrefForLocation } from "@/lib/auth-redirect";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [
    InferServerPlugin<ReturnType<typeof getAuth>, "generic-oauth">(),
    organizationClient(),
    twoFactorClient(),
    adminClient(),
    inferAdditionalFields({ user: userAdditionalFields }),
  ],
});

export const { useSession } = authClient;

export function signOutAndRedirect() {
  const signInHref = getSignInHrefForLocation(window.location);
  captureClientEvent("auth:sign_out");
  resetAnalyticsUser();
  void authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.assign(signInHref);
      },
    },
  });
}
