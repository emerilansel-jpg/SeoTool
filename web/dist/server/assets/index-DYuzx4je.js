import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { S as SiteFooter } from "./site-footer-HPFr3ICO.js";
import { B as BlogLayout } from "./blog-layout-DiK53aB_.js";
import { o as Route } from "./router-DyJXM2Bq.js";
import "react";
import "../server.js";
import "node:async_hooks";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "fumadocs-mdx/runtime/vite";
import "./source.generated-bSvMrmdU.js";
import "react-dom";
import "zod";
function BlogIndex() {
  const posts = Route.useLoaderData();
  return /* @__PURE__ */ jsx(BlogLayout, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-6 py-12 md:py-24", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[var(--color-brand-accent)]", children: "Resources" }),
    /* @__PURE__ */ jsx("h1", { className: "mt-3 text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl", children: "Blog" }),
    posts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-8 text-[var(--color-brand-muted)]", children: "No posts yet. Check back soon." }) : /* @__PURE__ */ jsx("div", { className: "mt-10 grid gap-4 md:grid-cols-2", children: posts.map((post) => /* @__PURE__ */ jsx("article", { children: /* @__PURE__ */ jsxs(Link, { to: "/blogs/$", params: {
      _splat: post.slugs.join("/")
    }, className: "group block h-full rounded-lg border border-[var(--color-border-subtle)] bg-white p-6 transition-colors hover:border-neutral-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold tracking-tight text-neutral-950 transition-colors group-hover:text-[var(--color-brand-accent)]", children: post.title }),
      post.description && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-[var(--color-brand-muted)]", children: post.description }),
      /* @__PURE__ */ jsxs("p", { className: "mt-5 text-sm font-medium text-neutral-950", children: [
        "Read post ",
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "→" })
      ] })
    ] }) }, post.url)) }),
    /* @__PURE__ */ jsx("div", { className: "mt-16 border-t border-[var(--color-border-subtle)] pt-8", children: /* @__PURE__ */ jsx(SiteFooter, { className: "text-xs text-neutral-600 [&_a]:transition-colors [&_a]:hover:text-neutral-900" }) })
  ] }) });
}
export {
  BlogIndex as component
};
