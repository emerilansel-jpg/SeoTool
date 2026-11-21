// Minimal robots.txt group parser for the AI Bot Monitor compliance panel.
// Answers the practical compliance question ("is this bot blocked site-wide?"):
// User-agent lines accumulate into one group until the first non-agent
// directive; a group counts as blocking only when it contains a bare
// `Disallow: /` (or `/ *`-style catch-alls). Partial-path rules leave the bot
// "allowed" for the dashboard's purposes.

export type RobotsDirective = "allowed" | "disallowed" | "not_mentioned";

type RobotsGroup = { agents: string[]; disallowAll: boolean };

export function parseRobotsForBot(
  robotsTxt: string,
  uaToken: string,
): RobotsDirective {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], disallowAll: false };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (key === "disallow") {
      const catchAll = value === "/" || value === "/*";
      if (catchAll) current.disallowAll = true;
    }
  }

  const token = uaToken.toLowerCase();
  const specific = groups.find((group) =>
    group.agents.some((agent) => agent === token),
  );
  if (specific) {
    return specific.disallowAll ? "disallowed" : "allowed";
  }
  const wildcard = groups.find((group) => group.agents.includes("*"));
  if (wildcard) {
    return wildcard.disallowAll ? "disallowed" : "allowed";
  }
  return "not_mentioned";
}
