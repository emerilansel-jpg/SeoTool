import { U as jsxRuntimeExports } from "./worker-entry-KJBorVTL.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const PLANS = [{
  tier: "free",
  name: "Free",
  price: 0,
  blurb: "Test the waters with one project.",
  cta: "Get Started"
}, {
  tier: "lite",
  name: "Lite",
  price: 49,
  blurb: "For solo marketers and small businesses.",
  cta: "Start Lite"
}, {
  tier: "pro",
  name: "Pro",
  price: 149,
  blurb: "For growing agencies managing multiple clients.",
  highlight: true,
  cta: "Start Pro"
}, {
  tier: "agency",
  name: "Agency",
  price: 499,
  blurb: "For large agencies with heavy workloads.",
  cta: "Start Agency"
}];
const FEATURE_GROUPS = [{
  group: "Projects & Keywords",
  rows: [{
    label: "Projects",
    values: {
      free: "1",
      lite: "5",
      pro: "25",
      agency: "unlimited"
    }
  }, {
    label: "Keyword research searches / day",
    values: {
      free: "10",
      lite: "100",
      pro: "500",
      agency: "unlimited"
    }
  }, {
    label: "Saved keywords",
    values: {
      free: "50",
      lite: "500",
      pro: "5,000",
      agency: "unlimited"
    }
  }, {
    label: "Tracked keywords",
    values: {
      free: "—",
      lite: "50",
      pro: "500",
      agency: "5,000"
    }
  }]
}, {
  group: "Audits & Backlinks",
  rows: [{
    label: "Site audits / month",
    values: {
      free: "1",
      lite: "3",
      pro: "10",
      agency: "50"
    }
  }, {
    label: "Max pages per audit",
    values: {
      free: "50",
      lite: "500",
      pro: "5,000",
      agency: "10,000"
    }
  }, {
    label: "Backlink checks / day",
    values: {
      free: "—",
      lite: "10",
      pro: "100",
      agency: "500"
    }
  }]
}, {
  group: "AI & Content",
  rows: [{
    label: "AI brand citation / month",
    values: {
      free: "—",
      lite: "10",
      pro: "50",
      agency: "200"
    }
  }, {
    label: "AI prompt explorer / month",
    values: {
      free: "—",
      lite: "20",
      pro: "100",
      agency: "500"
    }
  }, {
    label: "Content intelligence / month",
    values: {
      free: "—",
      lite: "20",
      pro: "100",
      agency: "500"
    }
  }]
}, {
  group: "Integrations & Tools",
  rows: [{
    label: "Google Search Console",
    values: {
      free: true,
      lite: true,
      pro: true,
      agency: true
    }
  }, {
    label: "Google Analytics 4",
    values: {
      free: true,
      lite: true,
      pro: true,
      agency: true
    }
  }, {
    label: "SAM AI agent",
    values: {
      free: false,
      lite: true,
      pro: true,
      agency: true
    }
  }, {
    label: "MCP server & agent skills",
    values: {
      free: false,
      lite: true,
      pro: true,
      agency: true
    }
  }, {
    label: "White-label reports",
    values: {
      free: "—",
      lite: "5",
      pro: "25",
      agency: "unlimited"
    }
  }]
}];
const SIGNUP_URL = "https://seotool.im/sign-up";
const usd = (n) => n === 0 ? "$0" : n >= 100 ? `$${Math.round(n).toLocaleString()}` : `$${n}`;
function Pricing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mx-auto max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[var(--color-brand-accent)]", children: "Pricing" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[var(--color-brand)] md:text-5xl", children: "Simple, transparent pricing" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-2xl text-base leading-7 text-[var(--color-brand-muted)]", children: "Start free, upgrade when you need more. Every plan includes keyword research, rank tracking, site audits, and backlinks, with clear per-feature quotas so you always know where you stand." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: PLANS.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative flex flex-col rounded-xl border p-6 ${plan.highlight ? "border-[var(--color-brand-accent)] bg-[var(--color-surface-raised)] shadow-sm ring-1 ring-[var(--color-brand-accent)]/30" : "border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)]"}`, children: [
      plan.highlight ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-brand-accent)] px-3 py-0.5 text-xs font-medium text-white", children: "Most popular" }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-[var(--color-brand)]", children: plan.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-[var(--color-brand-muted)]", children: plan.blurb }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-3xl font-semibold tabular-nums text-[var(--color-brand)]", children: [
        usd(plan.price),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-normal text-[var(--color-brand-muted)]", children: plan.price > 0 ? "/mo" : "" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: plan.tier === "free" ? SIGNUP_URL : `${SIGNUP_URL}?plan=${plan.tier}`, className: `mt-5 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${plan.highlight || plan.price > 0 ? "bg-[var(--color-cta)] text-white hover:bg-[#ff6a1f]" : "border border-[var(--color-border-subtle)] text-[var(--color-brand)] hover:bg-[var(--color-surface-raised)]"}`, children: plan.cta })
    ] }, plan.tier)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold tracking-tight text-[var(--color-brand)]", children: "Compare plans" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 hidden overflow-hidden rounded-xl border border-[var(--color-border-subtle)] md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3 text-left font-medium text-[var(--color-brand-muted)]", children: "Feature" }),
          PLANS.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3 text-center font-semibold text-[var(--color-brand)]", children: plan.name }, plan.tier))
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: FEATURE_GROUPS.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-muted)]", children: group.group }) }, group.group),
          group.rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-[var(--color-border-subtle)] last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-[var(--color-brand-muted)]", children: row.label }),
            PLANS.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-center tabular-nums text-[var(--color-brand)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCell, { value: row.values[plan.tier] }) }, plan.tier))
          ] }, row.label))
        ] })) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-6 md:hidden", children: FEATURE_GROUPS.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-[var(--color-border-subtle)] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-muted)]", children: group.group }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "mt-3 space-y-3", children: group.rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm text-[var(--color-brand-muted)]", children: row.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "flex gap-2 text-xs", children: PLANS.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded border border-[var(--color-border-subtle)] px-2 py-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-[var(--color-brand-muted)]", children: [
              plan.name,
              ":"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--color-brand)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCell, { value: row.values[plan.tier] }) })
          ] }, plan.tier)) })
        ] }, row.label)) })
      ] }, group.group)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold tracking-tight text-[var(--color-brand)]", children: "FAQ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-5 divide-y divide-[var(--color-border-subtle)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 first:pt-0 last:pb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-[var(--color-brand)]", children: "Is there a free plan?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]", children: "Yes. The Free plan includes one project, 10 daily keyword searches, and one site audit per month, enough to evaluate SeoTool.im before subscribing." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 first:pt-0 last:pb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-[var(--color-brand)]", children: "What happens when I hit my quota limit?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]", children: "You’ll see a friendly upgrade prompt when you try to use a feature that’s exceeded its quota. Your existing data is never lost. Just upgrade or wait for the next reset window." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 first:pt-0 last:pb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-[var(--color-brand)]", children: "Can I upgrade or downgrade anytime?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]", children: "Yes. Changes take effect immediately and your usage quotas reset to match the new plan. Billing is prorated through Stripe." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 first:pt-0 last:pb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-[var(--color-brand)]", children: "Do quotas reset?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]", children: "Daily quotas (keyword searches, backlink checks) reset every day at midnight UTC. Monthly quotas (audits, AI scans, content intelligence) reset at the start of each billing cycle." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 first:pt-0 last:pb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-[var(--color-brand)]", children: "Can I cancel anytime?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]", children: "Yes. Cancel from your billing page at any time. Your access continues through the end of the current billing period." })
        ] })
      ] })
    ] })
  ] });
}
function FeatureCell({
  value
}) {
  if (value === "unlimited") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--color-brand)]", children: "Unlimited" });
  }
  if (value === true) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "mx-auto text-[var(--color-success)]", "aria-label": "Included", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 6 9 17l-5-5" }) });
  }
  if (value === false || value === "—") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--color-brand-muted)]", children: "—" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value });
}
export {
  Pricing as component
};
