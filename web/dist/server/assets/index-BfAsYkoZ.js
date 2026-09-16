import { U as jsxRuntimeExports } from "./worker-entry-BkbuqH8c.js";
import { u as useScrollReveal } from "./use-scroll-reveal-AaebaREi.js";
import "./router-D91S_c1u.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-dKsLJuOG.js";
function revealDelay(index) {
  return {
    "--reveal-i": String(index)
  };
}
const TOOLS = [{
  name: "AI Visibility Checker",
  description: "See whether ChatGPT mentions your domain when buyers ask for recommendations. The check most SEO suites still do not have.",
  keyword: "ai visibility checker",
  live: true,
  href: "/free-tools/ai-visibility-checker",
  linkLabel: "Open the free check"
}, {
  name: "Website SEO Checker",
  description: "Crawl your site for technical issues, Core Web Vitals, and content flags, with a plain-language action list.",
  keyword: "website seo checker",
  live: false,
  href: "/features/site-audit",
  linkLabel: "See site audits"
}, {
  name: "Backlink Checker",
  description: "See who links to you, your anchor text profile, and which links look toxic enough to disavow.",
  keyword: "free backlink checker",
  live: false,
  href: "/features/backlink-checker",
  linkLabel: "See backlink data"
}, {
  name: "Keyword Rank Checker",
  description: "Track where you rank for the keywords that matter, across devices, with position history and trend charts.",
  keyword: "keyword rank checker",
  live: false,
  href: "/features/rank-tracking",
  linkLabel: "See rank tracking"
}, {
  name: "Keyword Difficulty Checker",
  description: "Score how hard a keyword is to win before you write a word, with volume and intent beside it.",
  keyword: "keyword difficulty checker",
  live: false,
  href: "/features/keyword-research",
  linkLabel: "See keyword research"
}, {
  name: "SERP Preview",
  description: "Inspect the live results page for any keyword: who ranks, which features appear, and where you sit.",
  keyword: "serp preview tool",
  live: false,
  href: "/features/rank-tracking",
  linkLabel: "See SERP data"
}, {
  name: "Sitemap Validator",
  description: "Check your sitemap for broken URLs, redirects, and blocked pages before crawlers waste your budget.",
  keyword: "sitemap validator",
  live: false,
  href: "/features/site-audit",
  linkLabel: "See technical SEO"
}];
function FreeToolsIndexPage() {
  useScrollReveal();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "itc", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "ft-hero", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "itc-container", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "itc-eyebrow", children: "Free tools" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "ft-hero-title", children: "Free SEO tools, no sign-up" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ft-hero-sub", children: "Real data from the same live engine that powers SeoTool.im. Start with the AI visibility checker, the one most suites still do not have." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ft-actions", style: {
        justifyContent: "center",
        marginTop: 28
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "itc-btn itc-btn-primary", href: "/free-tools/ai-visibility-checker", children: [
        "Check my AI visibility ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "itc-arrow", children: "→" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "itc-section", style: {
      paddingTop: 32
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "itc-container", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ft-grid", children: TOOLS.map((tool, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `itc-card itc-reveal ${tool.live ? "" : "is-soon"}`, style: revealDelay(index % 3), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ft-tool-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ft-tool-name", style: {
          marginTop: 0
        }, children: tool.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ft-status-chip ${tool.live ? "ft-status-live" : ""}`, children: tool.live ? "Live" : "Coming soon" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ft-tool-desc", children: tool.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ft-tool-kw", children: [
        "targets: ",
        tool.keyword
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "ft-tool-link", href: tool.href, children: [
        tool.linkLabel,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "→" })
      ] })
    ] }, tool.name)) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "itc-section", style: {
      paddingTop: 0
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "itc-container", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ft-cta itc-reveal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "itc-display-md", children: "Every tool, one workspace" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ft-hero-sub", style: {
        marginTop: 16
      }, children: "The free tools cover one question each. SeoTool.im answers all of them, every day, for every project." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ft-actions", style: {
        justifyContent: "center"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "itc-btn itc-btn-primary itc-btn-lg", href: "https://seotool.im/sign-up", children: [
          "Start free ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "itc-arrow", children: "→" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "itc-btn itc-btn-secondary itc-btn-lg", href: "/pricing", children: "See pricing" })
      ] })
    ] }) }) })
  ] });
}
export {
  FreeToolsIndexPage as component
};
