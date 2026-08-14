import { r as reactExports } from "./worker-entry-oZfJ_xJd.js";
function normalizeUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!url.startsWith("/")) url = "/" + url;
  if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
  return url;
}
function fromConfigBase() {
  function normalize(entries, base) {
    const out = {};
    for (const k in entries) {
      const mappedK = k.startsWith("./") ? k.slice(2) : k;
      if (base) Object.assign(entries[k], { base });
      out[mappedK] = entries[k];
    }
    return out;
  }
  return {
    doc(_, base, glob) {
      return normalize(glob, base);
    },
    meta(_, base, glob) {
      return normalize(glob, base);
    },
    docLazy(_, base, head, body) {
      return {
        base,
        head: normalize(head),
        body: normalize(body)
      };
    }
  };
}
var loaderStore = /* @__PURE__ */ new Map();
function createClientLoader(files, options) {
  const { id = "", component } = options;
  let renderer;
  const store = loaderStore.get(id) ?? {
    preloaded: /* @__PURE__ */ new Map()
  };
  loaderStore.set(id, store);
  function getRenderer() {
    if (renderer) return renderer;
    renderer = {};
    for (const k in files) {
      const OnDemand = reactExports.lazy(async () => {
        const loaded = await files[k]();
        return { default: (props) => component(loaded, props) };
      });
      renderer[k] = (props) => {
        const cached = store.preloaded.get(k);
        if (!cached) return reactExports.createElement(OnDemand, props);
        return component(cached, props);
      };
    }
    return renderer;
  }
  return {
    async preload(path) {
      const loaded = await files[path]();
      store.preloaded.set(path, loaded);
      return loaded;
    },
    getRenderer,
    getComponent(path) {
      return getRenderer()[path];
    }
  };
}
const create = fromConfigBase();
const blog = create.doc("blog", "./content/blogs", /* @__PURE__ */ Object.assign({
  "./best-open-source-seo-tools.md": () => import("./best-open-source-seo-tools-BCQv5hjX.js"),
  "./dark-queries.md": () => import("./dark-queries-BxKGd9PF.js"),
  "./seo-for-startups.md": () => import("./seo-for-startups-AvX9b-3S.js")
}));
const docs = create.doc("docs", "./content/docs", /* @__PURE__ */ Object.assign({
  "./mcp.md": () => import("./mcp-4a819FDL.js"),
  "./self-hosting/cloudflare.md": () => import("./cloudflare-WoA-x0Co.js"),
  "./self-hosting/docker.md": () => import("./docker-Bl8MONZv.js"),
  "./self-hosting/index.md": () => import("./index-D0pSshF_.js"),
  "./skills/competitive-landscape.mdx": () => import("./competitive-landscape-2GUoq2qE.js"),
  "./skills/competitor-analysis.mdx": () => import("./competitor-analysis-DDBFIZb1.js"),
  "./skills/index.md": () => import("./index-BMoS3cRo.js"),
  "./skills/keyword-clustering.mdx": () => import("./keyword-clustering-C_H75OzA.js"),
  "./skills/keyword-research.mdx": () => import("./keyword-research-CLhfU6E2.js"),
  "./skills/link-prospecting.mdx": () => import("./link-prospecting-BtFunbFE.js"),
  "./skills/seo-audit.mdx": () => import("./seo-audit-DkBRzdJK.js"),
  "./skills/seo-coach.mdx": () => import("./seo-coach-C4IwYbqr.js"),
  "./skills/seo-project-setup.mdx": () => import("./seo-project-setup-l41gE74p.js"),
  "./skills/setup.md": () => import("./setup-C6hY6vrg.js")
}));
const docsMeta = create.meta("docsMeta", "./content/docs", /* @__PURE__ */ Object.assign({
  "./meta.json": () => import("./meta-B9AedUf9.js").then((m) => m["default"]),
  "./self-hosting/meta.json": () => import("./meta-DAUk2lqW.js").then((m) => m["default"]),
  "./skills/meta.json": () => import("./meta-CBlMrVW3.js").then((m) => m["default"])
}));
create.doc("legal", "./content/legal", /* @__PURE__ */ Object.assign({
  "./cookie-policy.md": () => import("./cookie-policy-BGRXt5ah.js"),
  "./dpa.md": () => import("./dpa-gJhOYncv.js"),
  "./privacy.md": () => import("./privacy-BAWsBy7Y.js"),
  "./refund-policy.md": () => import("./refund-policy-Cm1jZHpq.js"),
  "./terms-and-conditions.md": () => import("./terms-and-conditions-B-JO36Yk.js")
}));
export {
  docsMeta as a,
  blog as b,
  createClientLoader as c,
  docs as d,
  fromConfigBase as f,
  normalizeUrl as n
};
