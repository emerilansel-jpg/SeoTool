import { describe, expect, it } from "vitest";
import {
  CANCELLATION_REASONS,
  CANCELLATION_REASON_LABELS,
  saveOfferForReason,
} from "./cancellation";

describe("cancellation reasons", () => {
  it("exposes a label for every reason id", () => {
    for (const reason of CANCELLATION_REASONS) {
      expect(CANCELLATION_REASON_LABELS[reason]).toBeTruthy();
    }
  });

  it("keeps the reason list at a survey-friendly size", () => {
    expect(CANCELLATION_REASONS.length).toBeLessThanOrEqual(8);
    expect(CANCELLATION_REASONS.length).toBeGreaterThanOrEqual(5);
  });
});

describe("saveOfferForReason", () => {
  it("shows no offer for business closure", () => {
    expect(saveOfferForReason("business_closed", 59)).toBeNull();
  });

  it("shows a price-lock offer for temporary cancellers", () => {
    const offer = saveOfferForReason("temporary", 49);
    expect(offer).not.toBeNull();
    expect(offer?.title).toMatch(/price lock/i);
    expect(offer?.body).toContain("$49");
  });

  it("mentions the locked dollar price for price-sensitive reasons", () => {
    const offer = saveOfferForReason("too_expensive", 29);
    expect(offer?.body).toContain("$29");
  });

  it("always routes the CTA to support outreach", () => {
    for (const reason of CANCELLATION_REASONS) {
      const offer = saveOfferForReason(reason, 59);
      if (offer) {
        expect(offer.ctaHref).toMatch(/^mailto:support@seotool\.im/);
      }
    }
  });
});
