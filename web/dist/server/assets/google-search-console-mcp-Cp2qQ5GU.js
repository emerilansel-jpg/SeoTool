import { U as jsxRuntimeExports } from "./worker-entry-BkbuqH8c.js";
import { af as frontmatter, D as DocsBody, ag as MDXContent, d as defaultMdxComponents, ah as SITE_URL, ai as toCanonicalUrl, aj as PATH } from "./router-D91S_c1u.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-dKsLJuOG.js";
const COLUMNS = [
  { name: "SeoTool.im", highlight: true },
  { name: "DIY open-source repos" },
  { name: "Data-pipeline tools" }
];
const ROWS = [
  {
    label: "Setup",
    cells: [
      { text: "Simple, guided onboarding", tone: "positive" },
      { text: "~30 min in the Google Cloud console" },
      { text: "Account + connector setup" }
    ]
  },
  {
    label: "Google Cloud project",
    cells: [
      { text: "Not needed", tone: "positive" },
      { text: "Required", tone: "negative" },
      { text: "Usually not needed", tone: "positive" }
    ]
  },
  {
    label: "Cost to run",
    cells: [
      {
        text: "Included in the $10/mo plan, zero credits (free to self-host)",
        tone: "positive"
      },
      { text: "Free (your time + your own quota)" },
      { text: "Paid or limited free tier", tone: "negative" }
    ]
  },
  {
    label: "Read-only and safe",
    cells: [
      { text: "webmasters.readonly", tone: "positive", code: true },
      { text: "Depends on the scopes you grant" },
      { text: "Varies" }
    ]
  },
  {
    label: "Built for SEO",
    cells: [
      {
        text: "Also does keyword, rank, and backlink research",
        tone: "positive"
      },
      { text: "Search Console only", tone: "negative" },
      { text: "Reporting and analytics focus" }
    ]
  },
  {
    label: "Self-host option",
    cells: [
      { text: "Yes", tone: "positive" },
      { text: "Yes", tone: "positive" },
      { text: "No", tone: "negative" }
    ]
  }
];
function ComparisonTable() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "not-prose my-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-[var(--color-border-subtle)] bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[680px] border-collapse text-left", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "w-[22%] p-4" }),
      COLUMNS.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "th",
        {
          scope: "col",
          className: `p-4 align-bottom text-sm font-semibold ${col.highlight ? "border-x border-[var(--color-border-subtle)] bg-[#fbfaf8] text-neutral-950" : "text-neutral-900"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block", children: col.name })
        },
        col.name
      ))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: ROWS.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "th",
        {
          scope: "row",
          className: "border-t border-[var(--color-border-subtle)] p-4 align-top text-sm font-medium text-[var(--color-brand-muted)]",
          children: row.label
        }
      ),
      row.cells.map((cell, i) => {
        const highlight = COLUMNS[i]?.highlight;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            className: `border-t border-[var(--color-border-subtle)] p-4 align-top text-sm ${highlight ? "border-x border-[var(--color-border-subtle)] bg-[#fbfaf8]" : ""}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CellContent, { cell, highlight })
          },
          COLUMNS[i]?.name ?? i
        );
      })
    ] }, row.label)) })
  ] }) }) });
}
function CellContent({ cell, highlight }) {
  const tone = cell.tone ?? "neutral";
  const textClass = tone === "negative" ? "text-neutral-400" : highlight && tone === "positive" ? "font-medium text-neutral-900" : "text-neutral-700";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center ${tone === "negative" ? "text-neutral-300" : "text-[var(--color-brand-accent)]"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToneIcon, { tone })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `leading-snug ${textClass}`, children: cell.code ? /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-[#ebe4da] px-1.5 py-0.5 font-mono text-[0.85em] text-neutral-800", children: cell.text }) : cell.text })
  ] });
}
function ToneIcon({ tone }) {
  if (tone === "positive") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        viewBox: "0 0 16 16",
        fill: "none",
        className: "h-4 w-4",
        "aria-hidden": "true",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: "M13.5 4.5 6.5 11.5 3 8",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      }
    );
  }
  if (tone === "negative") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        viewBox: "0 0 16 16",
        fill: "none",
        className: "h-4 w-4",
        "aria-hidden": "true",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: "M4 8h8",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round"
          }
        )
      }
    );
  }
  return null;
}
const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SeoTool.im Google Search Console MCP",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: toCanonicalUrl(PATH),
  description: frontmatter.description,
  offers: {
    "@type": "Offer",
    price: "29.00",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "29.00",
      priceCurrency: "USD",
      billingDuration: 1,
      unitCode: "MON"
    }
  },
  provider: {
    "@type": "Organization",
    name: "SeoTool.im",
    url: SITE_URL
  }
};
function GoogleSearchConsoleMcpPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mx-auto max-w-4xl px-4 py-8 text-[var(--color-brand)] md:px-6 md:py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-10 border-b border-[var(--color-border-subtle)] pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold tracking-wide text-[var(--color-brand-accent)]", children: "Search Console MCP" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-brand)] md:text-6xl", children: frontmatter.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-2xl text-lg leading-8 text-[var(--color-brand-muted)]", children: frontmatter.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://seotool.im/sign-up", className: "inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 active:scale-95", children: [
        "Get started",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", "aria-hidden": "true", children: "→" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-[var(--color-brand-muted)]", children: "Included with All Access membership, 30-day money-back guarantee. Search Console tools never use credits." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DocsBody, { className: "min-w-0 text-[var(--color-brand)] [&_a]:text-[var(--color-brand-accent)] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-[var(--color-brand)] [&_h2]:font-bold [&_h3]:text-[var(--color-brand)] [&_h3]:font-bold [&_li]:text-[var(--color-brand-muted)] [&_p]:text-[var(--color-brand-muted)] [&_strong]:text-[var(--color-brand)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MDXContent, { components: {
      ...defaultMdxComponents,
      ComparisonTable
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleSearchConsoleMcpCta, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "script",
      {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
          __html: JSON.stringify(softwareApplicationLd)
        }
      }
    )
  ] });
}
function GoogleSearchConsoleMcpCta() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-14 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold tracking-tight text-[var(--color-brand)]", children: "Point your AI at your real search data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-brand-muted)]", children: "No Google Cloud project. Zero credits to read your own data. Works with Claude, Codex, Cursor, and other MCP clients." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://seotool.im/sign-up", className: "inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 active:scale-95", children: [
        "Get started",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", "aria-hidden": "true", children: "→" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://github.com/emerilansel-jpg/SeoTool", target: "_blank", rel: "noopener noreferrer", className: "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-brand)] transition-all hover:border-[var(--color-brand-accent)]/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GitHubIcon, {}),
        "Star on GitHub"
      ] })
    ] })
  ] });
}
function GitHubIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { "aria-hidden": "true", width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" }) });
}
export {
  GoogleSearchConsoleMcpPage as component
};
