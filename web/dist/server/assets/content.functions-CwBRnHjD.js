import { c as createServerRpc } from "./createServerRpc-D_-6bKnO.js";
import { notFound } from "@tanstack/react-router";
import { _ as __export } from "./chunk-U67V476Y-BSLiKPOf.js";
import { n as normalizeUrl, b as blog, d as docs, a as docsMeta } from "./source.generated-bSvMrmdU.js";
import "react";
import * as path from "path";
import { c as createServerFn } from "../server.js";
import "fumadocs-mdx/runtime/vite";
import "node:async_hooks";
import "srvx";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
function iconPlugin(resolveIcon) {
  function replaceIcon(node) {
    if (node.icon === void 0 || typeof node.icon === "string")
      node.icon = resolveIcon(node.icon);
    return node;
  }
  return {
    name: "fumadocs:icon",
    transformPageTree: {
      file: replaceIcon,
      folder: replaceIcon,
      separator: replaceIcon
    }
  };
}
var path_exports = {};
__export(path_exports, {
  basename: () => basename,
  dirname: () => dirname,
  extname: () => extname,
  joinPath: () => joinPath,
  parseFilePath: () => parseFilePath,
  slash: () => slash,
  splitPath: () => splitPath
});
function basename(path2, ext) {
  const idx = path2.lastIndexOf("/");
  return path2.substring(
    idx === -1 ? 0 : idx + 1,
    ext ? path2.length - ext.length : path2.length
  );
}
function extname(path2) {
  const dotIdx = path2.lastIndexOf(".");
  if (dotIdx !== -1) {
    return path2.substring(dotIdx);
  }
  return "";
}
function dirname(path2) {
  return path2.split("/").slice(0, -1).join("/");
}
function parseFilePath(path2) {
  const ext = extname(path2);
  const name = basename(path2, ext);
  const dir = dirname(path2);
  return {
    dirname: dir,
    name,
    ext,
    path: path2,
    get flattenedPath() {
      return [dir, name].filter((p) => p.length > 0).join("/");
    }
  };
}
function splitPath(path2) {
  return path2.split("/").filter((p) => p.length > 0);
}
function joinPath(...paths) {
  const out = [];
  const parsed = paths.flatMap(splitPath);
  for (const seg of parsed) {
    switch (seg) {
      case "..":
        out.pop();
        break;
      case ".":
        break;
      default:
        out.push(seg);
    }
  }
  return out.join("/");
}
function slash(path2) {
  const isExtendedLengthPath = path2.startsWith("\\\\?\\");
  if (isExtendedLengthPath) {
    return path2;
  }
  return path2.replaceAll("\\", "/");
}
function transformerFallback() {
  const addedFiles = /* @__PURE__ */ new Set();
  return {
    root(root) {
      const isolatedStorage = new FileSystem();
      for (const file of this.storage.getFiles()) {
        if (addedFiles.has(file)) continue;
        const content = this.storage.read(file);
        if (content) isolatedStorage.write(file, content);
      }
      if (isolatedStorage.getFiles().length === 0) return root;
      root.fallback = this.builder.build(isolatedStorage, {
        ...this.options,
        id: `fallback-${root.$id ?? ""}`,
        generateFallback: false
      });
      addedFiles.clear();
      return root;
    },
    file(node, file) {
      if (file) addedFiles.add(file);
      return node;
    },
    folder(node, _dir, metaPath) {
      if (metaPath) addedFiles.add(metaPath);
      return node;
    }
  };
}
var group = /^\((?<name>.+)\)$/;
var link = /^(?:\[(?<icon>[^\]]+)])?\[(?<name>[^\]]+)]\((?<url>[^)]+)\)$/;
var separator = /^---(?:\[(?<icon>[^\]]+)])?(?<name>.+)---|^---$/;
var rest = "...";
var restReversed = "z...a";
var extractPrefix = "...";
var excludePrefix = "!";
function buildAll(paths, ctx, reversed = false) {
  const items = [];
  const folders = [];
  const sortedPaths = paths.sort(
    (a, b) => a.localeCompare(b) * (reversed ? -1 : 1)
  );
  for (const path2 of sortedPaths) {
    ctx.visitedPaths.add(path2);
    const fileNode = buildFileNode(path2, ctx);
    if (fileNode) {
      if (basename(path2, extname(path2)) === "index") items.unshift(fileNode);
      else items.push(fileNode);
      continue;
    }
    const dirNode = buildFolderNode(path2, false, ctx);
    if (dirNode) folders.push(dirNode);
  }
  return [...items, ...folders];
}
function resolveFolderItem(folderPath, item, ctx, idx) {
  if (item === rest || item === restReversed) return item;
  const { resolveName } = ctx;
  let match = separator.exec(item);
  if (match?.groups) {
    let node = {
      $id: `${folderPath}#${idx}`,
      type: "separator",
      icon: match.groups.icon,
      name: match.groups.name
    };
    for (const transformer of ctx.transformers) {
      if (!transformer.separator) continue;
      node = transformer.separator.call(ctx, node);
    }
    return [node];
  }
  match = link.exec(item);
  if (match?.groups) {
    const { icon, url, name } = match.groups;
    const isRelative = url.startsWith("/") || url.startsWith("#") || url.startsWith(".");
    let node = {
      type: "page",
      icon,
      name,
      url,
      external: !isRelative
    };
    for (const transformer of ctx.transformers) {
      if (!transformer.file) continue;
      node = transformer.file.call(ctx, node);
    }
    return [node];
  }
  const isExcept = item.startsWith(excludePrefix);
  const isExtract = !isExcept && item.startsWith(extractPrefix);
  let filename = item;
  if (isExcept) {
    filename = item.slice(excludePrefix.length);
  } else if (isExtract) {
    filename = item.slice(extractPrefix.length);
  }
  const path2 = resolveName(joinPath(folderPath, filename), "page");
  ctx.visitedPaths.add(path2);
  if (isExcept) return [];
  const dirNode = buildFolderNode(path2, false, ctx);
  if (dirNode) {
    return isExtract ? dirNode.children : [dirNode];
  }
  const fileNode = buildFileNode(path2, ctx);
  return fileNode ? [fileNode] : [];
}
function buildFolderNode(folderPath, isGlobalRoot, ctx) {
  const { storage, options, resolveName, transformers } = ctx;
  const files = storage.readDir(folderPath);
  if (!files) return;
  const metaPath = resolveName(joinPath(folderPath, "meta"), "meta");
  const indexPath = resolveName(joinPath(folderPath, "index"), "page");
  let meta = storage.read(metaPath);
  if (meta?.format !== "meta") {
    meta = void 0;
  }
  const isRoot = meta?.data.root ?? isGlobalRoot;
  let index;
  let children;
  function setIndexIfUnused() {
    if (isRoot || ctx.visitedPaths.has(indexPath)) return;
    ctx.visitedPaths.add(indexPath);
    index = buildFileNode(indexPath, ctx);
  }
  if (meta && meta.data.pages) {
    const resolved = meta.data.pages.flatMap((item, i) => resolveFolderItem(folderPath, item, ctx, i));
    setIndexIfUnused();
    for (let i = 0; i < resolved.length; i++) {
      const item = resolved[i];
      if (item !== rest && item !== restReversed) continue;
      const items = buildAll(
        files.filter((file) => !ctx.visitedPaths.has(file)),
        ctx,
        item === restReversed
      );
      resolved.splice(i, 1, ...items);
      break;
    }
    children = resolved;
  } else {
    setIndexIfUnused();
    children = buildAll(
      files.filter((file) => !ctx.visitedPaths.has(file)),
      ctx
    );
  }
  let name = meta?.data.title ?? index?.name;
  if (!name) {
    const folderName = basename(folderPath);
    name = pathToName(group.exec(folderName)?.[1] ?? folderName);
  }
  let node = {
    type: "folder",
    name,
    icon: meta?.data.icon ?? index?.icon,
    root: meta?.data.root,
    defaultOpen: meta?.data.defaultOpen,
    description: meta?.data.description,
    index,
    children,
    $id: folderPath,
    $ref: !options.noRef && meta ? {
      metaFile: metaPath
    } : void 0
  };
  for (const transformer of transformers) {
    if (!transformer.folder) continue;
    node = transformer.folder.call(ctx, node, folderPath, metaPath);
  }
  return node;
}
function buildFileNode(path2, ctx) {
  const { options, getUrl, storage, locale, transformers } = ctx;
  const page = storage.read(path2);
  if (page?.format !== "page") return;
  const { title, description, icon } = page.data;
  let item = {
    $id: path2,
    type: "page",
    name: title ?? pathToName(basename(path2, extname(path2))),
    description,
    icon,
    url: getUrl(page.slugs, locale),
    $ref: !options.noRef ? {
      file: path2
    } : void 0
  };
  for (const transformer of transformers) {
    if (!transformer.file) continue;
    item = transformer.file.call(ctx, item, path2);
  }
  return item;
}
function build(id, ctx) {
  const folder = buildFolderNode("", true, ctx);
  let root = {
    $id: id,
    name: folder.name || "Docs",
    children: folder.children
  };
  for (const transformer of ctx.transformers) {
    if (!transformer.root) continue;
    root = transformer.root.call(ctx, root);
  }
  return root;
}
function createPageTreeBuilder(getUrl, plugins) {
  function getTransformers(generateFallback) {
    const transformers = [];
    for (const plugin of plugins ?? []) {
      if (plugin.transformPageTree) transformers.push(plugin.transformPageTree);
    }
    if (generateFallback) {
      transformers.push(transformerFallback());
    }
    return transformers;
  }
  function createFlattenPathResolver(storage) {
    const map2 = /* @__PURE__ */ new Map();
    const files = storage.getFiles();
    for (const file of files) {
      const content = storage.read(file);
      const flattenPath = file.substring(0, file.length - extname(file).length);
      map2.set(flattenPath + "." + content.format, file);
    }
    return (name, format) => {
      return map2.get(name + "." + format);
    };
  }
  return {
    build(storage, options) {
      const key = "";
      return this.buildI18n({ [key]: storage }, options)[key];
    },
    buildI18n(storages, options = {}) {
      const { id, generateFallback = true } = options;
      const transformers = getTransformers(generateFallback);
      const out = {};
      for (const [locale, storage] of Object.entries(storages)) {
        const resolve = createFlattenPathResolver(storage);
        const branch = locale.length === 0 ? "root" : locale;
        out[locale] = build(id ? `${id}-${branch}` : branch, {
          transformers,
          builder: this,
          options,
          getUrl,
          locale,
          storage,
          storages,
          visitedPaths: /* @__PURE__ */ new Set(),
          resolveName(name, format) {
            return resolve(name, format) ?? name;
          }
        });
      }
      return out;
    }
  };
}
function pathToName(name) {
  const result = [];
  for (const c of name) {
    if (result.length === 0) result.push(c.toLocaleUpperCase());
    else if (c === "-") result.push(" ");
    else result.push(c);
  }
  return result.join("");
}
var FileSystem = class {
  constructor(inherit) {
    this.files = /* @__PURE__ */ new Map();
    this.folders = /* @__PURE__ */ new Map();
    if (inherit) {
      for (const [k, v] of inherit.folders) {
        this.folders.set(k, v);
      }
      for (const [k, v] of inherit.files) {
        this.files.set(k, v);
      }
    } else {
      this.folders.set("", []);
    }
  }
  read(path2) {
    return this.files.get(path2);
  }
  /**
   * get the direct children of folder (in virtual file path)
   */
  readDir(path2) {
    return this.folders.get(path2);
  }
  write(path2, file) {
    if (!this.files.has(path2)) {
      const dir = dirname(path2);
      this.makeDir(dir);
      this.readDir(dir)?.push(path2);
    }
    this.files.set(path2, file);
  }
  /**
   * Delete files at specified path.
   *
   * @param path - the target path.
   * @param [recursive=false] - if set to `true`, it will also delete directories.
   */
  delete(path2, recursive = false) {
    if (this.files.delete(path2)) return true;
    if (recursive) {
      const folder = this.folders.get(path2);
      if (!folder) return false;
      this.folders.delete(path2);
      for (const child of folder) {
        this.delete(child);
      }
      return true;
    }
    return false;
  }
  getFiles() {
    return Array.from(this.files.keys());
  }
  makeDir(path2) {
    const segments = splitPath(path2);
    for (let i = 0; i < segments.length; i++) {
      const segment = segments.slice(0, i + 1).join("/");
      if (this.folders.has(segment)) continue;
      this.folders.set(segment, []);
      this.folders.get(dirname(segment)).push(segment);
    }
  }
};
function isLocaleValid(locale) {
  return locale.length > 0 && !/\d+/.test(locale);
}
var parsers = {
  dir(path2) {
    const [locale, ...segs] = path2.split("/");
    if (locale && segs.length > 0 && isLocaleValid(locale))
      return [segs.join("/"), locale];
    return [path2];
  },
  dot(path2) {
    const dir = dirname(path2);
    const base = basename(path2);
    const parts = base.split(".");
    if (parts.length < 3) return [path2];
    const [locale] = parts.splice(parts.length - 2, 1);
    if (!isLocaleValid(locale)) return [path2];
    return [joinPath(dir, parts.join(".")), locale];
  },
  none(path2) {
    return [path2];
  }
};
function buildContentStorage(files, buildFile, plugins, i18n) {
  const parser = parsers[i18n.parser ?? "dot"];
  const storages = {};
  const normalized = files.map(
    (file) => buildFile({
      ...file,
      path: normalizePath(file.path)
    })
  );
  const fallbackLang = i18n.fallbackLanguage !== null ? i18n.fallbackLanguage ?? i18n.defaultLanguage : null;
  function scan(lang) {
    if (storages[lang]) return;
    let storage;
    if (fallbackLang && fallbackLang !== lang) {
      scan(fallbackLang);
      storage = new FileSystem(storages[fallbackLang]);
    } else {
      storage = new FileSystem();
    }
    for (const item of normalized) {
      const [path2, locale = i18n.defaultLanguage] = parser(item.path);
      if (locale === lang) storage.write(path2, item);
    }
    const context = {
      storage
    };
    for (const plugin of plugins) {
      plugin.transformStorage?.(context);
    }
    storages[lang] = storage;
  }
  for (const lang of i18n.languages) scan(lang);
  return storages;
}
function normalizePath(path2) {
  const segments = splitPath(slash(path2));
  if (segments[0] === "." || segments[0] === "..")
    throw new Error("It must not start with './' or '../'");
  return segments.join("/");
}
var priorityMap = {
  pre: 1,
  default: 0,
  post: -1
};
function buildPlugins(plugins) {
  const flatten = [];
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) flatten.push(...plugin);
    else if (plugin) flatten.push(plugin);
  }
  return flatten.sort(
    (a, b) => priorityMap[b.enforce ?? "default"] - priorityMap[a.enforce ?? "default"]
  );
}
function slugsPlugin(slugsFn) {
  function isIndex(file) {
    return basename(file, extname(file)) === "index";
  }
  return {
    name: "fumadocs:slugs",
    transformStorage({ storage }) {
      const indexFiles = /* @__PURE__ */ new Set();
      const taken = /* @__PURE__ */ new Set();
      const autoIndex = slugsFn === void 0;
      for (const path2 of storage.getFiles()) {
        const file = storage.read(path2);
        if (!file || file.format !== "page" || file.slugs) continue;
        if (isIndex(path2) && autoIndex) {
          indexFiles.add(path2);
          continue;
        }
        file.slugs = slugsFn ? slugsFn(parseFilePath(path2)) : getSlugs(path2);
        const key = file.slugs.join("/");
        if (taken.has(key)) throw new Error("Duplicated slugs");
        taken.add(key);
      }
      for (const path2 of indexFiles) {
        const file = storage.read(path2);
        if (file?.format !== "page") continue;
        file.slugs = getSlugs(path2);
        if (taken.has(file.slugs.join("/"))) file.slugs.push("index");
      }
    }
  };
}
var GroupRegex = /^\(.+\)$/;
function getSlugs(file) {
  if (typeof file !== "string") return getSlugs(file.path);
  const dir = dirname(file);
  const name = basename(file, extname(file));
  const slugs = [];
  for (const seg of dir.split("/")) {
    if (seg.length > 0 && !GroupRegex.test(seg)) slugs.push(encodeURI(seg));
  }
  if (GroupRegex.test(name))
    throw new Error(`Cannot use folder group in file names: ${file}`);
  if (name !== "index") {
    slugs.push(encodeURI(name));
  }
  return slugs;
}
function compatPlugin({
  pageTree,
  transformers
}) {
  const plugins = [];
  if (pageTree) {
    const { attachFile, attachSeparator, attachFolder, transformers: transformers2 } = pageTree;
    for (const transformer of transformers2 ?? []) {
      plugins.push(fromPageTreeTransformer(transformer));
    }
    plugins.push(
      fromPageTreeTransformer({
        file(node, file) {
          if (!attachFile) return node;
          const content = file ? this.storage.read(file) : void 0;
          return attachFile(
            node,
            content?.format === "page" ? content : void 0
          );
        },
        folder(node, folderPath, metaPath) {
          if (!attachFolder) return node;
          const files = this.storage.readDir(folderPath) ?? [];
          const meta = metaPath ? this.storage.read(metaPath) : void 0;
          return attachFolder(
            node,
            {
              children: files.flatMap((file) => this.storage.read(file) ?? [])
            },
            meta?.format === "meta" ? meta : void 0
          );
        },
        separator(node) {
          if (!attachSeparator) return node;
          return attachSeparator(node);
        }
      })
    );
  }
  if (transformers) {
    for (const transformer of transformers) {
      plugins.push(fromStorageTransformer(transformer));
    }
  }
  return plugins;
}
function fromPageTreeTransformer(transformer) {
  return {
    transformPageTree: transformer
  };
}
function fromStorageTransformer(transformer) {
  return {
    transformStorage: transformer
  };
}
function indexPages(storages, getUrl) {
  const result = {
    // (locale.slugs -> page)
    pages: /* @__PURE__ */ new Map(),
    // (locale.path -> page)
    pathToMeta: /* @__PURE__ */ new Map(),
    // (locale.path -> meta)
    pathToPage: /* @__PURE__ */ new Map()
  };
  for (const [lang, storage] of Object.entries(storages)) {
    for (const filePath of storage.getFiles()) {
      const item = storage.read(filePath);
      const path2 = `${lang}.${filePath}`;
      if (item.format === "meta") {
        result.pathToMeta.set(path2, fileToMeta(item));
        continue;
      }
      const page = fileToPage(item, getUrl, lang);
      result.pathToPage.set(path2, page);
      result.pages.set(`${lang}.${page.slugs.join("/")}`, page);
    }
  }
  return result;
}
function createGetUrl(baseUrl, i18n) {
  const baseSlugs = baseUrl.split("/");
  return (slugs, locale) => {
    const hideLocale = i18n?.hideLocale ?? "never";
    let urlLocale;
    if (hideLocale === "never") {
      urlLocale = locale;
    } else if (hideLocale === "default-locale" && locale !== i18n?.defaultLanguage) {
      urlLocale = locale;
    }
    const paths = [...baseSlugs, ...slugs];
    if (urlLocale) paths.unshift(urlLocale);
    return `/${paths.filter((v) => v.length > 0).join("/")}`;
  };
}
function loader(...args) {
  const resolved = args.length === 2 ? resolveConfig(args[0], args[1]) : resolveConfig(args[0].source, args[0]);
  return createOutput(resolved);
}
function resolveConfig(source, { slugs, icon, plugins = [], baseUrl, url, ...base }) {
  const getUrl = url ? (...args) => normalizeUrl(url(...args)) : createGetUrl(baseUrl, base.i18n);
  let config = {
    ...base,
    url: getUrl,
    source,
    plugins: buildPlugins([
      slugsPlugin(slugs),
      icon && iconPlugin(icon),
      compatPlugin(base),
      ...plugins
    ])
  };
  for (const plugin of config.plugins ?? []) {
    const result = plugin.config?.(config);
    if (result) config = result;
  }
  return config;
}
function createOutput({
  source: { files },
  url: getUrl,
  i18n,
  plugins = [],
  pageTree: pageTreeConfig
}) {
  const defaultLanguage = i18n?.defaultLanguage ?? "";
  const storages = buildContentStorage(
    files,
    (file) => {
      if (file.type === "page") {
        return {
          format: "page",
          path: file.path,
          slugs: file.slugs,
          data: file.data,
          absolutePath: file.absolutePath ?? ""
        };
      }
      return {
        format: "meta",
        path: file.path,
        absolutePath: file.absolutePath ?? "",
        data: file.data
      };
    },
    plugins,
    i18n ?? {
      defaultLanguage,
      parser: "none",
      languages: [defaultLanguage]
    }
  );
  const walker = indexPages(storages, getUrl);
  const builder = createPageTreeBuilder(getUrl, plugins);
  let pageTree;
  return {
    _i18n: i18n,
    get pageTree() {
      pageTree ??= builder.buildI18n(storages, pageTreeConfig);
      return i18n ? pageTree : pageTree[defaultLanguage];
    },
    set pageTree(v) {
      if (i18n) {
        pageTree = v;
      } else {
        pageTree = {
          [defaultLanguage]: v
        };
      }
    },
    getPageByHref(href, { dir = "", language = defaultLanguage } = {}) {
      const [value, hash] = href.split("#", 2);
      let target;
      if (value.startsWith(".") && (value.endsWith(".md") || value.endsWith(".mdx"))) {
        const path2 = joinPath(dir, value);
        target = walker.pathToPage.get(`${language}.${path2}`);
      } else {
        target = this.getPages(language).find((item) => item.url === value);
      }
      if (target)
        return {
          page: target,
          hash
        };
    },
    getPages(language) {
      const pages = [];
      for (const [key, value] of walker.pages.entries()) {
        if (language === void 0 || key.startsWith(`${language}.`)) {
          pages.push(value);
        }
      }
      return pages;
    },
    getLanguages() {
      const list = [];
      if (!i18n) return list;
      for (const language of i18n.languages) {
        list.push({
          language,
          pages: this.getPages(language)
        });
      }
      return list;
    },
    getPage(slugs = [], language = defaultLanguage) {
      return walker.pages.get(`${language}.${slugs.join("/")}`);
    },
    getNodeMeta(node, language = defaultLanguage) {
      const ref = node.$ref?.metaFile;
      if (!ref) return;
      return walker.pathToMeta.get(`${language}.${ref}`);
    },
    getNodePage(node, language = defaultLanguage) {
      const ref = node.$ref?.file;
      if (!ref) return;
      return walker.pathToPage.get(`${language}.${ref}`);
    },
    getPageTree(locale) {
      if (i18n) {
        return this.pageTree[locale ?? defaultLanguage];
      }
      return this.pageTree;
    },
    // @ts-expect-error -- ignore this
    generateParams(slug, lang) {
      if (i18n) {
        return this.getLanguages().flatMap(
          (entry) => entry.pages.map((page) => ({
            [slug ?? "slug"]: page.slugs,
            [lang ?? "lang"]: entry.language
          }))
        );
      }
      return this.getPages().map((page) => ({
        [slug ?? "slug"]: page.slugs
      }));
    }
  };
}
function fileToMeta(file) {
  return {
    path: file.path,
    absolutePath: file.absolutePath,
    get file() {
      return parseFilePath(this.path);
    },
    data: file.data
  };
}
function fileToPage(file, getUrl, locale) {
  return {
    get file() {
      return parseFilePath(this.path);
    },
    absolutePath: file.absolutePath,
    path: file.path,
    url: getUrl(file.slugs, locale),
    slugs: file.slugs,
    data: file.data,
    locale
  };
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
function fromConfig() {
  const base = fromConfigBase();
  function mapPageData(entry) {
    const { toc, structuredData, lastModified, frontmatter } = entry;
    return {
      ...frontmatter,
      default: entry.default,
      body: entry.default,
      toc,
      structuredData,
      lastModified,
      _exports: entry
    };
  }
  function mapPageDataLazy(head, content) {
    return {
      ...head,
      async load() {
        const { default: body, ...rest2 } = await content();
        return { body, ...rest2 };
      }
    };
  }
  return {
    ...base,
    async sourceAsync(doc, meta) {
      const virtualFiles = [
        ...Object.entries(doc).map(async ([file, content]) => {
          return {
            type: "page",
            path: file,
            absolutePath: path.join(content.base, file),
            data: mapPageData(await content())
          };
        }),
        ...Object.entries(meta).map(async ([file, content]) => {
          return {
            type: "meta",
            path: file,
            absolutePath: path.join(content.base, file),
            data: await content()
          };
        })
      ];
      return { files: await Promise.all(virtualFiles) };
    },
    async sourceLazy(doc, meta) {
      const virtualFiles = [
        ...Object.entries(doc.head).map(async ([file, frontmatter]) => {
          return {
            type: "page",
            path: file,
            absolutePath: path.join(doc.base, file),
            data: mapPageDataLazy(await frontmatter(), doc.body[file])
          };
        }),
        ...Object.entries(meta).map(async ([file, content]) => {
          return {
            type: "meta",
            path: file,
            absolutePath: path.join(content.base, file),
            data: await content()
          };
        })
      ];
      return { files: await Promise.all(virtualFiles) };
    }
  };
}
const serverCreate = fromConfig();
const blogSource = loader({
  source: await serverCreate.sourceAsync(blog, {}),
  baseUrl: "/blogs"
});
const docsSource = loader({
  source: await serverCreate.sourceAsync(docs, docsMeta),
  baseUrl: "/docs",
  plugins: [
    {
      transformPageTree: {
        folder(node, folderPath) {
          if (folderPath !== "skills" && folderPath !== "self-hosting")
            return node;
          return {
            ...node,
            index: void 0
          };
        }
      }
    }
  ]
});
const getBlogPost_createServerFn_handler = createServerRpc({
  id: "906f4aef11f3a3712140f31a68ef316062148ae72c4f1edd99323a8b7b90fecf",
  name: "getBlogPost",
  filename: "src/lib/content.functions.ts"
}, (opts) => getBlogPost.__executeServer(opts));
const getBlogPost = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).handler(getBlogPost_createServerFn_handler, async ({
  data: slugs
}) => {
  const page = blogSource.getPage(slugs);
  if (!page) throw notFound();
  return {
    path: page.path,
    title: page.data.title,
    description: page.data.description,
    url: page.url
  };
});
const getBlogPosts_createServerFn_handler = createServerRpc({
  id: "63d48016fb2fa4a84b0b5e81be99fc08cc06dcd5a56021771a38b2f44057f253",
  name: "getBlogPosts",
  filename: "src/lib/content.functions.ts"
}, (opts) => getBlogPosts.__executeServer(opts));
const getBlogPosts = createServerFn({
  method: "GET"
}).handler(getBlogPosts_createServerFn_handler, async () => {
  const pages = blogSource.getPages();
  return pages.map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    slugs: page.slugs
  }));
});
function getContentPost(slugs) {
  const page = docsSource.getPage(slugs);
  if (!page) throw notFound();
  return {
    path: page.path,
    title: page.data.title,
    description: page.data.description,
    url: page.url
  };
}
function getContentPosts() {
  const topLevelOrder = /* @__PURE__ */ new Map([["mcp", 0], ["skills", 1]]);
  const pages = docsSource.getPages();
  return pages.map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    slugs: page.slugs
  })).sort((a, b) => {
    const depth = a.slugs.length - b.slugs.length;
    if (depth !== 0) return depth;
    const order = (topLevelOrder.get(a.slugs[0] ?? "") ?? Number.MAX_SAFE_INTEGER) - (topLevelOrder.get(b.slugs[0] ?? "") ?? Number.MAX_SAFE_INTEGER);
    if (order !== 0) return order;
    return a.title.localeCompare(b.title);
  });
}
const getDocsPost_createServerFn_handler = createServerRpc({
  id: "bfce0f9f1e33f426128b41b1c67a32fcda26b7a67c33898a608f54bcb7af3575",
  name: "getDocsPost",
  filename: "src/lib/content.functions.ts"
}, (opts) => getDocsPost.__executeServer(opts));
const getDocsPost = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).handler(getDocsPost_createServerFn_handler, async ({
  data: slugs
}) => getContentPost(slugs));
const getDocsPosts_createServerFn_handler = createServerRpc({
  id: "92f14aaa48434cc5919837b5703f5acfb6ec9942ead6a3c22e947eaef2c5ffd7",
  name: "getDocsPosts",
  filename: "src/lib/content.functions.ts"
}, (opts) => getDocsPosts.__executeServer(opts));
const getDocsPosts = createServerFn({
  method: "GET"
}).handler(getDocsPosts_createServerFn_handler, async () => getContentPosts());
const getDocsPageTree_createServerFn_handler = createServerRpc({
  id: "44fea4cd6f70934332d1d61921b03567fd3d377fa0fe20e8d69df99e6170ecbc",
  name: "getDocsPageTree",
  filename: "src/lib/content.functions.ts"
}, (opts) => getDocsPageTree.__executeServer(opts));
const getDocsPageTree = createServerFn({
  method: "GET"
}).handler(getDocsPageTree_createServerFn_handler, async () => docsSource.getPageTree());
export {
  getBlogPost_createServerFn_handler,
  getBlogPosts_createServerFn_handler,
  getDocsPageTree_createServerFn_handler,
  getDocsPost_createServerFn_handler,
  getDocsPosts_createServerFn_handler
};
