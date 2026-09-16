import { U as jsxRuntimeExports } from "./worker-entry-T7oaZFxD.js";
import { D as DocsBody } from "./router-nYHkPPcI.js";
const LIBRARY_PILLAR_PATH = "/library/keyword-research";
function LibrarySpokePage({
  crumb,
  title,
  description,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mx-auto max-w-4xl px-4 py-8 text-[var(--color-brand)] md:px-6 md:py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-10 border-b border-[var(--color-border-subtle)] pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-muted)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: LIBRARY_PILLAR_PATH,
            className: "font-semibold text-[var(--color-brand-accent)] hover:underline",
            children: "Strategy Library"
          }
        ),
        " ",
        "/ ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: crumb })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-brand)] md:text-5xl", children: title }),
      description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-2xl text-lg leading-8 text-[var(--color-brand-muted)]", children: description }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DocsBody, { className: "min-w-0 text-[var(--color-brand)] [&_a]:text-[var(--color-brand-accent)] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-[var(--color-brand)] [&_h2]:font-bold [&_h3]:text-[var(--color-brand)] [&_h3]:font-bold [&_li]:text-[var(--color-brand-muted)] [&_p]:text-[var(--color-brand-muted)] [&_strong]:text-[var(--color-brand)]", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LibrarySpokeCta, {})
  ] });
}
function LibrarySpokeCta() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-14 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold tracking-tight text-[var(--color-brand)]", children: "Run every play in this guide" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-brand-muted)]", children: "SeoTool.im connects your Search Console and expands your seeds. Open source, free to try, no credit card." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "https://seotool.im/sign-up",
          className: "inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-xs transition-all hover:brightness-110 active:scale-95",
          children: [
            "Start with SeoTool.im",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", "aria-hidden": "true", children: "→" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: LIBRARY_PILLAR_PATH,
          className: "inline-flex h-11 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-brand)] transition-all hover:border-[var(--color-brand-accent)]/50",
          children: "Back to the Strategy Library"
        }
      )
    ] })
  ] });
}
export {
  LibrarySpokePage as L
};
