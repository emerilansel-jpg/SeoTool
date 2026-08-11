## Fase 3c — Topical/LLM: Per-Page Entity Extraction via OpenRouter

### Konteks & desain

Body text (`audit_pages.body_text`) sudah tersimpan. Sekarang mengeksposnya ke LLM (OpenRouter) untuk ekstraksi entitas/topik per halaman. Infrastruktur AI sudah ada: `@openrouter/ai-sdk-provider` + `generateText` + `openRouterCostUsd` + `trackUsageCreditSpend`. Pola workflow: fase post-crawl best-effort (mirip `runContentScoringPhase`). Schema: mirip `content_scores` (auditId + pageId FK, unique index on pageId, delete-then-insert idempotent).

**LLM approach:** `generateText()` dari Vercel AI SDK dengan OpenRouter model (`minimax/minimax-m3` default). Prompt meminta JSON terstruktur: `{entities: [{name, type, relevance}], topics: [{topic, confidence}]}`. Body text di-truncate ke 8000 karakter (~2000 token) untuk mengontrol biaya. Diproses dalam batch 5 halaman concurrently. Best-effort: LLM gagal → skip halaman, tidak gagalkan audit.

**Cost control:** Credit check sebelum fase dimulai. Truncation 8000 chars/page. Batch 5 concurrent. Biaya estimasi: ~$0.002/page × 100 pages = ~$0.20/audit. Credit feature `content_intelligence` (reuse, sudah ada dari Slice B).

---

### Layer yang dibangun

**1. Schema — `page_entities` (dual-dialect):**

- `src/db/content-intelligence.schema.ts` — tabel baru `page_entities` (id, auditId FK→audits CASCADE, pageId FK→audit_pages CASCADE, url, entitiesJson, topicsJson, extractedAt). Unique index on pageId.
- `src/db/pg/content-intelligence.schema.ts` — mirror
- Registrasi di barrel (`schema.ts`, `d1/schema.ts`, `pg/schema.ts`) + schema-parity test (audit/content-intelligence tables sekarang harus ditambahkan ke parity test)

**2. LLM extraction function — `entityExtraction.ts`:**

- `src/server/features/content-intelligence/entityExtraction.ts`
- `extractEntities(bodyText: string): Promise<EntityExtractionResult>` — memanggil `generateText()` dari Vercel AI SDK dengan OpenRouter model, prompt JSON terstruktur, parse response dengan Zod
- `MAX_BODY_CHARS = 8000` (truncation)
- Mengembalikan `{entities, topics, costUsd}` — `costUsd` dari `openRouterCostUsd(result.providerMetadata)`
- Pure-ish (mockable model), unit-testable dengan mock `generateText`

**3. Repository — `PageEntityRepository.ts`:**

- `src/server/features/content-intelligence/repositories/PageEntityRepository.ts`
- `replaceForAudit(auditId, rows)` — delete-then-insert (idempotent, mirip ContentScoreRepository)
- `listForAudit(auditId)` — ordered by entity count desc
- `getForPage(pageId)`
- `clearForAudit(auditId)`

**4. Service — extend `ContentIntelligenceService.ts`:**

- `extractEntitiesForAudit(auditId: string): Promise<{extracted: number}>` — query `audit_pages` (body_text non-null, fetchClass=ok), truncate, panggil `extractEntities` dalam batch 5 concurrent, persist ke `page_entities`. Best-effort: error per halaman → skip.
- `getEntitiesForAudit(auditId, projectId)` — ownership-checked (AuditRepository.getAuditForProject), return view

**5. Workflow phase — `siteAuditWorkflowPhases.ts`:**

- `runEntityExtractionPhase(step, params)` — pgStep, best-effort (try/catch swallow errors, mirip `runContentScoringPhase`). Dipanggil setelah `runContentScoringPhase`.

**6. Zod schemas — `src/types/schemas/content-intelligence.ts`:**

- `pageEntitiesInputSchema` (projectId, auditId)

**7. Server fn — `src/serverFunctions/content-intelligence.ts`:**

- `getPageEntities` (GET, `[requireProjectContext]`, viewer+)

**8. Client UI — `src/client/features/content-intelligence/PageEntitiesView.tsx`:**

- Summary cards (total entities, total topics, top entity types)
- Per-page table (URL, entity count, topic count, expandable detail: entity list + topic list)
- Tab "Entities" di audit results (mirip tab "Content")

**9. MCP tool — `src/server/mcp/tools/content-intelligence-tools.ts` (extend):**

- `get_page_entities` (readOnly, auditId optional → latest)

**10. Tests:**

- `entityExtraction.test.ts` — mock generateText, test JSON parsing, truncation, error handling (~8 tests)
- Extend schema-parity test dengan audit/content-intelligence tables

---

### Explicitly deferred

- Report section `entities` (first slice focuses on audit-integrated view)
- Topic clustering across pages (cross-page topic aggregation)
- Entity deduplication/normalization across pages
- Programmatic content briefs (Fase 4)

### Risiko (dimitigasi)

- **Brace-stripping** → verify brace-balance setiap file baru
- **LLM response parsing** → Zod strict parse + fallback ke empty arrays bila parse gagal
- **Cost** → truncation 8000 chars + batch 5 + credit check. Estimasi ~$0.20/audit (100 pages)
- **OPENROUTER_API_KEY opsional** → fase dilewati bila key tidak tersedia (mirip Loops email: graceful skip)
- **Array-form middleware** → WAJIB `.middleware([requireProjectContext])`
