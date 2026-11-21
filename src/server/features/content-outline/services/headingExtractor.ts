function stripTags(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

/** Pull h2/h3 headings out of raw HTML via regex — deliberately dependency-free
 *  so it runs in the Workers runtime without cheerio. Kept in its own module
 *  (no DataForSEO/cloudflare imports) so it stays unit-testable in vitest. */
export function extractHeadings(html: string): {
  h2s: string[];
  h3s: string[];
} {
  const h2s: string[] = [];
  const h3s: string[] = [];
  const headingRe = /<(h[23])[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html)) !== null) {
    const text = stripTags(match[2]);
    if (!text) continue;
    if (match[1].toLowerCase() === "h2") h2s.push(text);
    else h3s.push(text);
    if (h2s.length + h3s.length >= 60) break;
  }
  return { h2s, h3s };
}
