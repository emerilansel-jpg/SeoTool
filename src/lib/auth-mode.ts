// Auth mode helpers. The app now runs exclusively in hosted mode (Better Auth
// email/password + Google OAuth + organization). The previous cloudflare_access
// and local_noauth modes have been removed — this is a hosted SaaS only.
//
// getAuthMode and AUTH_MODES are kept as thin pass-throughs that always
// resolve to "hosted" so the many call sites that imported them continue to
// compile. The compiler will tree-shake the dead self-host branches gated on
// these values.

export const AUTH_MODES = ["hosted"] as const;

type AuthMode = (typeof AUTH_MODES)[number];

/** Always returns "hosted" — the app is hosted-only now. */
export function getAuthMode(_value?: string | null): AuthMode {
  return "hosted";
}

/** Always true — the app is hosted-only now. Kept for call-site
 *  compatibility; the compiler eliminates self-host branches gated on this. */
export function isHostedAuthMode(_value?: string | null): boolean {
  return true;
}

/** Always true — the client build is always hosted now. */
export function isHostedClientAuthMode(): boolean {
  return true;
}

export function isEmailVerificationBypassed() {
  // Local-dev escape hatch (BYPASS_EMAIL_VERIFICATION=true). The server skips
  // verification and never marks users emailVerified, so the client must treat
  // the session as verified too — otherwise route guards and /verify-email
  // bounce each other in an infinite redirect loop.
  return import.meta.env.BYPASS_EMAIL_VERIFICATION === "true";
}
