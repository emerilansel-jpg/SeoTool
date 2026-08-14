import { U as jsxRuntimeExports } from "./worker-entry-KJBorVTL.js";
import { o as Route, L as Link } from "./router-DA_5cv_p.js";
import { S as SiteFooter } from "./site-footer-DYW4481J.js";
import { B as BlogLayout } from "./blog-layout-C8zkhDOq.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-DIAsA55h.js";
function BlogIndex() {
  const posts = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BlogLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-12 md:py-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[var(--color-brand-accent)]", children: "Resources" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl", children: "Blog" }),
    posts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-8 text-[var(--color-brand-muted)]", children: "No posts yet. Check back soon." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-4 md:grid-cols-2", children: posts.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/blogs/$", params: {
      _splat: post.slugs.join("/")
    }, className: "group block h-full rounded-lg border border-[var(--color-border-subtle)] bg-white p-6 transition-colors hover:border-neutral-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950 transition-colors group-hover:text-[var(--color-brand-accent)]", children: post.title }),
      post.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-6 text-[var(--color-brand-muted)]", children: post.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-5 text-sm font-medium text-neutral-950", children: [
        "Read post ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "→" })
      ] })
    ] }) }, post.url)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 border-t border-[var(--color-border-subtle)] pt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, { className: "text-xs text-neutral-600 [&_a]:transition-colors [&_a]:hover:text-neutral-900" }) })
  ] }) });
}
export {
  BlogIndex as component
};
