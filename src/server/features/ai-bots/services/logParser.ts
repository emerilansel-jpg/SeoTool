// Access-log parser for the AI Bot Monitor's "upload logs" path. Understands
// the two formats users realistically paste in: Nginx/Apache combined logs
// (one JSON object per line) and Cloudflare Logpush NDJSON. Everything that
// doesn't match either format is skipped line-by-line — a mixed or malformed
// file still yields every parseable row.
//
// The parser returns RAW entries with no bot classification; classification
// against the shared AI_BOTS taxonomy happens in AiBotService so ingest and
// log upload go through one matcher.

import type { AiBotDefinition } from "@/shared/ai-bots";

export type ParsedLogEntry = {
  ip: string | null;
  at: string; // ISO 8601
  method: string;
  path: string;
  status: number | null;
  userAgent: string | null;
  source: "log_upload";
};

// Nginx/Apache combined log: ip - user [time] "METHOD path PROTO" status bytes "referer" "ua"
const COMBINED_LINE =
  /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)[^"]*"\s+(\d{3})\s+\S+(?:\s+"([^"]*)"\s+"([^"]*)")?/;

const MONTHS: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

/** "10/Oct/2000:13:55:36 -0700" → ISO 8601 (UTC). */
export function parseCombinedTimestamp(raw: string): string | null {
  const match =
    /^(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})$/.exec(
      raw,
    );
  if (!match) return null;
  const [, day, mon, year, hh, mm, ss, offset] = match;
  const month = MONTHS[mon.toLowerCase()];
  if (!month) return null;
  // Normalize "+HHMM"/"-HHMM" to "±HH:MM" so Date can parse it.
  const offsetIso = `${offset.slice(0, 3)}:${offset.slice(3)}`;
  const iso = `${year}-${month}-${day}T${hh}:${mm}:${ss}${offsetIso}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseCombinedLine(line: string): ParsedLogEntry | null {
  const match = COMBINED_LINE.exec(line);
  if (!match) return null;
  const [, ip, timeRaw, method, path, status, , userAgent] = match;
  const at = parseCombinedTimestamp(timeRaw);
  if (!at) return null;
  return {
    ip,
    at,
    method,
    path,
    status: Number(status),
    userAgent: userAgent ?? null,
    source: "log_upload",
  };
}

type CloudflareLogLine = {
  ClientIP?: string;
  DateTime?: string;
  ClientRequestMethod?: string;
  ClientRequestURI?: string;
  EdgeResponseStatus?: number;
  ClientRequestUserAgent?: string;
};

function isCloudflareLogLine(value: unknown): value is CloudflareLogLine {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.ClientRequestURI === "string" ||
    typeof record.ClientRequestUserAgent === "string"
  );
}

function parseCloudflareLine(value: CloudflareLogLine): ParsedLogEntry | null {
  const at = value.DateTime
    ? new Date(value.DateTime).toISOString()
    : new Date().toISOString();
  if (Number.isNaN(new Date(at).getTime())) return null;
  return {
    ip: value.ClientIP ?? null,
    at,
    method: value.ClientRequestMethod ?? "GET",
    path: value.ClientRequestURI ?? "/",
    status: value.EdgeResponseStatus ?? null,
    userAgent: value.ClientRequestUserAgent ?? null,
    source: "log_upload",
  };
}

const MAX_FILE_LINES = 200_000;
const MAX_FILE_BYTES = 24 * 1024 * 1024;

export type LogParseResult = {
  parsed: number;
  skipped: number;
  truncated: boolean;
  entries: ParsedLogEntry[];
};

/** Parse one log line: JSON first, then combined format. Returns the entry or
 *  null when the line is not parseable. */
function parseLine(trimmed: string): ParsedLogEntry | null {
  if (trimmed.startsWith("{")) {
    try {
      const value: unknown = JSON.parse(trimmed);
      if (isCloudflareLogLine(value)) {
        return parseCloudflareLine(value);
      }
    } catch {
      // fall through to combined-format parsing
    }
  }
  return parseCombinedLine(trimmed);
}

export function parseAccessLog(content: string): LogParseResult {
  const bytes = Buffer.byteLength(content, "utf8");
  const lines = content.split("\n").slice(0, MAX_FILE_LINES);
  const truncated =
    bytes > MAX_FILE_BYTES || content.split("\n").length > MAX_FILE_LINES;

  const entries: ParsedLogEntry[] = [];
  let skipped = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const entry = parseLine(trimmed);
    if (entry) {
      entries.push(entry);
    } else {
      skipped += 1;
    }
  }

  return {
    parsed: entries.length,
    skipped,
    truncated,
    entries,
  };
}

export type { AiBotDefinition };
