import { r as reactExports } from "./worker-entry-KJBorVTL.js";
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
  "./best-open-source-seo-tools.md": () => import("./best-open-source-seo-tools-Du3trzrL.js"),
  "./dark-queries.md": () => import("./dark-queries-Dwhue98S.js"),
  "./seo-for-startups.md": () => import("./seo-for-startups-Ds_Ne7c5.js")
}));
const docs = create.doc("docs", "./content/docs", /* @__PURE__ */ Object.assign({
  "./mcp.md": () => import("./mcp-Dpp7s7ZU.js"),
  "./self-hosting/cloudflare.md": () => import("./cloudflare-BbieLYcJ.js"),
  "./self-hosting/docker.md": () => import("./docker-CT-9AwD-.js"),
  "./self-hosting/index.md": () => import("./index-CCJDQ0GF.js"),
  "./skills/competitive-landscape.mdx": () => import("./competitive-landscape-DTVcDwrJ.js"),
  "./skills/competitor-analysis.mdx": () => import("./competitor-analysis-BYK2RULc.js"),
  "./skills/index.md": () => import("./index-COOtfX42.js"),
  "./skills/keyword-clustering.mdx": () => import("./keyword-clustering-CYrdxXrO.js"),
  "./skills/keyword-research.mdx": () => import("./keyword-research-CrEZGhvJ.js"),
  "./skills/link-prospecting.mdx": () => import("./link-prospecting-aHoK34ec.js"),
  "./skills/seo-audit.mdx": () => import("./seo-audit-Bzf0Bmzn.js"),
  "./skills/seo-coach.mdx": () => import("./seo-coach-mYLSxwdE.js"),
  "./skills/seo-project-setup.mdx": () => import("./seo-project-setup-CnFTYL-O.js"),
  "./skills/setup.md": () => import("./setup-BGlgPwhE.js")
}));
const docsMeta = create.meta("docsMeta", "./content/docs", /* @__PURE__ */ Object.assign({
  "./meta.json": () => import("./meta-B9AedUf9.js").then((m) => m["default"]),
  "./self-hosting/meta.json": () => import("./meta-DAUk2lqW.js").then((m) => m["default"]),
  "./skills/meta.json": () => import("./meta-CBlMrVW3.js").then((m) => m["default"])
}));
create.doc("legal", "./content/legal", /* @__PURE__ */ Object.assign({
  "./cookie-policy.md": () => import("./cookie-policy-CeAtuxzJ.js"),
  "./dpa.md": () => import("./dpa-DB0eUtv1.js"),
  "./privacy.md": () => import("./privacy-9D0Hunue.js"),
  "./refund-policy.md": () => import("./refund-policy-xISXgVJF.js"),
  "./terms-and-conditions.md": () => import("./terms-and-conditions-DCcY0CuG.js")
}));
export {
  docsMeta as a,
  blog as b,
  createClientLoader as c,
  docs as d,
  fromConfigBase as f,
  normalizeUrl as n
};
