import { U as jsxRuntimeExports } from "./worker-entry-oZfJ_xJd.js";
import { L as Link } from "./router-BKa9jbdh.js";
const navLinks = [
  { label: "Features", to: "/features" },
  { label: "Blog", to: "/blogs" },
  { label: "Docs", to: "/docs" },
  { label: "Pricing", to: "/pricing" }
];
function BlogLayout({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-[var(--color-surface)] text-neutral-950", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "shrink-0 text-base font-semibold text-neutral-950 transition-opacity hover:opacity-80",
          children: "SeoTool.im"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "nav",
        {
          "aria-label": "Blog navigation",
          className: "flex min-w-0 items-center justify-end gap-4 overflow-x-auto text-sm font-medium text-[var(--color-brand-muted)] sm:gap-6",
          children: [
            navLinks.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: link.to,
                className: `shrink-0 transition-colors hover:text-neutral-950 ${link.label === "Features" || link.label === "Pricing" ? "hidden sm:inline" : ""}`,
                activeProps: { className: "text-neutral-950" },
                children: link.label
              },
              link.to
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: "https://github.com/emerilansel-jpg/SeoTool",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "hidden shrink-0 transition-colors hover:text-neutral-950 sm:inline",
                children: "GitHub"
              }
            )
          ]
        }
      )
    ] }) }),
    children
  ] });
}
export {
  BlogLayout as B
};
