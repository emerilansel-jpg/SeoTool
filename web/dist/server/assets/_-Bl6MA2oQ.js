import { jsx } from "react/jsx-runtime";
import { p as Route, q as clientMdxLoader, C as ContentPost, k as baseOptions } from "./router-DyJXM2Bq.js";
import { D as DocsLayout } from "./index-BAg9b1lx.js";
import "@tanstack/react-router";
import "react";
import "../server.js";
import "node:async_hooks";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "fumadocs-mdx/runtime/vite";
import "./source.generated-bSvMrmdU.js";
import "react-dom";
import "zod";
function DocsPost() {
  const data = Route.useLoaderData();
  const Content = clientMdxLoader.getComponent(data.path);
  return /* @__PURE__ */ jsx(DocsLayout, { tree: data.pageTree, ...baseOptions(), children: /* @__PURE__ */ jsx(ContentPost, { backLabel: "Back to Docs", backTo: "/docs", title: data.title, description: data.description, Content }) });
}
export {
  DocsPost as component
};
