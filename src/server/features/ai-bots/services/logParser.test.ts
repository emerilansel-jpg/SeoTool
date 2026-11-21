import { describe, expect, it } from "vitest";
import { parseAccessLog, parseCombinedTimestamp } from "./logParser";

const GPTBOT_UA =
  "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)";
const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

describe("parseCombinedTimestamp", () => {
  it("converts nginx/apache local time with offset to UTC ISO", () => {
    expect(parseCombinedTimestamp("10/Oct/2000:13:55:36 -0700")).toBe(
      "2000-10-10T20:55:36.000Z",
    );
  });

  it("handles +0000 offsets", () => {
    expect(parseCombinedTimestamp("01/Feb/2026:00:00:00 +0000")).toBe(
      "2026-02-01T00:00:00.000Z",
    );
  });

  it("returns null on garbage", () => {
    expect(parseCombinedTimestamp("not-a-date")).toBeNull();
  });
});

describe("parseAccessLog", () => {
  it("parses nginx combined lines", () => {
    const line = `198.51.100.7 - - [21/Nov/2026:10:15:01 +0000] "GET /blog/ai-seo HTTP/1.1" 200 5123 "-" "${GPTBOT_UA}"`;
    const result = parseAccessLog(line);
    expect(result.parsed).toBe(1);
    expect(result.entries[0]).toMatchObject({
      ip: "198.51.100.7",
      method: "GET",
      path: "/blog/ai-seo",
      status: 200,
      userAgent: GPTBOT_UA,
    });
    expect(result.entries[0].at).toBe("2026-11-21T10:15:01.000Z");
  });

  it("parses Cloudflare Logpush NDJSON lines", () => {
    const line = JSON.stringify({
      ClientIP: "203.0.113.9",
      DateTime: "2026-11-21T09:00:00Z",
      ClientRequestMethod: "GET",
      ClientRequestURI: "/pricing",
      EdgeResponseStatus: 200,
      ClientRequestUserAgent: GOOGLEBOT_UA,
    });
    const result = parseAccessLog(line);
    expect(result.parsed).toBe(1);
    expect(result.entries[0]).toMatchObject({
      ip: "203.0.113.9",
      path: "/pricing",
      status: 200,
      userAgent: GOOGLEBOT_UA,
    });
  });

  it("skips malformed lines without failing the batch", () => {
    const content = [
      "total garbage line",
      `198.51.100.7 - - [21/Nov/2026:10:15:01 +0000] "POST /api HTTP/2.0" 404 89 "-" "${GPTBOT_UA}"`,
      "",
    ].join("\n");
    const result = parseAccessLog(content);
    expect(result.parsed).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.entries[0].status).toBe(404);
  });

  it("keeps entries without a referer field (common log format)", () => {
    const line = `198.51.100.7 - - [21/Nov/2026:10:15:01 +0000] "GET /a HTTP/1.1" 200 5123`;
    const result = parseAccessLog(line);
    expect(result.parsed).toBe(1);
    expect(result.entries[0].userAgent).toBeNull();
  });
});
