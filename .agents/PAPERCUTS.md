# Papercuts

Small, non-blocking friction in the repository itself — the kind that will
waste the next contributor's time too. Log it in the moment; review and fix
entries in a separate, user-requested cleanup pass.

This is not a completed-work log, a bug tracker, or a place for the agent's own
sandbox/shell/network hiccups. Never include secrets, credentials, personal
data, or sensitive paths.

## Open

- [ ] `2026-08-29T03:10:00Z` — `zcode` — Playwright 1.59 removed `timeout` from `TestDetails`, so `test(title, { timeout })` fails tsc with TS2353 even though older suites use it; the per-test budget must be widened with `test.setTimeout(ms)` inside the test body (first navigation of a cold dev server can compile routes for ~42s against the 45s default).
- [ ] `2026-08-27T10:24:24Z` — `codex` — `pnpm db:generate` can print fatal non-TTY errors for both Drizzle generators yet still exit 0, so automation may report success without creating migrations. Wrap each generator with an explicit output/artifact check (or upgrade/fix the generator exit behavior) so the combined script fails reliably.
- [ ] `2026-07-20T20:08:28Z` — `claude` — In a fresh git worktree, `oxlint --type-aware` crashes with `Cannot find module '@oxlint/binding-darwin-arm64'` — the platform-specific optional dep is missing from the worktree's node_modules while tsc/prettier work fine, and plain `pnpm install` reports up-to-date without restoring it; `pnpm install --force` (~22s) fixes it. Worth making the worktree-setup hook (or a documented step) run the forced install so lint doesn't die on fresh worktrees.
- [ ] `2026-07-19T04:06:52Z` — `codex` — `pnpm --dir web build` fails with `vite: command not found` when `web/node_modules` is absent, despite the root toolchain being installed. Document or enforce the package-local install required before validating the `web/` subpackage.
- [ ] `2026-07-19T02:55:56Z` — `claude` — Adding a docs folder under `web/content/docs` whose `meta.json` lists an `[Overview](...)` link renders a duplicated, double-highlighted sidebar entry, because the folder-index strip in `web/src/lib/source.ts` (`transformPageTree.folder`) is a per-folder-name allowlist. Derive it from the meta convention (or strip the index for all folders) so new sections don't need a hidden source.ts edit.
- [ ] `2026-07-14T01:28:30Z` — `claude` — Regenerating the lockfile (adding or moving a dep) makes `pnpm install` re-run the `minimumReleaseAge` gate on transitive peers already pinned at that exact version (`mysql2`, `sql-escaper`, `@aws-sdk/credential-providers`), failing the install even though nothing about them changed. `pnpm install --config.minimumReleaseAge=0` — then confirm the lockfile diff stays version-neutral — unblocks it; worth documenting that regen step so the gate doesn't re-block already-pinned versions.
- [ ] `2026-07-10T21:28:46Z` — `codex` — `pnpm --dir badseo run typecheck` works through the root toolchain but `pnpm --dir badseo run build` can't find Vite because `badseo/node_modules` is absent. Document or enforce the package-local install before validating the `badseo/` subpackage.
- [ ] `2026-07-10T21:32:10Z` — `codex` — Formatting the `badseo/` workspace with `pnpm exec prettier` fails because Prettier is only available from the repository root. Document the root-only formatter command or expose a workspace-local formatting script.
- [ ] `2026-08-19T02:15:00Z` — `zcode` — After a dependency update, `npm run dev` serves a stale SSR manifest and every server function call 500s with `Invalid server function ID` (client sees `Failed to fetch`); the dev server never self-heals. Deleting `node_modules/.vite`, `node_modules/.cache`, and `.tanstack/tmp` then restarting fixes it. Add a `dev:fresh` script that clears those caches before `vite dev` so the workaround is one command.
- [ ] `2026-08-22T15:15:00Z` — `zcode` — `pnpm run db:migrate:local` fails with `duplicate column name: role: SQLITE_ERROR` because the local D1 database state has drifted from `drizzle/meta/_journal.json` (older journal entries applied against newer columns). Local-only blocker; needs a one-time local D1 reset or journal reconciliation so new migrations (e.g. gmb_grid) can be applied locally.
- [ ] `2026-08-22T15:16:00Z` — `zcode` — `drizzle-kit migrate` (0.31.10) exits 1 with zero output on SQL errors (e.g. missing `isonow()` function) in non-TTY/CI contexts, so a failing PG migration is indistinguishable from a config problem. `scripts/migrate-pg.sh` works around it by replaying the DDL through `psql` after a failure; a `--verbose`-style flag upstream would remove the workaround.
- [ ] `2026-08-22T15:17:00Z` — `zcode` — The VPS working tree can contain root-owned files (past root logins), so CI deploy as the `seotool` user died at `chmod +x scripts/deploy-vps.sh` under `set -e`; auto-deploy now calls scripts via `bash` instead. Additionally, `auto-deploy.sh` rewrites itself via `git reset --hard` mid-execution, so a deploy run executes the _previous_ commit's script body — first deploy after editing the script silently runs stale logic and needs a rerun.

## Resolved

Move fixed entries here, mark them checked, and append the resolving date or commit.

- [x] `2026-08-28T13:28:00Z` — `codex` — Downloaded TestSprite failure bundles under `.testsprite/runs/` include raw production HTML that Prettier may reject, causing `pnpm ci:check` to fail on test evidence rather than source. Resolved 2026-08-28 by excluding the run-artifact directory in `.prettierignore`.
- [x] `2026-08-26T13:49:00Z` — `codex` — `drizzle-kit generate` compared against stale snapshots and prompted for unrelated manual migrations. Resolved 2026-08-27 by adding current D1/Postgres snapshots (`0057`/`0034`) with repaired parent chains; both generators now report no schema changes non-interactively.
