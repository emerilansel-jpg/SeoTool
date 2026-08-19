import { fromConfig } from "fumadocs-mdx/runtime/vite";
function normalizeUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!url.startsWith("/")) url = "/" + url;
  if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
  return url;
}
const create = fromConfig();
const blog = create.doc("blog", "./content/blogs", /* @__PURE__ */ Object.assign({
  "./best-open-source-seo-tools.md": () => import("./best-open-source-seo-tools-CXCtPJka.js"),
  "./dark-queries.md": () => import("./dark-queries-DOcHYZP_.js"),
  "./seo-for-startups.md": () => import("./seo-for-startups-DOGBuceH.js")
}));
const docs = create.doc("docs", "./content/docs", /* @__PURE__ */ Object.assign({
  "./mcp.md": () => import("./mcp-DRCCpRQ6.js"),
  "./self-hosting/cloudflare.md": () => import("./cloudflare-D1oajJqF.js"),
  "./self-hosting/docker.md": () => import("./docker-MADm3Psv.js"),
  "./self-hosting/index.md": () => import("./index-C1pqhmrn.js"),
  "./skills/competitive-landscape.mdx": () => import("./competitive-landscape-DyIvavAg.js"),
  "./skills/competitor-analysis.mdx": () => import("./competitor-analysis-C8CF5mw6.js"),
  "./skills/index.md": () => import("./index-DdASBqB3.js"),
  "./skills/keyword-clustering.mdx": () => import("./keyword-clustering-Dh5K3_Zc.js"),
  "./skills/keyword-research.mdx": () => import("./keyword-research-9vQ6mjNN.js"),
  "./skills/link-prospecting.mdx": () => import("./link-prospecting-DFJnKoq6.js"),
  "./skills/seo-audit.mdx": () => import("./seo-audit-BD4hBiIh.js"),
  "./skills/seo-coach.mdx": () => import("./seo-coach-Lc8Vw86s.js"),
  "./skills/seo-project-setup.mdx": () => import("./seo-project-setup-DDJ37rUw.js"),
  "./skills/setup.md": () => import("./setup-DZS0IEXX.js")
}));
const docsMeta = create.meta("docsMeta", "./content/docs", /* @__PURE__ */ Object.assign({
  "./meta.json": () => import("./meta-B9AedUf9.js").then((m) => m["default"]),
  "./self-hosting/meta.json": () => import("./meta-DAUk2lqW.js").then((m) => m["default"]),
  "./skills/meta.json": () => import("./meta-CBlMrVW3.js").then((m) => m["default"])
}));
create.doc("legal", "./content/legal", /* @__PURE__ */ Object.assign({
  "./cookie-policy.md": () => import("./cookie-policy-DoI9F9fB.js"),
  "./dpa.md": () => import("./dpa-2mDWOxzF.js"),
  "./privacy.md": () => import("./privacy-N04IwuPQ.js"),
  "./refund-policy.md": () => import("./refund-policy-BfjIWAe1.js"),
  "./terms-and-conditions.md": () => import("./terms-and-conditions-k0SNbjoE.js")
}));
export {
  docsMeta as a,
  blog as b,
  docs as d,
  normalizeUrl as n
};
