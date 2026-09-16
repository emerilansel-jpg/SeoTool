import { r as reactExports } from "./worker-entry-CXs0aQPz.js";
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
  "./best-open-source-seo-tools.md": () => import("./best-open-source-seo-tools-DJqt6GuH.js"),
  "./dark-queries.md": () => import("./dark-queries-CBBz3Q3M.js"),
  "./seo-for-startups.md": () => import("./seo-for-startups-CQnKH6aT.js")
}));
const docs = create.doc("docs", "./content/docs", /* @__PURE__ */ Object.assign({
  "./mcp.md": () => import("./mcp-C1eZIUSo.js"),
  "./self-hosting/cloudflare.md": () => import("./cloudflare-D27dNr20.js"),
  "./self-hosting/docker.md": () => import("./docker-CE13wTgp.js"),
  "./self-hosting/index.md": () => import("./index-D1uaZM0J.js"),
  "./skills/competitive-landscape.mdx": () => import("./competitive-landscape-rmpJ9wcQ.js"),
  "./skills/competitor-analysis.mdx": () => import("./competitor-analysis-R_zKibFd.js"),
  "./skills/index.md": () => import("./index-XzKa1cEs.js"),
  "./skills/keyword-clustering.mdx": () => import("./keyword-clustering-CAI0TXm9.js"),
  "./skills/keyword-research.mdx": () => import("./keyword-research-CZma6feH.js"),
  "./skills/link-prospecting.mdx": () => import("./link-prospecting-DmWlsOjT.js"),
  "./skills/seo-audit.mdx": () => import("./seo-audit-Bhub155I.js"),
  "./skills/seo-coach.mdx": () => import("./seo-coach-BEU3KFsX.js"),
  "./skills/seo-project-setup.mdx": () => import("./seo-project-setup-CwaTCu4y.js"),
  "./skills/setup.md": () => import("./setup-C-S6TVkU.js")
}));
const docsMeta = create.meta("docsMeta", "./content/docs", /* @__PURE__ */ Object.assign({
  "./meta.json": () => import("./meta-B9AedUf9.js").then((m) => m["default"]),
  "./self-hosting/meta.json": () => import("./meta-DAUk2lqW.js").then((m) => m["default"]),
  "./skills/meta.json": () => import("./meta-CBlMrVW3.js").then((m) => m["default"])
}));
create.doc("legal", "./content/legal", /* @__PURE__ */ Object.assign({
  "./cookie-policy.md": () => import("./cookie-policy-DJaA_dd4.js"),
  "./dpa.md": () => import("./dpa-CU-c0UCJ.js"),
  "./privacy.md": () => import("./privacy-BQ1NQDcP.js"),
  "./refund-policy.md": () => import("./refund-policy-CN5yBb6Q.js"),
  "./terms-and-conditions.md": () => import("./terms-and-conditions-CSZfo8Kj.js")
}));
export {
  docsMeta as a,
  blog as b,
  createClientLoader as c,
  docs as d,
  fromConfigBase as f,
  normalizeUrl as n
};
