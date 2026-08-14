import { U as jsxRuntimeExports } from "./worker-entry-KJBorVTL.js";
import { L as Link, l as featureGroups } from "./router-DA_5cv_p.js";
const featureLinks = featureGroups.flatMap(
  (group) => group.pages.map((page) => ({
    label: page.eyebrow,
    href: `/features/${page.slug}`
  }))
);
function SiteFooter({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-sm font-semibold text-[var(--color-brand)]", children: "SeoTool.im" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-2 gap-8 md:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          featureLinks.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link.href, children: link.label }, link.href)),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/features", children: "All features" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "AI agents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/features/mcp", children: "SeoTool.im MCP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/google-search-console-mcp", children: "Google Search Console MCP" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "Resources" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/changelog", children: "Changelog" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/open-source-seo", children: "Why Open Source?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/blogs", children: "Blog" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs", children: "Docs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/skills", children: "Skills" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "Company" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/about", children: "About" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/pricing", children: "Pricing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contact", children: "Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/careers", children: "Careers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/affiliates", children: "Affiliates" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "https://github.com/emerilansel-jpg/SeoTool",
              target: "_blank",
              rel: "noopener noreferrer",
              children: "GitHub"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "https://discord.gg/c9uGs3cFXr",
              target: "_blank",
              rel: "noopener noreferrer",
              children: "Discord"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "Legal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", children: "Privacy Policy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms-and-conditions", children: "Terms of Service" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cookie-policy", children: "Cookie Policy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/refund-policy", children: "Refund Policy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dpa", children: "Data Processing (DPA)" })
        ] })
      ] })
    ] })
  ] });
}
export {
  SiteFooter as S
};
