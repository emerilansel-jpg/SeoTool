import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { captcha, twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { isDisposableEmailDomain } from "@/server/auth/disposable-email";
import * as d1Schema from "@/db/d1/schema";
import { d1Db } from "@/db/d1/client";
import { pgDb } from "@/db/pg/client";
import * as pgSchema from "@/db/pg/schema";
import { getDatabaseProvider } from "@/db/provider";
import { z } from "zod";
import { createBaseAuthConfig } from "@/lib/auth-config";
import {
  getHostedTurnstileSecretKey,
  hasHostedTurnstileConfig,
} from "@/lib/auth-turnstile";
import { getOrCreateDefaultHostedOrganization } from "@/server/auth/default-hosted-organization";
import {
  sendHostedPasswordResetEmail,
  sendHostedVerificationEmail,
  upsertHostedSignupContact,
} from "@/server/email/loops";

const hostedBaseUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" && url.hostname === "localhost")
    );
  }, "BETTER_AUTH_URL must use https or localhost");

function createAuth() {
  const baseUrl = getHostedBaseUrl();
  const bypassEmail = Reflect.get(env, "BYPASS_EMAIL_VERIFICATION") === "true";
  const baseAuthConfig = createBaseAuthConfig();

  // Turnstile captcha on signup. Enforcement is driven by the server-side
  // secret alone so a client build/runtime site-key mismatch cannot silently
  // omit the Better Auth captcha plugin.
  const turnstileSecretKey = getHostedTurnstileSecretKey(env);

  const database =
    getDatabaseProvider() === "postgres"
      ? drizzleAdapter(pgDb, {
          provider: "pg",
          schema: pgSchema,
        })
      : drizzleAdapter(d1Db, {
          provider: "sqlite",
          schema: d1Schema,
        });

  const auth = betterAuth({
    baseURL: baseUrl,
    secret: getHostedSecret(),
    ...baseAuthConfig,
    emailAndPassword: {
      ...baseAuthConfig.emailAndPassword,
      requireEmailVerification: !bypassEmail,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendHostedPasswordResetEmail({
          email: user.email,
          resetUrl: url,
        });
      },
    },
    emailVerification: bypassEmail
      ? undefined
      : {
          sendOnSignUp: true,
          autoSignInAfterVerification: true,
          sendVerificationEmail: async ({ user, url }) => {
            await sendHostedVerificationEmail({
              email: user.email,
              confirmationUrl: url,
            });
          },
        },
    socialProviders: getSocialProviders(),
    trustedOrigins: getTrustedOrigins(baseUrl),
    database,
    plugins: [
      ...baseAuthConfig.plugins,
      ...(turnstileSecretKey
        ? [
            captcha({
              provider: "cloudflare-turnstile",
              secretKey: turnstileSecretKey,
              endpoints: ["/sign-up/email"],
            }),
          ]
        : []),
      tanstackStartCookies(),
      twoFactor({ issuer: "SeoTool.im" }),
    ],
    databaseHooks: {
      user: {
        create: {
          // Keep cheap mass-signups off the free plan by rejecting throwaway-
          // inbox domains before the user row is created.
          before: async (user) => {
            if (isDisposableEmailDomain(user.email)) {
              throw new APIError("BAD_REQUEST", {
                message: "Please sign up with a non-disposable email address.",
              });
            }
            return { data: user };
          },
          after: async (user) => {
            await syncHostedSignupContact(user);
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            // Inject Better Auth's createOrganization here so the helper can
            // stay reusable without importing auth.ts and creating a cycle.
            const organizationId = await getOrCreateDefaultHostedOrganization(
              session.userId,
              (body) => auth.api.createOrganization({ body }),
            );

            return {
              data: {
                ...session,
                activeOrganizationId: organizationId,
              },
            };
          },
        },
      },
    },
  });

  return auth;
}

let authInstance: ReturnType<typeof createAuth> | null = null;

async function syncHostedSignupContact(user: {
  id: string;
  email: string;
  name?: string | null;
}) {
  try {
    await upsertHostedSignupContact({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Failed to sync Loops profile after user creation:", {
      userId: user.id,
      email: user.email,
      error,
    });
  }
}

function getTrustedOrigins(baseUrl: string) {
  const trustedOrigins = [baseUrl];

  if (process.env.NODE_ENV !== "production") {
    trustedOrigins.push(
      "http://open-seo.localhost:1355",
      "http://*.open-seo.localhost:1355",
      "https://open-seo.localhost:1355",
      "https://*.open-seo.localhost:1355",
    );
  }

  return trustedOrigins;
}

export function getHostedBaseUrl() {
  const baseUrl = env.BETTER_AUTH_URL?.trim();

  if (!baseUrl) {
    throw new Error("BETTER_AUTH_URL is required");
  }

  return hostedBaseUrlSchema.parse(baseUrl);
}

function getHostedSecret() {
  const secret = env.BETTER_AUTH_SECRET?.trim();

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required");
  }

  if (secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters");
  }

  return secret;
}

function getSocialProviders() {
  return {
    google: getGoogleSocialProviderConfig(),
  };
}

function getGoogleSocialProviderConfig() {
  const googleClientId = env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET?.trim();

  if (!googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID is required");
  }

  if (!googleClientSecret) {
    throw new Error("GOOGLE_CLIENT_SECRET is required");
  }

  return {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    mapProfileToUser: (profile: { name?: string }) => ({
      name: profile.name,
    }),
  };
}

function hasHostedAuthEmailConfig() {
  const loopsVars = [
    "LOOPS_API_KEY",
    "LOOPS_TRANSACTIONAL_VERIFY_EMAIL_ID",
    "LOOPS_TRANSACTIONAL_RESET_PASSWORD_ID",
  ];

  return loopsVars.every((name) => {
    const value: unknown = Reflect.get(env, name);
    return typeof value === "string" && value.trim() !== "";
  });
}

export function hasHostedAuthConfig() {
  try {
    getHostedBaseUrl();
    getHostedSecret();
    getGoogleSocialProviderConfig();
    return (
      hasHostedTurnstileConfig(env) &&
      (Reflect.get(env, "BYPASS_EMAIL_VERIFICATION") === "true" ||
        hasHostedAuthEmailConfig())
    );
  } catch {
    return false;
  }
}

export function getAuth() {
  if (authInstance) {
    return authInstance;
  }

  authInstance = createAuth();

  return authInstance;
}
