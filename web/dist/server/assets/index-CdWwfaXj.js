import { U as jsxRuntimeExports } from "./worker-entry-oZfJ_xJd.js";
import { L as Link, m as Route, n as docsDescription, k as baseOptions } from "./router-BKa9jbdh.js";
import { D as DocsLayout } from "./index-aAHTqzXB.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-BmNQsRmx.js";
function ContentIndex({
  eyebrow,
  title,
  description,
  emptyLabel,
  items,
  route
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-6 py-12 md:py-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-fd-muted-foreground", children: eyebrow }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-2xl text-lg leading-8 text-fd-muted-foreground", children: description }),
    items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-10 text-fd-muted-foreground", children: emptyLabel }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 divide-y divide-fd-border border-y border-fd-border", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: route,
        params: { _splat: item.slugs.join("/") },
        className: "group block py-6",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary", children: item.title }),
          item.description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-fd-muted-foreground", children: item.description }) : null
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DocsLayout, { tree: pageTree, ...baseOptions(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContentIndex, { eyebrow: "Docs", title: "SeoTool.im Docs", description: docsDescription, emptyLabel: "No docs yet. Check back soon.", items: pages, route: "/docs/$" }) });
}
export {
  DocsIndex as component
};
