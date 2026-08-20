import { jsxs, jsx } from "react/jsx-runtime";
import { D as DocsBody } from "./router-DyJXM2Bq.js";
const LIBRARY_PILLAR_PATH = "/library/keyword-research";
function LibrarySpokePage({
  title,
  description,
  crumb,
  children
}) {
  return /* @__PURE__ */ jsxs("article", { className: "mx-auto max-w-3xl text-neutral-900", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-10 border-b border-[var(--color-border-subtle)] pb-8", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-[var(--color-brand-muted)]", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: LIBRARY_PILLAR_PATH,
            className: "font-medium text-[var(--color-brand-accent)]",
            children: "Strategy Library"
          }
        ),
        " ",
        "/ ",
        /* @__PURE__ */ jsx("span", { children: crumb })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 text-4xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl", children: title }),
      description ? /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-2xl text-lg leading-8 text-[var(--color-brand-muted)]", children: description }) : null
    ] }),
    /* @__PURE__ */ jsx(DocsBody, { className: "min-w-0 text-neutral-800 [&_a]:!text-neutral-950 [&_h2]:!text-neutral-950 [&_h2_a]:!no-underline [&_h3]:!text-neutral-950 [&_h3_a]:!no-underline [&_li]:!text-neutral-700 [&_li_a]:font-medium [&_li_a]:underline [&_li_a]:decoration-[var(--color-brand-accent)] [&_li_a]:underline-offset-4 [&_li_a:hover]:!text-neutral-700 [&_p]:!text-neutral-700 [&_p_a]:font-medium [&_p_a]:underline [&_p_a]:decoration-[var(--color-brand-accent)] [&_p_a]:underline-offset-4 [&_p_a:hover]:!text-neutral-700 [&_strong]:!text-neutral-950", children }),
    /* @__PURE__ */ jsx(LibrarySpokeCta, {})
  ] });
}
function LibrarySpokeCta() {
  return /* @__PURE__ */ jsxs("section", { className: "mt-14 rounded-xl border border-[var(--color-border-subtle)] bg-white p-6", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold tracking-tight text-neutral-950", children: "Run every play in this guide" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: "SeoTool.im connects your Search Console and expands your seeds. Open source, free to try, no credit card." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "https://seotool.im/sign-up",
          className: "inline-flex h-10 items-center justify-center rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800",
          children: [
            "Start with SeoTool.im",
            /* @__PURE__ */ jsx("span", { className: "ml-2", "aria-hidden": "true", children: "→" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: LIBRARY_PILLAR_PATH,
          className: "inline-flex h-10 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] bg-white px-4 text-sm font-medium text-neutral-950 transition-colors hover:border-neutral-950",
          children: "Back to the Strategy Library"
        }
      )
    ] })
  ] });
}
export {
  LibrarySpokePage as L
};
