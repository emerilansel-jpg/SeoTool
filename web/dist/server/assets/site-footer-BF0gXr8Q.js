import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { l as featureGroups } from "./router-D7vvO90Q.js";
const featureLinks = featureGroups.flatMap(
  (group) => group.pages.map((page) => ({
    label: page.eyebrow,
    href: `/features/${page.slug}`
  }))
);
function SiteFooter({ className }) {
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsx(Link, { to: "/", className: "text-sm font-semibold text-[var(--color-brand)]", children: "SeoTool.im" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid grid-cols-2 gap-8 md:grid-cols-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "Features" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          featureLinks.map((link) => /* @__PURE__ */ jsx("a", { href: link.href, children: link.label }, link.href)),
          /* @__PURE__ */ jsx(Link, { to: "/features", children: "All features" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "AI agents" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx(Link, { to: "/features/mcp", children: "SeoTool.im MCP" }),
          /* @__PURE__ */ jsx(Link, { to: "/google-search-console-mcp", children: "Google Search Console MCP" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "Resources" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx(Link, { to: "/changelog", children: "Changelog" }),
          /* @__PURE__ */ jsx(Link, { to: "/open-source-seo", children: "Why Open Source?" }),
          /* @__PURE__ */ jsx(Link, { to: "/blogs", children: "Blog" }),
          /* @__PURE__ */ jsx("a", { href: "/docs", children: "Docs" }),
          /* @__PURE__ */ jsx("a", { href: "/docs/skills", children: "Skills" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "Free tools" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx(Link, { to: "/free-tools", children: "All free tools" }),
          /* @__PURE__ */ jsx(Link, { to: "/free-tools/ai-visibility-checker", children: "AI Visibility Checker" }),
          /* @__PURE__ */ jsx("a", { href: "/library/ai-search-geo", children: "AI Search Library" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "Company" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx(Link, { to: "/about", children: "About" }),
          /* @__PURE__ */ jsx(Link, { to: "/pricing", children: "Pricing" }),
          /* @__PURE__ */ jsx(Link, { to: "/contact", children: "Contact" }),
          /* @__PURE__ */ jsx(Link, { to: "/careers", children: "Careers" }),
          /* @__PURE__ */ jsx(Link, { to: "/affiliates", children: "Affiliates" }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://github.com/emerilansel-jpg/SeoTool",
              target: "_blank",
              rel: "noopener noreferrer",
              children: "GitHub"
            }
          ),
          /* @__PURE__ */ jsx(
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
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-[var(--color-brand)]", children: "Legal" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx(Link, { to: "/privacy", children: "Privacy Policy" }),
          /* @__PURE__ */ jsx(Link, { to: "/terms-and-conditions", children: "Terms of Service" }),
          /* @__PURE__ */ jsx(Link, { to: "/cookie-policy", children: "Cookie Policy" }),
          /* @__PURE__ */ jsx(Link, { to: "/refund-policy", children: "Refund Policy" }),
          /* @__PURE__ */ jsx(Link, { to: "/dpa", children: "Data Processing (DPA)" })
        ] })
      ] })
    ] })
  ] });
}
export {
  SiteFooter as S
};
