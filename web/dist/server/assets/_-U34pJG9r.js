import { U as jsxRuntimeExports } from "./worker-entry-KJBorVTL.js";
import { p as Route, q as clientMdxLoader, C as ContentPost, k as baseOptions } from "./router-DA_5cv_p.js";
import { D as DocsLayout } from "./index-Cdx9fIkl.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-DIAsA55h.js";
function DocsPost() {
  const data = Route.useLoaderData();
  const Content = clientMdxLoader.getComponent(data.path);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DocsLayout, { tree: data.pageTree, ...baseOptions(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContentPost, { backLabel: "Back to Docs", backTo: "/docs", title: data.title, description: data.description, Content }) });
}
export {
  DocsPost as component
};
