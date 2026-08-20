import { jsx, jsxs } from "react/jsx-runtime";
import { H as HomeLayout, D as DocsBody, k as baseOptions } from "./router-DyJXM2Bq.js";
import { S as SiteFooter } from "./site-footer-HPFr3ICO.js";
function LegalPage({ title, description, children }) {
  return /* @__PURE__ */ jsx(HomeLayout, { ...baseOptions(), children: /* @__PURE__ */ jsxs("article", { className: "mx-auto max-w-3xl bg-[var(--color-surface)] px-6 py-12 text-neutral-950 md:py-24", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-10 border-b border-[var(--color-border-subtle)] pb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-4 text-4xl font-semibold tracking-tight md:text-6xl", children: title }),
      description ? /* @__PURE__ */ jsx("p", { className: "text-lg leading-8 text-[var(--color-brand-muted)]", children: description }) : null
    ] }),
    /* @__PURE__ */ jsx(DocsBody, { className: "text-neutral-800 [&_a]:!text-neutral-950 [&_a]:underline [&_a]:decoration-[var(--color-brand-accent)] [&_a]:underline-offset-4 [&_h2]:text-neutral-950 [&_h3]:text-neutral-950 [&_li]:text-neutral-700 [&_p]:text-neutral-700 [&_strong]:text-neutral-950", children }),
    /* @__PURE__ */ jsx("div", { className: "mt-16 border-t border-[var(--color-border-subtle)] pt-8", children: /* @__PURE__ */ jsx(SiteFooter, { className: "text-xs text-neutral-600 [&_a]:transition-colors [&_a]:hover:text-neutral-900" }) })
  ] }) });
}
export {
  LegalPage as L
};
