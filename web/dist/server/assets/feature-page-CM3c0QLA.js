import { U as jsxRuntimeExports } from "./worker-entry-KJBorVTL.js";
function FeaturePageTemplate({ page }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mx-auto max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[var(--color-brand-accent)]", children: page.eyebrow }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-6xl", children: page.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-lg leading-8 text-[var(--color-brand-muted)]", children: page.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "https://seotool.im/sign-up",
          className: "inline-flex h-11 items-center justify-center rounded-lg bg-neutral-950 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800",
          children: [
            "Try SeoTool.im",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "ml-2", children: "→" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureImage, { page }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "What you can do" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-5 grid gap-4 md:grid-cols-3", children: page.workflows.map((workflow, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "rounded-lg border border-[var(--color-border-subtle)] bg-white p-5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm tabular-nums text-[var(--color-brand-accent)]", children: String(index + 1).padStart(2, "0") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-base font-semibold text-neutral-950", children: workflow.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-[var(--color-brand-muted)]", children: workflow.description })
          ]
        },
        workflow.title
      )) })
    ] }),
    page.showMetrics ? /* @__PURE__ */ jsxRuntimeExports.jsx(MetricsSection, { page }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ListSection, { title: "Use cases", items: page.useCases }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ListSection, { title: "Why SeoTool.im", items: page.differentiators })
    ] }),
    page.guides ? /* @__PURE__ */ jsxRuntimeExports.jsx(GuidesSection, { guides: page.guides }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "Related features" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3 md:grid-cols-3", children: page.related.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: item.href,
          className: "rounded-lg border border-[var(--color-border-subtle)] bg-white p-4 text-sm font-medium text-neutral-950 transition-colors hover:border-neutral-900",
          children: [
            item.label,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                "aria-hidden": "true",
                className: "ml-1 text-[var(--color-brand-accent)]",
                children: "→"
              }
            )
          ]
        },
        item.href
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "FAQ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 divide-y divide-[var(--color-border-subtle)] rounded-lg border border-[var(--color-border-subtle)] bg-white", children: page.faqs.map((faq) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-neutral-900", children: faq.question }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm leading-6 text-[var(--color-brand-muted)]", children: faq.answer })
      ] }, faq.question)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12 rounded-xl border border-[var(--color-border-subtle)] bg-white p-6 md:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "Try SeoTool.im" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: "The open source alternative to bloated, expensive, legacy SEO tools." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "https://seotool.im/sign-up",
          className: "inline-flex h-10 items-center justify-center rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800",
          children: [
            "Try SeoTool.im",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "ml-2", children: "→" })
          ]
        }
      ) })
    ] })
  ] });
}
function FeatureImage({ page }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("figure", { className: "mt-10 rounded-xl border border-[var(--color-border-subtle)] bg-white p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: page.imageSrc,
        alt: page.imageAlt,
        width: 1600,
        height: 1e3,
        loading: "eager",
        decoding: "async",
        className: "aspect-[16/10] w-full rounded-lg border border-[#ebe4da] object-cover object-top"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("figcaption", { className: "px-1 pt-2 text-[11px] text-[var(--color-brand-muted)]", children: [
      page.eyebrow,
      " in SeoTool.im."
    ] })
  ] });
}
function MetricsSection({ page }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: "Data you can act on" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "mt-5 grid overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-white sm:grid-cols-2 md:grid-cols-4", children: page.metrics.map((metric, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: [
          "p-5",
          index > 0 && "border-t border-[var(--color-border-subtle)]",
          index % 2 === 1 && "sm:border-l sm:border-[var(--color-border-subtle)]",
          index > 1 && "sm:border-t",
          index > 0 && "md:border-l md:border-t-0 md:border-[var(--color-border-subtle)]"
        ].filter(Boolean).join(" "),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-[var(--color-brand-muted)]", children: metric.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm font-semibold text-neutral-950", children: metric.value })
        ]
      },
      metric.label
    )) })
  ] });
}
function GuidesSection({
  guides
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950", children: guides.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-[var(--color-brand-muted)]", children: guides.description }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid gap-4 md:grid-cols-2", children: guides.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "a",
      {
        href: item.href,
        className: "rounded-lg border border-[var(--color-border-subtle)] bg-white p-5 transition-colors hover:border-neutral-900",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-base font-semibold text-neutral-950", children: [
            item.label,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                "aria-hidden": "true",
                className: "ml-1 text-[var(--color-brand-accent)]",
                children: "→"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-[var(--color-brand-muted)]", children: item.description })
        ]
      },
      item.href
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "a",
      {
        href: guides.cta.href,
        className: "text-sm font-medium text-neutral-950 underline decoration-[var(--color-brand-accent)] underline-offset-4",
        children: [
          guides.cta.label,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "ml-1", children: "→" })
        ]
      }
    ) })
  ] });
}
function ListSection({ title, items }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-[var(--color-border-subtle)] bg-white p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold tracking-tight text-neutral-950", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-3", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2.5 text-sm text-neutral-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          "aria-hidden": "true",
          className: "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand-accent)]"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "leading-6", children: item })
    ] }, item)) })
  ] });
}
export {
  FeaturePageTemplate as F
};
