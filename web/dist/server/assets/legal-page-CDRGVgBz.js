import { U as jsxRuntimeExports } from "./worker-entry-BkbuqH8c.js";
import { H as HomeLayout, D as DocsBody, k as baseOptions } from "./router-D91S_c1u.js";
import { S as SiteFooter } from "./site-footer-C2EVHRCO.js";
function LegalPage({ title, description, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(HomeLayout, { ...baseOptions(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mx-auto max-w-3xl px-6 py-12 text-[var(--color-brand)] md:py-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-10 border-b border-[var(--color-border-subtle)] pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-4xl font-extrabold tracking-tight text-[var(--color-brand)] md:text-5xl", children: title }),
      description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg leading-8 text-[var(--color-brand-muted)]", children: description }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DocsBody, { className: "text-[var(--color-brand)] [&_a]:text-[var(--color-brand-accent)] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-[var(--color-brand)] [&_h2]:font-bold [&_h3]:text-[var(--color-brand)] [&_h3]:font-bold [&_li]:text-[var(--color-brand-muted)] [&_p]:text-[var(--color-brand-muted)] [&_strong]:text-[var(--color-brand)]", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 border-t border-[var(--color-border-subtle)] pt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, { className: "text-xs text-[var(--color-brand-muted)] [&_a]:transition-colors [&_a]:hover:text-white" }) })
  ] }) });
}
export {
  LegalPage as L
};
