export const HOSTED_PASSWORD_MIN_LENGTH = 8;
export const HOSTED_PASSWORD_MAX_LENGTH = 128;

export const userAdditionalFields = {
  analyticsOptedOut: {
    type: "boolean" as const,
    defaultValue: () => false,
    required: false as const,
    input: true as const,
  },
  emailProductUpdates: {
    type: "boolean" as const,
    defaultValue: () => true,
    required: false as const,
    input: true as const,
  },
  emailAlertNotifications: {
    type: "boolean" as const,
    defaultValue: () => true,
    required: false as const,
    input: true as const,
  },
};

export const baseAuthOptions = {
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    minPasswordLength: HOSTED_PASSWORD_MIN_LENGTH,
    maxPasswordLength: HOSTED_PASSWORD_MAX_LENGTH,
  },
  // Explicit rather than relying on better-auth defaults so the limiter can't
  // be silently lost to an upgrade. Storage stays in-memory (Workers has no
  // shared store by default) and specialRules still tighten sign-in/sign-up
  // (3 req/10s) and password-reset paths (3 req/60s). Edge-level coverage for
  // cross-isolate floods is a Cloudflare WAF rate-limiting rule — see
  // runbooks/production-runbook.md.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  user: {
    additionalFields: userAdditionalFields,
  },
  session: {
    // Serve getSession from a signed cookie instead of a DB round trip. The
    // session lookup runs on every authenticated request, and the DB lives in
    // us-east, from far colos that single query was ~1s of wall time. The
    // trade-off is revocation lag: a session revoked elsewhere (sign-out on
    // another device, password reset) stays valid on an already-issued cookie
    // for up to maxAge. Authorization still hits the DB via the canonical
    // project-access checks, so the cookie only vouches for identity.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
};
