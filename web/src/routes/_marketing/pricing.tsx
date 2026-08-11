import { createFileRoute } from "@tanstack/react-router";
import { buildPageSeo } from "@/lib/seo";

export const Route = createFileRoute("/_marketing/pricing")({
  head: () =>
    buildPageSeo({
      title: "Pricing",
      description:
        "Start free. Upgrade as you grow. Four tiers with per-feature quotas — keyword research, rank tracking, site audits, backlinks, and AI agents.",
      path: "/pricing",
      titleSuffix: "OpenSEO",
    }),
  component: Pricing,
});

/* ------------------------------------------------------------------ *
 * Plan definitions. Single source of truth for the marketing pricing
 * page. Keep consistent with src/shared/plans.ts (app).
 * ------------------------------------------------------------------ */

type PlanTierKey = "free" | "lite" | "pro" | "agency";

type PlanRow = {
  tier: PlanTierKey;
  name: string;
  price: number;
  blurb: string;
  highlight?: boolean;
  cta: string;
};

const PLANS: PlanRow[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    blurb: "Test the waters with one project.",
    cta: "Get Started",
  },
  {
    tier: "lite",
    name: "Lite",
    price: 49,
    blurb: "For solo marketers and small businesses.",
    cta: "Start Lite",
  },
  {
    tier: "pro",
    name: "Pro",
    price: 149,
    blurb: "For growing agencies managing multiple clients.",
    highlight: true,
    cta: "Start Pro",
  },
  {
    tier: "agency",
    name: "Agency",
    price: 499,
    blurb: "For large agencies with heavy workloads.",
    cta: "Start Agency",
  },
];

// Feature comparison rows. Each value is either a string, a boolean
// (checkmark / dash), or "unlimited".
type FeatureValue = string | boolean | "unlimited";

type FeatureRow = {
  label: string;
  values: Record<PlanTierKey, FeatureValue>;
};

const FEATURE_GROUPS: { group: string; rows: FeatureRow[] }[] = [
  {
    group: "Projects & Keywords",
    rows: [
      {
        label: "Projects",
        values: {
          free: "1",
          lite: "5",
          pro: "25",
          agency: "unlimited",
        },
      },
      {
        label: "Keyword research searches / day",
        values: {
          free: "10",
          lite: "100",
          pro: "500",
          agency: "unlimited",
        },
      },
      {
        label: "Saved keywords",
        values: {
          free: "50",
          lite: "500",
          pro: "5,000",
          agency: "unlimited",
        },
      },
      {
        label: "Tracked keywords",
        values: {
          free: "—",
          lite: "50",
          pro: "500",
          agency: "5,000",
        },
      },
    ],
  },
  {
    group: "Audits & Backlinks",
    rows: [
      {
        label: "Site audits / month",
        values: { free: "1", lite: "3", pro: "10", agency: "50" },
      },
      {
        label: "Max pages per audit",
        values: {
          free: "50",
          lite: "500",
          pro: "5,000",
          agency: "10,000",
        },
      },
      {
        label: "Backlink checks / day",
        values: { free: "—", lite: "10", pro: "100", agency: "500" },
      },
    ],
  },
  {
    group: "AI & Content",
    rows: [
      {
        label: "AI brand citation / month",
        values: { free: "—", lite: "10", pro: "50", agency: "200" },
      },
      {
        label: "AI prompt explorer / month",
        values: { free: "—", lite: "20", pro: "100", agency: "500" },
      },
      {
        label: "Content intelligence / month",
        values: { free: "—", lite: "20", pro: "100", agency: "500" },
      },
    ],
  },
  {
    group: "Integrations & Tools",
    rows: [
      {
        label: "Google Search Console",
        values: {
          free: true,
          lite: true,
          pro: true,
          agency: true,
        },
      },
      {
        label: "Google Analytics 4",
        values: {
          free: true,
          lite: true,
          pro: true,
          agency: true,
        },
      },
      {
        label: "SAM AI agent",
        values: {
          free: false,
          lite: true,
          pro: true,
          agency: true,
        },
      },
      {
        label: "MCP server & agent skills",
        values: {
          free: false,
          lite: true,
          pro: true,
          agency: true,
        },
      },
      {
        label: "White-label reports",
        values: {
          free: "—",
          lite: "5",
          pro: "25",
          agency: "unlimited",
        },
      },
    ],
  },
];

const SIGNUP_URL = "https://app.openseo.so/sign-up";

const usd = (n: number) =>
  n === 0 ? "$0" : n >= 100 ? `$${Math.round(n).toLocaleString()}` : `$${n}`;

