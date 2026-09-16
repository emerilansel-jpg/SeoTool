import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry-T7oaZFxD.js";
import { ab as Route, ac as clientMdxLoader, L as Link } from "./router-nYHkPPcI.js";
import { B as BlogLayout } from "./blog-layout-CTpRq7Nj.js";
import { S as SiteFooter } from "./site-footer-CtZBk52r.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-CEEcLXFO.js";
function BlogPost() {
  const data = Route.useLoaderData();
  const Content = clientMdxLoader.getComponent(data.path);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BlogLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mx-auto max-w-3xl px-6 py-12 text-[var(--color-brand)] md:py-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BlogHeader, { title: data.title, description: data.description }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Content, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 border-t border-[var(--color-border-subtle)] pt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, { className: "text-xs text-[var(--color-brand-muted)] [&_a]:transition-colors [&_a]:hover:text-white" }) })
  ] }) });
}
function BlogHeader({
  title,
  description
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-10 border-b border-[var(--color-border-subtle)] pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/blogs", className: "inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-accent)] transition-colors hover:underline", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "←" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back to Blog" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-5 text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-brand)] md:text-5xl", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-2xl text-lg leading-relaxed text-[var(--color-brand-muted)]", children: description })
  ] });
}
export {
  BlogPost as component
};
