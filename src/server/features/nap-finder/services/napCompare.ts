// Pure NAP comparison helpers (unit-testable, no I/O). Used by NapService to
// decide per-directory verdicts from SERP/GBP payloads.

/** Keep only digits, plus a canonical last-10 view for phone matching. */
export function normalizePhone(phone: string | null | undefined): {
  digits: string;
  last10: string | null;
} {
  if (!phone) return { digits: "", last10: null };
  const digits = phone.replace(/\D/g, "");
  return {
    digits,
    last10: digits.length >= 10 ? digits.slice(-10) : null,
  };
}

/** Find the input phone inside free text (SERP snippets/titles). */
export function textContainsPhone(
  text: string | null | undefined,
  phone: string | null | undefined,
): boolean {
  if (!text || !phone) return false;
  const target = normalizePhone(phone);
  if (!target.last10) return false;
  const haystack = normalizePhone(text).digits;
  return haystack.includes(target.last10);
}

export type NapComparison = {
  phoneMatches: boolean | null; // null = nothing to compare
  addressMatches: boolean | null;
};

function normalizeAddressText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Address matching on directory data is fuzzy by design: compare the
 *  normalized street-number + first word of the street (or zip) to avoid
 *  format differences ("St." vs "Street") producing false mismatches. */
export function compareAddress(
  found: string | null | undefined,
  reference: string | null | undefined,
): boolean | null {
  if (!found || !reference) return null;
  const a = normalizeAddressText(found);
  const b = normalizeAddressText(reference);
  if (!a || !b) return null;
  if (a.includes(b) || b.includes(a)) return true;
  const zipA = /\b\d{5}\b/.exec(a)?.[0];
  const zipB = /\b\d{5}\b/.exec(b)?.[0];
  if (zipA && zipB) return zipA === zipB;
  return false;
}

export function comparePhone(
  found: string | null | undefined,
  reference: string | null | undefined,
): boolean | null {
  if (!found) return null;
  if (!reference) return null;
  const a = normalizePhone(found).last10;
  const b = normalizePhone(reference).last10;
  if (!a || !b) return null;
  return a === b;
}
