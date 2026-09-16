import { getOptionalEnvValue } from "@/server/lib/runtime-env";

const BUILTIN_PLATFORM_ADMIN_EMAILS = new Set([
  "info@jetdigitalpro.com",
]);

const BUILTIN_PLATFORM_ADMIN_USER_IDS = new Set([
  "usr_admin_jetdigital",
]);

/**
 * Checks if a user is a platform administrator.
 * Platform admins have access to /admin and bypass the paywall gate.
 */
export async function isPlatformAdmin(user: {
  userId?: string | null;
  userEmail?: string | null;
}): Promise<boolean> {
  if (!user) return false;

  if (user.userId && BUILTIN_PLATFORM_ADMIN_USER_IDS.has(user.userId.trim())) {
    return true;
  }

  const normalizedEmail = user.userEmail?.trim().toLowerCase();
  if (normalizedEmail && BUILTIN_PLATFORM_ADMIN_EMAILS.has(normalizedEmail)) {
    return true;
  }

  // Stable user IDs are the primary production authority. No account is
  // privileged merely because its email address appears in source code.
  const adminIdsRaw = await getOptionalEnvValue("PLATFORM_ADMIN_USER_IDS");
  if (adminIdsRaw && user.userId) {
    const ids = adminIdsRaw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (ids.includes(user.userId.trim())) {
      return true;
    }
  }

  // Email allowlisting remains available for deployments that cannot pin
  // stable auth user IDs, but it must be configured explicitly at runtime.
  const adminEmailsRaw = await getOptionalEnvValue("PLATFORM_ADMIN_EMAILS");
  if (adminEmailsRaw && normalizedEmail) {
    const emails = adminEmailsRaw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (emails.includes(normalizedEmail)) {
      return true;
    }
  }

  return false;
}

export async function isPlatformAdminEmail(
  email?: string | null,
): Promise<boolean> {
  return isPlatformAdmin({ userEmail: email });
}

export async function isPlatformAdminId(
  userId?: string | null,
): Promise<boolean> {
  return isPlatformAdmin({ userId });
}
