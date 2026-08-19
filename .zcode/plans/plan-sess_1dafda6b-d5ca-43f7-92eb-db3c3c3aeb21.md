# Dark Command Center — SeoTool.im Redesign

## Design Direction

**"Dark Command Center"** — marketing site yang terasa seperti cockpit SEO live. Near-black canvas, dot-grid background pattern, cyan data-glow accents (#00e5ff), orange CTA buttons (#ff5600 untuk brand warmth), floating live-data cards. Typography: **Space Grotesk** (display headlines, geometric/techy) + Inter (body) + JetBrains Mono (data/terminal).

### Color Tokens (updated in `app.css` `@theme`)

| Token                     | Old (cream) | New (dark)                 |
| ------------------------- | ----------- | -------------------------- |
| `--color-brand`           | `#111111`   | `#ebedf2` (light text)     |
| `--color-brand-muted`     | `#66625e`   | `#8b8fa3`                  |
| `--color-brand-accent`    | `#ff5600`   | `#00e5ff` (cyan tech)      |
| `--color-surface`         | `#f5f1ec`   | `#0a0b14` (dark canvas)    |
| `--color-surface-raised`  | `#ffffff`   | `#12141f` (dark card)      |
| `--color-border-subtle`   | `#d8d1c8`   | `#1e2030` (dark hairline)  |
| **NEW** `--color-cta`     | —           | `#ff5600` (orange buttons) |
| **NEW** `--color-success` | —           | `#22c55e`                  |

### Performance/Animation Strategy (PageSpeed-safe)

- **CSS-only animations**: transform/opacity only (GPU-accelerated, zero layout cost)
- **Scroll reveals**: IntersectionObserver inline hook (~500 bytes), adds `.reveal-in` class
- **Staggered hero entrance**: CSS `@keyframes` with `animation-delay`, fires on load
- **Dot grid**: pure CSS `background-image: radial-gradient()`, no images
- **Glow**: `box-shadow` + `radial-gradient` overlays (static, no repaint)
- **`prefers-reduced-motion`**: all animations disabled
- **`content-visibility: auto`**: on below-fold sections (lazy render)
- **No new JS dependencies**, no framer-motion, no GSAP
- **Fonts**: preconnect + `display=swap`, Space Grotesk added (3 weights only)

---

## Files to Modify (10 files)

### 1. `web/src/styles/app.css` — Design tokens

- Update `@theme` block with dark palette (table above)
- Add Space Grotesk to font stack
- Override fumadocs `--fd-background`/`--fd-foreground` to dark values under `:root` (marketing pages) so docs/blog keep their own theme via `data-theme` attribute
- Add `html { color-scheme: dark; }` for form controls/scrollbars

### 2. `web/src/routes/_marketing/index.tsx` — Font preload

- Add Space Grotesk (wght 500;600;700) to Google Fonts stylesheet link alongside Inter + JetBrains Mono

### 3. `web/src/routes/_marketing.tsx` — Nav + Footer chrome

- **Nav**: dark glassmorphic bar (`bg-[#0a0b14]/80 backdrop-blur-xl border-[#1e2030]`), cyan hover accents, dark dropdowns, logo with cyan accent dot
- **Product Hunt bar**: dark variant (`bg-[#16141f]` with orange text accent)
- **Mobile menu**: dark panel
- **Body bg override**: change `#f5f1ec` to `#0a0b14`

### 4. `web/src/components/landing-page.css` — Complete rewrite (~800 lines)

Dark command center styles replacing the cream `.itc-*` system:

- Dot grid hero background with radial cyan glow
- Staggered `@keyframes fadeUp` entrance animation
- `.reveal` / `.reveal-in` scroll-reveal classes (opacity + translateY, GPU)
- Glass cards with hairline borders + subtle inner glow on hover
- Cyan data labels, mono metric callouts
- Terminal section enhanced with cyan glow border
- Pricing cards with gradient-border featured tier
- Floating Discord pill → dark with cyan icon glow
- All `prefers-reduced-motion` guards

### 5. `web/src/components/landing-page.tsx` — Homepage structure

Preserve ALL existing data (testimonials, features, pricing, MCP content). New/changed:

- **Hero**: add floating live-data cards (keyword metrics with cyan glow), staggered reveal classes
- **NEW LiveMetrics section**: 4 animated count-up stats (Keywords Tracked, Domains Analyzed, SERPs Cached, Data Points) using IntersectionObserver
- **FeatureSection**: dark cards, hover glow, workflow group headers with cyan accent
- **McpSection**: keep terminal content, add cyan glow border, orange CTA stays
- **NEW CTA band**: final conversion section with gradient background + glow
- **Scroll reveal**: add `useReveal()` hook (IntersectionObserver) + `.reveal` classes to sections
- Keep all icon components, testimonials data, pricing data, MCP terminal content unchanged

### 6. `web/src/routes/_marketing/pricing.tsx` — Dark pricing

- Replace `text-neutral-950` → `text-[var(--color-brand)]`
- Replace `bg-white` → `bg-[var(--color-surface-raised)]`
- Replace `text-[var(--color-brand-muted)]` stays (auto-adapts)
- Plan cards: dark surface, featured tier gets cyan gradient border glow
- CTA buttons: orange (`bg-[var(--color-cta)]`) for paid, outline for free
- Comparison table: dark header, dark rows, cyan checkmarks
- FAQ: dark text on dark surface

### 7. `web/src/routes/_marketing/features/index.tsx` — Dark features hub

- Replace `text-neutral-950` → `text-[var(--color-brand)]`
- Replace `bg-white` → `bg-[var(--color-surface-raised)]`
- Replace `hover:border-neutral-900` → `hover:border-[var(--color-brand-accent)]`
- FeatureCard: dark surface, cyan hover border glow

### 8. `web/src/components/site-footer.tsx` — Dark footer

- Replace all 6× `text-neutral-900` → `text-[var(--color-brand)]`
- Links use `text-[var(--color-brand-muted)]` with hover to `--color-brand`

### 9. `web/src/components/newsletter-signup.tsx` — Dark form

- Input: `bg-[var(--color-surface-raised)]` border `--color-border-subtle`, text `--color-brand`, focus ring cyan
- Button: `bg-[var(--color-cta)]` (orange) with `hover:` darker
- Success/error text: theme-aware colors

### 10. `web/src/routes/__root.tsx` — Theme attribute

- Set fumadocs `data-theme="dark"` on `<html>` (or via RootProvider `theme="dark"`) so fumadocs components render dark
- This also covers docs/blog pages with native fumadocs dark mode

---

## Implementation Order

1. `app.css` tokens (foundation — everything cascades from here)
2. `__root.tsx` fumadocs dark theme
3. `landing-page.css` full rewrite (the bulk of the visual work)
4. `landing-page.tsx` structure + scroll reveal + new sections
5. `_marketing/index.tsx` font preload
6. `_marketing.tsx` nav/footer chrome
7. `pricing.tsx` dark theme
8. `features/index.tsx` dark theme
9. `site-footer.tsx` + `newsletter-signup.tsx` dark fixes
10. Test build + verify

## What stays unchanged

- All product data (features, pricing tiers, testimonials, MCP terminal content)
- All route paths, SEO metadata, links, CTAs
- Demo video (`/demo.mp4` + poster)
- All icon SVG components
- Docs/blog content (fumadocs handles its own dark theme natively)
- The SaaS app (`src/`) — completely untouched (separate deployment)
