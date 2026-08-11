import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import { MIN_BETTER_AUTH_SECRET_LENGTH } from "@/shared/selfhost-checks";

type Ga4OAuthClientConfig = {
  clientId: string;
  clientSecret: string;
};

export async function getGa4OAuthClientConfig(): Promise<Ga4OAuthClientConfig | null> {
  const clientId = (await getOptionalEnvValue("GOOGLE_CLIENT_ID"))?.trim();
  const clientSecret = (
    await getOptionalEnvValue("GOOGLE_CLIENT_SECRET")
  )?.trim();

  if (!clientId || !clientSecret) return null;

  return { clientId, clientSecret };
}

// Self-hosted Google Analytics needs the Google OAuth client AND
// BETTER_AUTH_SECRET (>=32 chars): the secret keys OAuth-token encryption and
// lets us build the Better Auth instance that mints/refreshes tokens. Both must
// be set before we surface the connect flow. Same gate as Search Console.
export async function hasSelfHostedGa4Config(): Promise<boolean> {
  if (!(await getGa4OAuthClientConfig())) return false;

  const secret = (await getOptionalEnvValue("BETTER_AUTH_SECRET"))?.trim();
  return Boolean(secret && secret.length >= MIN_BETTER_AUTH_SECRET_LENGTH);
}
