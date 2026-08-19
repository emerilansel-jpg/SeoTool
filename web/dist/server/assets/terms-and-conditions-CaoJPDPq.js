import { jsx } from "react/jsx-runtime";
import { f as frontmatter, M as MDXContent, d as defaultMdxComponents } from "./router-D7vvO90Q.js";
import { L as LegalPage } from "./legal-page-T-G8dfPV.js";
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
import "./site-footer-BF0gXr8Q.js";
function TermsAndConditions() {
  return /* @__PURE__ */ jsx(LegalPage, { title: frontmatter.title, description: frontmatter.description, children: /* @__PURE__ */ jsx(MDXContent, { components: defaultMdxComponents }) });
}
export {
  TermsAndConditions as component
};
