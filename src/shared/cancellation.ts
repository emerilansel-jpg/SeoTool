/** Exit-survey reasons and reason-matched save offers for the All Access
 *  cancel flow. Shared so the client modal and the server validator agree on
 *  the exact reason ids persisted to `cancellation_feedback`. */
export const CANCELLATION_REASONS = [
  "too_expensive",
  "not_using",
  "missing_feature",
  "switching",
  "technical",
  "temporary",
  "business_closed",
  "other",
] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

export const CANCELLATION_REASON_LABELS: Record<CancellationReason, string> = {
  too_expensive: "It's too expensive",
  not_using: "I'm not using it enough",
  missing_feature: "A feature I need is missing",
  switching: "I'm switching to another tool",
  technical: "I ran into technical issues",
  temporary: "I just don't need it right now",
  business_closed: "My business is closing or changing",
  other: "Other",
};

export type SaveOffer = {
  title: string;
  body: string;
  /** Support outreach is the honest lever we can offer today; offers that the
   *  product cannot honor (discounts, pauses) must not be shown. */
  ctaLabel: string;
  ctaHref: string;
};

const SUPPORT_MAILTO =
  "mailto:support@seotool.im?subject=All%20Access%20cancellation";

/** Reason-matched save message shown before the final confirmation. Business
 *  closure gets no offer (respect the situation); the confirm step handles it. */
export function saveOfferForReason(
  reason: CancellationReason,
  priceUsd: number,
): SaveOffer | null {
  switch (reason) {
    case "too_expensive":
      return {
        title: "Before you go: your price is locked",
        body: `Your $${priceUsd.toFixed(0)}/month rate stays locked for as long as your membership is active, even as public prices rise. Referring other users also earns you 20% of their payments back in credits, which can offset most of your cost.`,
        ctaLabel: "Ask about options",
        ctaHref: SUPPORT_MAILTO,
      };
    case "not_using":
      return {
        title: "A quick setup session usually fixes this",
        body: "Most members who feel this way haven't connected their rank tracking or run their first audit yet. Tell us where you're stuck and we'll help you get value out of your remaining billing period.",
        ctaLabel: "Get free setup help",
        ctaHref: SUPPORT_MAILTO,
      };
    case "missing_feature":
      return {
        title: "Tell us what's missing",
        body: "Feature requests from members drive the roadmap directly. Tell us what you need and we'll tell you honestly whether it exists, is planned, or never will be.",
        ctaLabel: "Share the missing feature",
        ctaHref: SUPPORT_MAILTO,
      };
    case "switching":
      return {
        title: "Sorry to see you go",
        body: "If the other tool is missing something we do well, we'd genuinely like to know. And if you change your mind, your account data stays put so you can pick up where you left off.",
        ctaLabel: "Tell us what they do better",
        ctaHref: SUPPORT_MAILTO,
      };
    case "technical":
      return {
        title: "Let us fix it first",
        body: "If something is broken for you, that's on us. Describe the issue and we'll prioritize a fix while your membership is still active.",
        ctaLabel: "Report the issue",
        ctaHref: SUPPORT_MAILTO,
      };
    case "temporary":
      return {
        title: "Cancelling ends your lifetime price lock",
        body: `If you pause today and come back later, you'll pay the public price at that time, not your locked $${priceUsd.toFixed(0)}/month. Staying subscribed even while idle keeps your rate and your saved projects, keywords, and reports intact.`,
        ctaLabel: "Keep my price",
        ctaHref: SUPPORT_MAILTO,
      };
    case "business_closed":
      return null;
    case "other":
      return {
        title: "One thing before you go",
        body: "We read every cancellation note. If there's anything we could have done differently, tell us directly and we'll respond.",
        ctaLabel: "Talk to us",
        ctaHref: SUPPORT_MAILTO,
      };
  }
}
