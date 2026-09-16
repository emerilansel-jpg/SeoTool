import { U as jsxRuntimeExports } from "./worker-entry-BkbuqH8c.js";
import { o as Route, L as Link } from "./router-D91S_c1u.js";
import { B as BlogLayout } from "./blog-layout-ByO-6ol1.js";
import { S as SiteFooter } from "./site-footer-C2EVHRCO.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-dKsLJuOG.js";
function BlogIndex() {
  const posts = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BlogLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-12 md:py-20 text-[var(--color-brand)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold tracking-wide text-[var(--color-brand-accent)]", children: "Resources" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-extrabold tracking-tight text-[var(--color-brand)] md:text-6xl", children: "Blog" }),
    posts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-8 text-[var(--color-brand-muted)]", children: "No posts yet. Check back soon." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-6 md:grid-cols-2", children: posts.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/blogs/$", params: {
      _splat: post.slugs.join("/")
    }, className: "group block h-full rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-7 transition-all hover:border-[var(--color-brand-accent)]/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold tracking-tight text-[var(--color-brand)] transition-colors group-hover:text-[var(--color-brand-accent)]", children: post.title }),
      post.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-[var(--color-brand-muted)]", children: post.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-sm font-semibold text-[var(--color-brand-accent)]", children: [
        "Read post ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "→" })
      ] })
    ] }) }, post.url)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 border-t border-[var(--color-border-subtle)] pt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, { className: "text-xs text-[var(--color-brand-muted)] [&_a]:transition-colors [&_a]:hover:text-white" }) })
  ] }) });
}
export {
  BlogIndex as component
};
