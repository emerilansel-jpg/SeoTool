import { U as jsxRuntimeExports } from "./worker-entry-oZfJ_xJd.js";
import { l as featureGroups } from "./router-BKa9jbdh.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-BmNQsRmx.js";
function FeaturesIndex() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mx-auto max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[var(--color-brand-accent)]", children: "Open-source SEO tools" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[var(--color-brand)] md:text-6xl", children: "All the tools you need, in one workspace" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-2xl text-lg leading-8 text-[var(--color-brand-muted)]", children: "Research keywords, track rankings, audit sites, and understand your AI visibility from one modern platform." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 space-y-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-[var(--color-border-subtle)] pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-[var(--color-brand)]", children: "AI agent workflows" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: "Let supported MCP clients research keywords, SERPs, domains, backlinks, and first-party Search Console data through SeoTool.im." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(FeatureCard, { href: "/features/mcp", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-[var(--color-brand-accent)]", children: "SeoTool.im MCP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-lg font-semibold text-[var(--color-brand)]", children: "SeoTool.im MCP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-[var(--color-brand-muted)]", children: "Connect Claude, Codex, and other agents to SeoTool.im research tools." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-sm font-medium text-[var(--color-brand)]", children: [
              "Explore MCP ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "→" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(FeatureCard, { href: "/google-search-console-mcp", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-[var(--color-brand-accent)]", children: "Search Console MCP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-lg font-semibold text-[var(--color-brand)]", children: "Google Search Console MCP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-[var(--color-brand-muted)]", children: "Give agents access to clicks, impressions, CTR, position, and URL inspection." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-sm font-medium text-[var(--color-brand)]", children: [
              "Explore GSC MCP ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "→" })
            ] })
          ] })
        ] })
      ] }),
      featureGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-[var(--color-border-subtle)] pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-[var(--color-brand)]", children: group.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: group.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid gap-4 md:grid-cols-3", children: group.pages.map((page) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FeatureCard, { href: `/features/${page.slug}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-[var(--color-brand-accent)]", children: page.eyebrow }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-lg font-semibold text-[var(--color-brand)]", children: page.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-[var(--color-brand-muted)]", children: page.navDescription }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-sm font-medium text-[var(--color-brand)]", children: [
            "Explore feature ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "→" })
          ] })
        ] }, page.slug)) })
      ] }, group.label))
    ] })
  ] });
}
function FeatureCard({
  href,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href, className: "block rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-5 transition-colors hover:border-[var(--color-brand-accent)]", children });
}
export {
  FeaturesIndex as component
};
