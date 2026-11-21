import { APP_VERSION } from "./appVersion";

/**
 * User-facing release history, newest first. Edit this file when shipping a
 * release (see README "Release checklist"): bump package.json version, add a
 * matching entry here, group items under new/improved/fixed.
 */
export type ChangelogItemType = "new" | "improved" | "fixed";

export interface ChangelogItem {
  type: ChangelogItemType;
  text: string;
  /** Marks fixes that came straight from user feedback. */
  reportedByUsers?: boolean;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  items: ChangelogItem[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.1.0",
    date: "2026-11-21",
    items: [
      {
        type: "new",
        text: 'Send feedback from any page with the new floating "Report a Bug / Request a Feature" button. We reply by email when it is fixed.',
      },
      {
        type: "new",
        text: 'See what changed with the new "What\'s New" release notes, always one click away.',
      },
      {
        type: "new",
        text: "Coupon codes: workspaces can now redeem gift credits from Billing.",
      },
      {
        type: "improved",
        text: "Smoother sign-up: new visitors are guided to create a free account and returned right back to what they were doing.",
      },
      {
        type: "improved",
        text: "Clearer buttons and friendlier wording across Login, Sign Up, and password reset.",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-11-08",
    items: [
      {
        type: "new",
        text: "Local Map Rank Tracker: more accurate grid scans that now scale to any area size, with per-pin competitor details and the exact keyword shown.",
        reportedByUsers: true,
      },
      {
        type: "fixed",
        text: "Expanded map scans no longer show misleading empty results.",
        reportedByUsers: true,
      },
      {
        type: "improved",
        text: "Payments moved to Dodo Payments with safer checkout, instant access, and a one-click manage subscription portal.",
      },
      {
        type: "improved",
        text: "Steadier AI Visibility data: brand mentions are now measured against the real prompt answers, with fewer false positives.",
      },
    ],
  },
];

export const LATEST_CHANGELOG_VERSION = CHANGELOG[0]?.version ?? APP_VERSION;

export function unseenVersionKey(): string {
  return "seotool.whatsNewSeenVersion";
}
