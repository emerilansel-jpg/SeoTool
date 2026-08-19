import { jsx, jsxs } from "react/jsx-runtime";
import { a9 as Route, aa as clientMdxLoader } from "./router-D7vvO90Q.js";
import { Link } from "@tanstack/react-router";
import { S as SiteFooter } from "./site-footer-BF0gXr8Q.js";
import { B as BlogLayout } from "./blog-layout-DiK53aB_.js";
import { Suspense } from "react";
import "../server.js";
import "node:async_hooks";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "fumadocs-mdx/runtime/vite";
import "./source.generated-bSvMrmdU.js";
import "react-dom";
import "zod";
function BlogPost() {
  const data = Route.useLoaderData();
  const Content = clientMdxLoader.getComponent(data.path);
  return /* @__PURE__ */ jsx(BlogLayout, { children: /* @__PURE__ */ jsxs("article", { className: "mx-auto max-w-3xl px-6 py-12 text-neutral-950 md:py-24", children: [
    /* @__PURE__ */ jsx(BlogHeader, { title: data.title, description: data.description }),
    /* @__PURE__ */ jsx(Suspense, { children: /* @__PURE__ */ jsx(Content, {}) }),
    /* @__PURE__ */ jsx("div", { className: "mt-16 border-t border-[var(--color-border-subtle)] pt-8", children: /* @__PURE__ */ jsx(SiteFooter, { className: "text-xs text-neutral-600 [&_a]:transition-colors [&_a]:hover:text-neutral-900" }) })
  ] }) });
}
function BlogHeader({
  title,
  description
}) {
  return /* @__PURE__ */ jsxs("header", { className: "mb-10 border-b border-[var(--color-border-subtle)] pb-8", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs(Link, { to: "/blogs", className: "inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-muted)] transition-colors hover:text-neutral-950", children: [
      /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "←" }),
      /* @__PURE__ */ jsx("span", { children: "Back to Blog" })
    ] }) }),
    /* @__PURE__ */ jsx("h1", { className: "mb-5 text-4xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-6xl", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "max-w-2xl text-lg leading-8 text-[var(--color-brand-muted)]", children: description })
  ] });
}
export {
  BlogPost as component
};
