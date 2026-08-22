# GMB Rank Tracker (Heatmap Grid) Implementation Plan

This feature adds local SEO heatmap tracking to SeoTool.im, allowing users to track Google Maps rankings across a geographical grid.

## Phase 1: Database Schema
- [ ] Add `gmbGridConfigs` table to `src/db/sqlite-core.ts` (or `app.schema.ts`).
- [ ] Add `gmbGridRuns` table.
- [ ] Add `gmbGridSnapshots` table.
- [ ] Duplicate tables in `src/db/pg-core.ts` (or `pg/app.schema.ts`) to maintain parity.
- [ ] Add to exports in `src/db/schema.ts`.
- [ ] Generate and apply Drizzle migrations.

## Phase 2: Math & Helpers
- [ ] Create geo-math helper `src/server/utils/geo-grid.ts` to calculate NxN grid coordinates from center point and radius.

## Phase 3: DataForSEO Service
- [ ] Create `src/server/services/gmb-grid.service.ts`.
- [ ] Implement `postGridTasks` using DataForSEO Google Maps SERP Standard API (batching).
- [ ] Implement `fetchGridTasks` to parse rank based on `businessName`.

## Phase 4: Server Functions (API) & Quota
- [ ] Create `src/server/functions/gmb-grid.ts`.
- [ ] Add API validation schemas (Zod).
- [ ] Implement quota checks based on grid size (billing tier).

## Phase 5: Frontend UI (TanStack Router)
- [ ] Add route `src/routes/_dashboard/projects/$projectId/local-rank.tsx` (or similar standard routing).
- [ ] Install `leaflet` and `react-leaflet`.
- [ ] Build heatmap UI component with visual indicators for rankings.
