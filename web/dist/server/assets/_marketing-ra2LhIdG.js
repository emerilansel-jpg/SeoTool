import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useLocation, Link, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { N as NewsletterSignup } from "./newsletter-signup-BVQPyD8y.js";
import { S as SiteFooter } from "./site-footer-HPFr3ICO.js";
import { R as Route, l as featureGroups } from "./router-DyJXM2Bq.js";
import "../server.js";
import "node:async_hooks";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "fumadocs-mdx/runtime/vite";
import "./source.generated-bSvMrmdU.js";
import "react-dom";
import "zod";
const PRODUCT_HUNT_URL = "https://www.producthunt.com/products/seotool-im";
function getMobileNavItems(githubStarCount) {
  return [{
    label: "Product",
    links: [{
      label: "Features",
      href: "/features"
    }, {
      label: "Free Tools",
      href: "/free-tools"
    }, {
      label: "Pricing",
      href: "/pricing"
    }]
  }, {
    label: "Resources",
    links: [{
      label: "Blog",
      href: "/blogs"
    }, {
      label: "Docs",
      href: "/docs"
    }, {
      label: "MCP Setup",
      href: "/docs/mcp"
    }, {
      label: "Skills",
      href: "/docs/skills"
    }]
  }, {
    label: "Community",
    links: [{
      label: `GitHub ${githubStarCount}`,
      href: "https://github.com/emerilansel-jpg/SeoTool"
    }]
  }];
}
function GitHubIcon({
  size = 18
}) {
  return /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" }) });
}
function MenuIcon({
  size = 28
}) {
  return /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { d: "M4 7h16" }),
    /* @__PURE__ */ jsx("path", { d: "M4 12h16" }),
    /* @__PURE__ */ jsx("path", { d: "M4 17h16" })
  ] });
}
function CloseIcon({
  size = 28
}) {
  return /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { d: "M6 6l12 12" }),
    /* @__PURE__ */ jsx("path", { d: "M18 6L6 18" })
  ] });
}
function MarketingLayout() {
  const {
    githubStarCount
  } = Route.useLoaderData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    pathname
  } = useLocation();
  const mobileNavItems = getMobileNavItems(githubStarCount);
  const isHome = pathname === "/";
  const isFreeTools = pathname.startsWith("/free-tools");
  useEffect(() => {
    if (!isHome) return;
    const root = document.documentElement;
    const prevRoot = root.style.backgroundColor;
    const prevBody = document.body.style.backgroundColor;
    root.style.backgroundColor = "#0a0b14";
    document.body.style.backgroundColor = "#0a0b14";
    return () => {
      root.style.backgroundColor = prevRoot;
      document.body.style.backgroundColor = prevBody;
    };
  }, [isHome]);
  return /* @__PURE__ */ jsxs("main", { className: "min-h-screen bg-[var(--color-surface)] text-[var(--color-brand)]", children: [
    isHome ? /* @__PURE__ */ jsxs("a", { href: PRODUCT_HUNT_URL, target: "_blank", rel: "noopener noreferrer", className: "group flex min-h-11 items-center justify-center gap-2 border-b border-[var(--color-border-subtle)] bg-[#0d0e18] px-4 py-2.5 text-center text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[#12141f] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-brand-accent)]", "aria-label": "SeoTool.im just launched on Product Hunt. Upvote and comment.", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white p-0.5", children: /* @__PURE__ */ jsx("img", { src: "/product-hunt.svg", alt: "", className: "size-full" }) }),
      /* @__PURE__ */ jsx("span", { children: "SeoTool.im just launched on Product Hunt." }),
      /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 whitespace-nowrap underline decoration-[var(--color-brand-accent)]/60 underline-offset-4 group-hover:decoration-[var(--color-brand-accent)]", children: [
        "Upvote & comment ",
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "→" })
      ] })
    ] }) : null,
    /* @__PURE__ */ jsx("div", { className: "relative z-50 mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 md:pt-8", children: /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-5xl", children: [
      /* @__PURE__ */ jsxs("nav", { className: "grid min-h-14 grid-cols-[1fr_auto] items-center gap-3 rounded-full border border-[var(--color-border-subtle)] bg-[#0a0b14]/80 px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur-xl md:grid-cols-[1fr_auto_1fr] md:px-5", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", className: "text-sm font-semibold hover:opacity-80 transition-opacity", children: "SeoTool.im" }),
        /* @__PURE__ */ jsxs("div", { className: "hidden items-center justify-center gap-5 md:flex", children: [
          /* @__PURE__ */ jsx(FeatureDropdown, {}),
          /* @__PURE__ */ jsx(Link, { to: "/free-tools", className: "text-sm font-semibold text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand)]", children: "Free Tools" }),
          /* @__PURE__ */ jsx(ResourcesDropdown, {}),
          /* @__PURE__ */ jsx(Link, { to: "/pricing", className: "text-sm font-semibold text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand)]", children: "Pricing" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 sm:gap-3", children: [
          /* @__PURE__ */ jsx("button", { type: "button", "aria-label": mobileMenuOpen ? "Close menu" : "Open menu", "aria-expanded": mobileMenuOpen, onClick: () => setMobileMenuOpen((open) => !open), className: "inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-brand)] transition-colors hover:bg-[var(--color-surface-raised)] md:hidden", children: mobileMenuOpen ? /* @__PURE__ */ jsx(CloseIcon, {}) : /* @__PURE__ */ jsx(MenuIcon, {}) }),
          /* @__PURE__ */ jsxs("a", { href: "https://github.com/emerilansel-jpg/SeoTool", target: "_blank", rel: "noopener noreferrer", "aria-label": `GitHub, ${githubStarCount} stars`, className: "hidden h-9 items-center gap-1.5 px-2 text-sm font-semibold text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand)] md:inline-flex", children: [
            /* @__PURE__ */ jsx(GitHubIcon, { size: 16 }),
            /* @__PURE__ */ jsx("span", { children: "GitHub" }),
            /* @__PURE__ */ jsx("span", { className: "text-[var(--color-brand-muted)]", children: githubStarCount })
          ] }),
          /* @__PURE__ */ jsx("a", { href: "https://seotool.im/sign-in", className: "hidden h-9 items-center rounded-full border border-[var(--color-border-subtle)] px-4 text-sm font-medium text-[var(--color-brand)] transition-colors hover:border-[var(--color-brand-accent)] md:inline-flex", children: "Sign in" })
        ] })
      ] }),
      mobileMenuOpen ? /* @__PURE__ */ jsxs("div", { className: "absolute left-0 right-0 top-full z-30 mt-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-3 shadow-xl shadow-black/30 md:hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx("a", { href: "https://seotool.im/sign-in", onClick: () => setMobileMenuOpen(false), className: "flex h-11 items-center justify-center rounded-xl bg-[var(--color-cta)] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#ff6a1f]", children: "Try SeoTool.im" }),
          /* @__PURE__ */ jsx("a", { href: "https://seotool.im/sign-in", onClick: () => setMobileMenuOpen(false), className: "flex h-11 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] px-3 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:border-[var(--color-brand-accent)] hover:bg-[var(--color-surface-raised)]", children: "Sign in" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-3", children: mobileNavItems.map((section) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "px-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-muted)]", children: section.label }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 space-y-1", children: section.links.map((item) => /* @__PURE__ */ jsx("a", { href: item.href, onClick: () => setMobileMenuOpen(false), className: "flex min-h-10 items-center rounded-xl px-2 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-brand)]", children: item.label }, item.href)) })
        ] }, section.label)) })
      ] }) : null
    ] }) }),
    isHome || isFreeTools ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      isFreeTools ? /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-5xl px-6 pb-16", children: /* @__PURE__ */ jsx(MarketingFooter, {}) }) : null
    ] }) : /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-6 py-16 md:py-24", children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(MarketingFooter, {})
    ] })
  ] });
}
function ResourcesDropdown() {
  const resources = [{
    label: "Blog",
    href: "/blogs",
    description: "SEO articles and guides."
  }, {
    label: "Docs",
    href: "/docs",
    description: "Setup, MCP, skills, and self-hosting guides."
  }, {
    label: "MCP",
    href: "/docs/mcp",
    description: "Connect SeoTool.im to AI clients."
  }, {
    label: "Skills",
    href: "/docs/skills",
    description: "Focused SeoTool.im workflows."
  }];
  return /* @__PURE__ */ jsxs("div", { className: "group relative", children: [
    /* @__PURE__ */ jsx("a", { href: "/blogs", className: "text-sm font-semibold text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand)] md:hidden", children: "Resources" }),
    /* @__PURE__ */ jsx("button", { type: "button", className: "hidden h-10 items-center text-sm font-semibold text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand)] md:inline-flex", children: "Resources" }),
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute left-1/2 top-[calc(100%-2px)] z-20 hidden w-[280px] -translate-x-1/2 pt-2 opacity-0 transition md:block group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100", children: /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-3 shadow-xl shadow-black/30", children: resources.map((resource) => /* @__PURE__ */ jsxs("a", { href: resource.href, className: "block rounded-md px-3 py-2.5 transition-colors hover:bg-[var(--color-surface-raised)]", children: [
      /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-[var(--color-brand)]", children: resource.label }),
      /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs leading-relaxed text-[var(--color-brand-muted)]", children: resource.description })
    ] }, resource.href)) }) })
  ] });
}
function FeatureDropdown() {
  return /* @__PURE__ */ jsxs("div", { className: "group relative", children: [
    /* @__PURE__ */ jsx(Link, { to: "/features", className: "text-sm font-semibold text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand)] md:hidden", children: "Features" }),
    /* @__PURE__ */ jsx("button", { type: "button", className: "hidden h-10 items-center text-sm font-semibold text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand)] md:inline-flex", children: "Features" }),
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute left-1/2 top-[calc(100%-2px)] z-20 hidden w-[560px] -translate-x-1/2 pt-2 opacity-0 transition md:block group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100", children: /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-5 shadow-xl shadow-black/30", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-6", children: [
      featureGroups.map((group) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-muted)]", children: group.label }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-1", children: group.pages.map((page) => /* @__PURE__ */ jsxs("a", { href: `/features/${page.slug}`, className: "block rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--color-surface-raised)]", children: [
          /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-[var(--color-brand)]", children: page.eyebrow }),
          /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs leading-relaxed text-[var(--color-brand-muted)]", children: page.navDescription })
        ] }, page.slug)) })
      ] }, group.label)),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-muted)]", children: "AI agents" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2", children: [
          /* @__PURE__ */ jsxs("a", { href: "/features/mcp", className: "block rounded-md p-2 transition-colors hover:bg-[var(--color-surface-raised)]", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-[var(--color-brand)]", children: "SeoTool.im MCP" }),
            /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs leading-relaxed text-[var(--color-brand-muted)]", children: "Connect Claude, Codex, and agents." })
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "/google-search-console-mcp", className: "block rounded-md p-2 transition-colors hover:bg-[var(--color-surface-raised)]", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-[var(--color-brand)]", children: "Search Console MCP" }),
            /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs leading-relaxed text-[var(--color-brand-muted)]", children: "Search Console data for agents." })
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "/features", className: "block rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-sm font-medium text-[var(--color-brand)] transition-colors hover:border-[var(--color-brand-accent)]", children: [
            "View all features ",
            /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "→" })
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
function MarketingFooter() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mt-16 border-t border-[var(--color-border-subtle)] pt-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[var(--color-brand)]", children: "Stay in the loop" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-brand-muted)] mt-1 leading-relaxed", children: "Product updates, new features, and the occasional behind-the-scenes." }),
      /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(NewsletterSignup, {}) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(SiteFooter, { className: "text-xs text-[var(--color-brand-muted)] [&_a]:transition-colors [&_a]:hover:text-[var(--color-brand)]" }) })
  ] });
}
export {
  MarketingLayout as component
};