function Pricing() {
  return (
    <article className="mx-auto max-w-5xl">
      {/* Hero */}
      <p className="text-sm font-medium text-[var(--color-brand-accent)]">
        Pricing
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
        Simple, transparent pricing
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-brand-muted)]">
        Start free, upgrade when you need more. Every plan includes keyword
        research, rank tracking, site audits, and backlinks — with clear
        per-feature quotas so you always know where you stand.
      </p>

      {/* Plan cards */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`relative flex flex-col rounded-xl border p-6 ${
              plan.highlight
                ? "border-[var(--color-brand-accent)] bg-white shadow-sm ring-1 ring-[var(--color-brand-accent)]/30"
                : "border-[var(--color-border-subtle)] bg-white"
            }`}
          >
            {plan.highlight ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-brand-accent)] px-3 py-0.5 text-xs font-medium text-white">
                Most popular
              </span>
            ) : null}
            <h3 className="text-lg font-semibold text-neutral-950">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-brand-muted)]">
              {plan.blurb}
            </p>
            <p className="mt-4 text-3xl font-semibold tabular-nums text-neutral-950">
              {usd(plan.price)}
              <span className="text-base font-normal text-[var(--color-brand-muted)]">
                {plan.price > 0 ? "/mo" : ""}
              </span>
            </p>
            <a
              href={
                plan.tier === "free"
                  ? SIGNUP_URL
                  : `${SIGNUP_URL}?plan=${plan.tier}`
              }
              className={`mt-5 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                plan.highlight || plan.price > 0
                  ? "bg-neutral-950 text-white hover:bg-neutral-800"
                  : "border border-[var(--color-border-subtle)] text-neutral-950 hover:bg-neutral-50"
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </section>

      {/* Feature comparison table */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
          Compare plans
        </h2>

        {/* Desktop table */}
        <div className="mt-6 hidden overflow-hidden rounded-xl border border-[var(--color-border-subtle)] md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <th className="px-5 py-3 text-left font-medium text-neutral-700">
                  Feature
                </th>
                {PLANS.map((plan) => (
                  <th
                    key={plan.tier}
                    className="px-5 py-3 text-center font-semibold text-neutral-950"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_GROUPS.map((group) => (
                <>
                  <tr
                    key={group.group}
                    className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]"
                  >
                    <td
                      colSpan={5}
                      className="px-5 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500"
                    >
                      {group.group}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-[var(--color-border-subtle)] last:border-0"
                    >
                      <td className="px-5 py-3 text-neutral-700">
                        {row.label}
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.tier}
                          className="px-5 py-3 text-center tabular-nums text-neutral-950"
                        >
                          <FeatureCell value={row.values[plan.tier]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mt-6 space-y-6 md:hidden">
          {FEATURE_GROUPS.map((group) => (
            <div
              key={group.group}
              className="rounded-lg border border-[var(--color-border-subtle)] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {group.group}
              </p>
              <dl className="mt-3 space-y-3">
                {group.rows.map((row) => (
                  <div key={row.label} className="space-y-1">
                    <dt className="text-sm text-neutral-700">{row.label}</dt>
                    <dd className="flex gap-2 text-xs">
                      {PLANS.map((plan) => (
                        <span
                          key={plan.tier}
                          className="inline-flex items-center gap-1 rounded border border-[var(--color-border-subtle)] px-2 py-0.5"
                        >
                          <span className="font-medium text-neutral-500">
                            {plan.name}:
                          </span>
                          <span className="text-neutral-950">
                            <FeatureCell value={row.values[plan.tier]} />
                          </span>
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
          FAQ
        </h2>
        <dl className="mt-5 divide-y divide-[var(--color-border-subtle)]">
          <div className="py-4 first:pt-0 last:pb-0">
            <dt className="text-sm font-medium text-neutral-950">
              Is there a free plan?
            </dt>
            <dd className="mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]">
              Yes. The Free plan includes one project, 10 daily keyword
              searches, and one site audit per month — enough to evaluate
              OpenSEO before subscribing.
            </dd>
          </div>
          <div className="py-4 first:pt-0 last:pb-0">
            <dt className="text-sm font-medium text-neutral-950">
              What happens when I hit my quota limit?
            </dt>
            <dd className="mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]">
              You&rsquo;ll see a friendly upgrade prompt when you try to use a
              feature that&rsquo;s exceeded its quota. Your existing data is
              never lost — just upgrade or wait for the next reset window.
            </dd>
          </div>
          <div className="py-4 first:pt-0 last:pb-0">
            <dt className="text-sm font-medium text-neutral-950">
              Can I upgrade or downgrade anytime?
            </dt>
            <dd className="mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]">
              Yes. Changes take effect immediately and your usage quotas reset
              to match the new plan. Billing is prorated through Stripe.
            </dd>
          </div>
          <div className="py-4 first:pt-0 last:pb-0">
            <dt className="text-sm font-medium text-neutral-950">
              Do quotas reset?
            </dt>
            <dd className="mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]">
              Daily quotas (keyword searches, backlink checks) reset every day
              at midnight UTC. Monthly quotas (audits, AI scans, content
              intelligence) reset at the start of each billing cycle.
            </dd>
          </div>
          <div className="py-4 first:pt-0 last:pb-0">
            <dt className="text-sm font-medium text-neutral-950">
              Can I cancel anytime?
            </dt>
            <dd className="mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]">
              Yes. Cancel from your billing page at any time. Your access
              continues through the end of the current billing period.
            </dd>
          </div>
        </dl>
      </section>
    </article>
  );
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === "unlimited") {
    return <span className="text-neutral-950">Unlimited</span>;
  }
  if (value === true) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-auto text-emerald-600"
        aria-label="Included"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (value === false || value === "—") {
    return <span className="text-neutral-300">&mdash;</span>;
  }
  return <span>{value}</span>;
}
