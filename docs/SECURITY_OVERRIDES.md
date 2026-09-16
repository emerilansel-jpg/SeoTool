# Dependency security overrides (annotated)

Functional overrides live in `package.json` → `pnpm.overrides`. This table is
the human-readable record of **why** each floor exists and **when it can be
pruned**. When `pnpm audit` flags a new package, add the floor in
`package.json` AND a row here.

Why package.json and not `pnpm-workspace.yaml`? Empirically pnpm 10.30
re-resolves only the `package.json` overrides — an `overrides:` block in
`pnpm-workspace.yaml` is ignored by resolution, so floors kept there never
reached the lockfile (found during the 2026-09 QA audit when `sharp` stayed
pinned at 0.35.2 despite an override).

| Package | Floor | Advisory / reason | Waiting on (parent) | Prune when |
| --- | --- | --- | --- | --- |
| `@babel/core` | `^7.29.6` | GHSA-4x5r-pxfx-6jf8 | `@tanstack/devtools-vite` | parent bumps past floor |
| `browserslist` | `^4.28.7` | GHSA-c83g-rgw3-j3cx (unbounded memory growth → OOM) + prototype-write via `browserslist-stats.json` | `@tanstack/devtools-vite` → `@babel/core` → `@babel/helper-compilation-targets` | parent chain bumps past floor |
| `defu` | `^6.1.5` | GHSA-737v-mqg7-c878 | `better-auth` | parent bumps past floor |
| `dompurify` | `^3.4.11` | 13 advisories incl. GHSA-x4vx-rjvf-j5p4, GHSA-gvmj-g25r-r7wr | `posthog-js` | parent bumps past floor |
| `fast-uri` | `^3.1.6` | 4x SSRF/host-confusion incl. GHSA-jqff-g426-hqxp | `@modelcontextprotocol/sdk` → `ajv` | parent bumps past floor |
| `form-data` | `^4.0.6` | GHSA-hmw2-7cc7-3qxx | `cloudflare` | parent bumps past floor |
| `hono` | `^4.12.25` | 9 advisories incl. GHSA-88fw-hqm2-52qc (CORS) | `@modelcontextprotocol/sdk` | parent bumps past floor |
| `js-yaml` | `^4.3.2` | GHSA-2883-xcg3-v3hh (`maxTotalMergeKeys` CPU DoS) | `@tanstack/react-start` → `start-plugin-core` → `xmlbuilder2` | parent bumps past floor |
| `launch-editor` | `^2.14.1` | GHSA-v6wh-96g9-6wx3 | `@tanstack/devtools-vite` | parent bumps past floor |
| `postcss` | `^8.5.10` | GHSA-qx2v-qp2m-jg93 | `vite` | parent bumps past floor |
| `qs` | `^6.15.2` | GHSA-q8mj-m7cp-5q26 | `@modelcontextprotocol/sdk` | parent bumps past floor |
| `shell-quote` | `^1.8.4` | GHSA-w7jw-789q-3m8p | `@tanstack/devtools-vite` | parent bumps past floor |
| `sharp` | `^0.35.4` | GHSA-rgj7-g3m4-5g8c (libheif) — was pinned `0.35.2` by `miniflare` alpha | `@cloudflare/vite-plugin` → `miniflare` | `miniflare` stable pins `>=0.35.4` |
| `smol-toml` | `^1.7.1` | GHSA-v3rj-xjv7-4jmq (DoS via malformed TOML, patched `>=1.7.1`) | `knip` | `knip` bumps past floor |
| `toml` | `^4.2.0` | GHSA-82x6-q7mm-w9cf (uncontrolled recursion) | `effect` (`effect@4.0.0-beta.93` pins `toml@4.1.2`) | `effect` beta bumps past floor |
| `undici` | `>=7.29.0` | 7 advisories incl. GHSA-vmh5-mc38-953g | `cheerio` + `miniflare` | parents bump past floor |

Ranges are **major-bounded (`^`) on purpose**: an override REPLACES the
parent's range, so an open-ended `>=` floor would let a future major (e.g.
`hono` 5) get forced onto a parent that only supports the current one.
`undici`/`nanoid` predate this policy and keep their original open ranges.

## Triaged non-issues (kept in `pnpm-workspace.yaml` `auditConfig.ignoreGhsas`)

- **GHSA-67mh-4wv8-2f99** (`esbuild` <=0.24.2 dev-server CORS): only reachable
  via drizzle-kit's bundled `@esbuild-kit` loader (dev-time CLI); drizzle-kit
  never starts esbuild's serve mode, so the vulnerable path cannot execute.
  Re-review when the parent updates.

## CI enforcement

`.github/workflows/ci.yml` runs `pnpm audit --prod --audit-level high` after
install. A new high/critical advisory fails CI until it is either fixed via a
floor here or consciously triaged into `auditConfig.ignoreGhsas` (with a row
in the section above explaining why it is not applicable).
