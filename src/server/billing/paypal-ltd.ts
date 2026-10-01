export function createLtdMarker(
  organizationId: string,
  planKey: string,
  timestamp = Date.now(),
): string {
  return `ltd:${organizationId}:${planKey}:${timestamp}`;
}

export function parseLtdMarker(value: unknown): {
  organizationId: string;
  planKey: string;
} | null {
  if (typeof value !== "string" || !value.startsWith("ltd:")) return null;
  const parts = value.split(":");
  if (parts.length < 4) return null;
  const organizationId = parts[1];
  const planKey = parts[2];
  if (!organizationId || !planKey) return null;
  return { organizationId, planKey };
}
