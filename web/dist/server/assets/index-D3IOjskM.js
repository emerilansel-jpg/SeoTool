import { jsxs, jsx } from "react/jsx-runtime";
import { m as Route, n as docsDescription, k as baseOptions } from "./router-DyJXM2Bq.js";
import { D as DocsLayout } from "./index-BAg9b1lx.js";
import { Link } from "@tanstack/react-router";
import "react";
import "../server.js";
import "node:async_hooks";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "fumadocs-mdx/runtime/vite";
import "./source.generated-bSvMrmdU.js";
import "react-dom";
import "zod";
function ContentIndex({
  eyebrow,
  title,
  description,
  emptyLabel,
  items,
  route
}) {
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-6 py-12 md:py-24", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-fd-muted-foreground", children: eyebrow }),
    /* @__PURE__ */ jsx("h1", { className: "mt-3 text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-2xl text-lg leading-8 text-fd-muted-foreground", children: description }),
    items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-10 text-fd-muted-foreground", children: emptyLabel }) : /* @__PURE__ */ jsx("div", { className: "mt-10 divide-y divide-fd-border border-y border-fd-border", children: items.map((item) => /* @__PURE__ */ jsxs(
      Link,
      {
        to: route,
        params: { _splat: item.slugs.join("/") },
        className: "group block py-6",
        children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary", children: item.title }),
          item.description ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-fd-muted-foreground", children: item.description }) : null
        ]
      },
      item.url
    )) })
  ] });
}
function DocsIndex() {
  const {
    pages,
    pageTree
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsx(DocsLayout, { tree: pageTree, ...baseOptions(), children: /* @__PURE__ */ jsx(ContentIndex, { eyebrow: "Docs", title: "SeoTool.im Docs", description: docsDescription, emptyLabel: "No docs yet. Check back soon.", items: pages, route: "/docs/$" }) });
}
export {
  DocsIndex as component
};
