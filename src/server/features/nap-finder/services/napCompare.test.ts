import { describe, expect, it } from "vitest";
import {
  compareAddress,
  comparePhone,
  normalizePhone,
  textContainsPhone,
} from "./napCompare";

describe("normalizePhone", () => {
  it("strips formatting and keeps last 10 digits", () => {
    expect(normalizePhone("+1 (555) 123-4567")).toEqual({
      digits: "15551234567",
      last10: "5551234567",
    });
    expect(normalizePhone("0812-3456-7890")).toEqual({
      digits: "081234567890",
      last10: "1234567890",
    });
    expect(normalizePhone(null)).toEqual({ digits: "", last10: null });
  });
});

describe("textContainsPhone", () => {
  it("finds the reference phone inside a snippet with different formatting", () => {
    expect(
      textContainsPhone(
        "Call (555) 123-4567 today. 123 Main St, Springfield.",
        "+1 555 123 4567",
      ),
    ).toBe(true);
  });

  it("returns false when the phone differs", () => {
    expect(
      textContainsPhone("Call 555-987-6543 for reservations", "5551234567"),
    ).toBe(false);
  });

  it("returns false without reference phone or text", () => {
    expect(textContainsPhone("some text", null)).toBe(false);
    expect(textContainsPhone(null, "5551234567")).toBe(false);
  });
});

describe("compareAddress", () => {
  it("matches addresses ignoring punctuation and case", () => {
    expect(
      compareAddress(
        "123 Main St, Springfield, IL 62701",
        "123 main street springfield il 62701",
      ),
    ).toBe(true);
  });

  it("falls back to zip comparison for differently formatted addresses", () => {
    expect(
      compareAddress(
        "123 Main Street, Springfield, 62701",
        "456 Oak Ave, Springfield, IL 62701",
      ),
    ).toBe(true);
    expect(
      compareAddress(
        "123 Main Street, Chicago, 60601",
        "456 Oak Ave, Springfield, IL 62701",
      ),
    ).toBe(false);
  });

  it("returns null when either side is missing", () => {
    expect(compareAddress("123 Main St", null)).toBeNull();
    expect(compareAddress(null, "123 Main St")).toBeNull();
  });
});

describe("comparePhone", () => {
  it("matches the last 10 digits", () => {
    expect(comparePhone("(555) 123-4567", "+1 555 123 4567")).toBe(true);
    expect(comparePhone("555-123-4568", "5551234567")).toBe(false);
  });

  it("returns null without found phone", () => {
    expect(comparePhone(null, "5551234567")).toBeNull();
  });
});
