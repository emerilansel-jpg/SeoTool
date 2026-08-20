import { getOptionalEnvValue } from "@/server/lib/runtime-env";

const BUILTIN_PLATFORM_ADMIN_EMAILS = new Set([
  "alfu13.sf@gmail.com",
  "emerilansel@gmail.com",
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

  const normalizedEmail = user.userEmail?.trim().toLowerCase();

  // 1. Built-in platform admin email
  if (normalizedEmail && BUILTIN_PLATFORM_ADMIN_EMAILS.has(normalizedEmail)) {
    return true;
  }

  // 2. PLATFORM_ADMIN_EMAILS env var (comma-separated)
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

  // 3. PLATFORM_ADMIN_USER_IDS env var (comma-separated)
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
