import { jsx, jsxs } from "react/jsx-runtime";
import { ad as frontmatter, D as DocsBody, ae as MDXContent, d as defaultMdxComponents, af as SITE_URL, ag as toCanonicalUrl, ah as PATH } from "./router-DyJXM2Bq.js";
import "@tanstack/react-router";
import "react";
import "../server.js";
import "node:async_hooks";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "fumadocs-mdx/runtime/vite";
import "./source.generated-bSvMrmdU.js";
import "react-dom";
import "zod";
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
  return /* @__PURE__ */ jsx("div", { className: "not-prose my-8", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-[var(--color-border-subtle)] bg-white", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[680px] border-collapse text-left", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("td", { className: "w-[22%] p-4" }),
      COLUMNS.map((col) => /* @__PURE__ */ jsx(
        "th",
        {
          scope: "col",
          className: `p-4 align-bottom text-sm font-semibold ${col.highlight ? "border-x border-[var(--color-border-subtle)] bg-[#fbfaf8] text-neutral-950" : "text-neutral-900"}`,
          children: /* @__PURE__ */ jsx("span", { className: "block", children: col.name })
        },
        col.name
      ))
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: ROWS.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx(
        "th",
        {
          scope: "row",
          className: "border-t border-[var(--color-border-subtle)] p-4 align-top text-sm font-medium text-[var(--color-brand-muted)]",
          children: row.label
        }
      ),
      row.cells.map((cell, i) => {
        const highlight = COLUMNS[i]?.highlight;
        return /* @__PURE__ */ jsx(
          "td",
          {
            className: `border-t border-[var(--color-border-subtle)] p-4 align-top text-sm ${highlight ? "border-x border-[var(--color-border-subtle)] bg-[#fbfaf8]" : ""}`,
            children: /* @__PURE__ */ jsx(CellContent, { cell, highlight })
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
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: `mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center ${tone === "negative" ? "text-neutral-300" : "text-[var(--color-brand-accent)]"}`,
        children: /* @__PURE__ */ jsx(ToneIcon, { tone })
      }
    ),
    /* @__PURE__ */ jsx("span", { className: `leading-snug ${textClass}`, children: cell.code ? /* @__PURE__ */ jsx("code", { className: "rounded bg-[#ebe4da] px-1.5 py-0.5 font-mono text-[0.85em] text-neutral-800", children: cell.text }) : cell.text })
  ] });
}
function ToneIcon({ tone }) {
  if (tone === "positive") {
    return /* @__PURE__ */ jsx(
      "svg",
      {
        viewBox: "0 0 16 16",
        fill: "none",
        className: "h-4 w-4",
        "aria-hidden": "true",
        children: /* @__PURE__ */ jsx(
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
    return /* @__PURE__ */ jsx(
      "svg",
      {
        viewBox: "0 0 16 16",
        fill: "none",
        className: "h-4 w-4",
        "aria-hidden": "true",
        children: /* @__PURE__ */ jsx(
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
    price: "10.00",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "10.00",
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
  return /* @__PURE__ */ jsxs("article", { className: "mx-auto max-w-4xl text-neutral-900", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-10 border-b border-[var(--color-border-subtle)] pb-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[var(--color-brand-accent)]", children: "Search Console MCP" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 text-4xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-6xl", children: frontmatter.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-2xl text-lg leading-8 text-[var(--color-brand-muted)]", children: frontmatter.description }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: /* @__PURE__ */ jsxs("a", { href: "https://seotool.im/sign-up", className: "inline-flex h-10 items-center justify-center rounded-lg bg-neutral-950 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800", children: [
        "Get started",
        /* @__PURE__ */ jsx("span", { className: "ml-2", "aria-hidden": "true", children: "→" })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-neutral-500", children: "$10/month, 30-day money-back guarantee. Search Console tools never use credits." })
    ] }),
    /* @__PURE__ */ jsx(DocsBody, { className: "min-w-0 text-neutral-800 [&_a]:!text-neutral-950 [&_h2]:!text-neutral-950 [&_h2_a]:!no-underline [&_h3]:!text-neutral-950 [&_h3_a]:!no-underline [&_h4]:!text-neutral-950 [&_h4_a]:!no-underline [&_h5_a]:!no-underline [&_h6_a]:!no-underline [&_li]:!text-neutral-700 [&_li_a]:font-medium [&_li_a]:underline [&_li_a]:decoration-[var(--color-brand-accent)] [&_li_a]:underline-offset-4 [&_li_a:hover]:!text-neutral-700 [&_p]:!text-neutral-700 [&_p_a]:font-medium [&_p_a]:underline [&_p_a]:decoration-[var(--color-brand-accent)] [&_p_a]:underline-offset-4 [&_p_a:hover]:!text-neutral-700 [&_strong]:!text-neutral-950", children: /* @__PURE__ */ jsx(MDXContent, { components: {
      ...defaultMdxComponents,
      ComparisonTable
    } }) }),
    /* @__PURE__ */ jsx(GoogleSearchConsoleMcpCta, {}),
    /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs("section", { className: "mt-14 rounded-xl border border-[var(--color-border-subtle)] bg-white p-6", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold tracking-tight text-neutral-950", children: "Point your AI at your real search data" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: "No Google Cloud project. Zero credits to read your own data. Works with Claude, Codex, OpenClaw, OpenCode, and Gemini." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsxs("a", { href: "https://seotool.im/sign-up", className: "inline-flex h-10 items-center justify-center rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800", children: [
        "Get started",
        /* @__PURE__ */ jsx("span", { className: "ml-2", "aria-hidden": "true", children: "→" })
      ] }),
      /* @__PURE__ */ jsxs("a", { href: "https://github.com/emerilansel-jpg/SeoTool", target: "_blank", rel: "noopener noreferrer", className: "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-white px-4 text-sm font-medium text-neutral-950 transition-colors hover:border-neutral-950", children: [
        /* @__PURE__ */ jsx(GitHubIcon, {}),
        "Star on GitHub"
      ] })
    ] })
  ] });
}
function GitHubIcon() {
  return /* @__PURE__ */ jsx("svg", { "aria-hidden": "true", className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.66-.31-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.05.14 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z" }) });
}
export {
  GoogleSearchConsoleMcpPage as component
};
