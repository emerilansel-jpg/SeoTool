# Design System (SeoTool.im SaaS app)

This document describes the visual design system of the SeoTool.im SaaS application (the `src/` client app). Use it whenever you build or restyle UI so new screens match the existing product instead of drifting.

The source of truth for all tokens is [`src/client/styles/app.css`](../src/client/styles/app.css). If this document and `app.css` disagree, `app.css` wins; fix the doc.

Scope note: the marketing site (`web/`) and the `badseo/` fixture microsite are styled independently and are NOT part of this system. See the [appendix](#appendix-other-styled-surfaces) before copying any styles between surfaces.

## Stack

| Concern           | Choice                                                                       |
| ----------------- | ---------------------------------------------------------------------------- |
| CSS framework     | Tailwind CSS v4 (CSS-first config in `app.css`, no `tailwind.config.*` file) |
| Component classes | DaisyUI 5, loaded via `@plugin "daisyui"` with `exclude: properties`         |
| Charts            | recharts 3 (the only chart library)                                          |
| Icons             | lucide-react (the only icon library)                                         |
| Toasts            | sonner                                                                       |
| Tables            | TanStack Table, wrapped by `src/client/components/table/AppDataTable.tsx`    |
| Forms             | TanStack Form (`useForm` / `form.Field`)                                     |

There is no Button/Card/Badge wrapper library. Components use DaisyUI classes directly, with a small set of shared primitives (`Modal`, `SegmentedToggle`, the table toolkit) in `src/client/components/`.

## Color system

The palette is the Supastarter palette expressed as two custom DaisyUI themes. Both themes must always be updated together: any new color or value change goes into `seotool` and `seotool-dark` in the same commit.

### Light theme: `seotool` (default)

| Token                   | Value     | Usage                                           |
| ----------------------- | --------- | ----------------------------------------------- |
| `base-100`              | `#fafafe` | Content panel background (raised surface)       |
| `base-200`              | `#f8fafc` | Sidebar, page background, sticky table header   |
| `base-300`              | `#e3ebf6` | Borders, dividers, segmented toggle well        |
| `base-content`          | `#292b35` | Primary text                                    |
| `primary`               | `#4e6df5` | Brand indigo: CTAs, links, active states, focus |
| `primary-content`       | `#f6f7f9` | Text on primary surfaces                        |
| `secondary` / `neutral` | `#292b35` | Dark ink variant                                |
| `accent` / `info`       | `#4e6df5` | Aliased to primary                              |
| `success`               | `#39a561` | Positive deltas, confirmations                  |
| `warning`               | `#e5a158` | Status banners, cautions                        |
| `error`                 | `#ef4444` | Destructive actions, validation errors          |

### Dark theme: `seotool-dark`

| Token                           | Value                                             |
| ------------------------------- | ------------------------------------------------- |
| `base-100`                      | `#0d1116`                                         |
| `base-200`                      | `#070d12`                                         |
| `base-300`                      | `#2b303d`                                         |
| `base-content`                  | `#e9eef3`                                         |
| `primary`                       | `#5581f7`                                         |
| `primary-content`               | `#091521`                                         |
| `secondary` / `neutral`         | `#e9eef3` (content `#091521`)                     |
| `accent` / `info`               | `#5581f7` (content `#091521`)                     |
| `success` / `warning` / `error` | same as light (`#39a561` / `#e5a158` / `#ef4444`) |

### Rules

- Always use semantic tokens (`bg-base-100`, `text-primary`, `border-base-300`, `text-base-content/70`). Never hardcode hex values in components.
- The only sanctioned raw hex values in JSX are the chart series colors and nothing else (see [Charts](#charts)); chips and score tiers are CSS classes defined in `app.css`, not inline colors.
- Opacity modifiers on tokens (`text-base-content/70`, `bg-primary/20`, `border-error/30`) are the standard way to build secondary surfaces.

## Typography

- The app uses Tailwind v4's default system sans stack. No webfonts are loaded for the SaaS app.
- Page title: `<h1 className="text-2xl font-semibold">` with a `<p className="text-sm text-base-content/70">` subtitle. This exact pairing is the page header convention.
- Data, metrics, URLs, and code: `font-mono` plus `tabular-nums` so columns of numbers align.
- Global `input, textarea, select { text-base }` (16px) prevents iOS zoom on focus; do not shrink field font sizes below that.

## Radius, borders, sizing

| Token                                  | Value                                                                |
| -------------------------------------- | -------------------------------------------------------------------- |
| `--radius-box`                         | `0.75rem` (cards, modals; `.card` is globally set to this)           |
| `--radius-field` / `--radius-selector` | `0.5rem` (inputs, buttons, checkboxes)                               |
| `--border`                             | `1px`                                                                |
| `--depth`, `--noise`                   | `0` (flat design; depth comes from background contrast, not shadows) |

The look is flat with hairline borders. Shadows only appear on floating layers (modals, dropdown panels: `shadow-lg` / `shadow-xl`).

## Theming behavior

- `src/client/lib/theme.ts` exports `useThemePreference()` returning `"system" | "light" | "dark"`, persisted in `localStorage["theme-preference"]`.
- The active theme is applied as `<html data-theme="seotool" | "seotool-dark">`. All dark-mode CSS overrides in `app.css` key off `html[data-theme="seotool-dark"]`, never `prefers-color-scheme` directly.
- `themePreferenceInitScript` is inlined in the `<head>` of `src/routes/__root.tsx` to set `data-theme` before first paint (no FOUC).
- The user-facing switcher is `ThemePreferenceMenuItems` (System/Light/Dark with Monitor/Sun/Moon icons) in the sidebar user dropdown.
- Cross-tab sync works through `storage` events and a custom `theme-preference-change` event.

## App shell and layout

`src/client/layout/AppShell.tsx` renders the authenticated shell:

- Root: `flex h-[100dvh] bg-base-200`. The whole tree scrolls inside the content panel, not the body.
- Desktop sidebar (`src/client/components/Sidebar.tsx`): fixed `w-60 bg-base-200`, wordmark, `NotificationCenter`, `ProjectSwitcher`, a `tabs tabs-border` Browse/Chat toggle, grouped nav (group headers `text-xs font-semibold uppercase tracking-wider text-base-content/40`; active link `bg-base-300/50 font-medium` with a primary bar on the left edge), and a user `dropdown` in the footer.
- Content sits on a raised "cutout" panel (PostHog style): a `md:pt-2` strip of sidebar background above a `bg-base-100 md:rounded-tl-lg md:border-l md:border-t md:border-base-300` panel, with a subtle primary radial glow at the top (`h-64 opacity-[0.04]`, `pointer-events-none`).
- Status banners (`alert alert-warning` / `alert-info`, billing banner, optional route banner) render at the top of the panel, above the scrollable page content.
- Mobile (`< md`): the sidebar hides, a `MobileTopBar` (hamburger `btn btn-square btn-ghost btn-sm` + wordmark) opens a `MobileSidebarDrawer` (`fixed inset-0 z-50` overlay `bg-black/45` + the same `Sidebar` sliding in).

### Page scaffold

```tsx
<div className="overflow-auto px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
  <div className="mx-auto max-w-7xl space-y-4">
    <header>
      <h1 className="text-2xl font-semibold">Page title</h1>
      <p className="text-sm text-base-content/70">
        Subtitle explaining the page.
      </p>
    </header>
    {/* cards, tables, charts */}
  </div>
</div>
```

`pb-24` on mobile leaves room above the browser toolbar. Content widths: `max-w-7xl` for full feature pages, `max-w-5xl` for the dashboard, `max-w-6xl` occasionally. Feature page state (active tab, sort, page, page size) lives in router search params, applied with `replace: true` so navigating back restores the view.

## Component conventions

### Cards

The near-universal card recipe:

```tsx
<div className="card bg-base-100 border border-base-300">
  <div className="card-body gap-3 p-4">{/* ... */}</div>
</div>
```

### Buttons

| Variant           | Use                                                              |
| ----------------- | ---------------------------------------------------------------- |
| `btn btn-primary` | Primary action (search submit, create, save)                     |
| `btn btn-ghost`   | Toolbar and table row actions, secondary buttons                 |
| `btn btn-soft`    | Selected state inside toggles                                    |
| `btn btn-error`   | Destructive actions                                              |
| `btn btn-outline` | Occasional emphasis alternative                                  |
| plain `btn`       | Default neutral button (recolored globally per theme, see below) |

Sizes: `btn-sm` for toolbars and table actions, `btn-xs` for dense controls, `btn-square` (or `btn-circle`) for icon-only buttons with an `aria-label`. `app.css` lifts the plain default button per theme (white surface + `base-300` border in light, `oklch(25% 0 0)` in dark) so it never reads as sunken on the content panel; you do not need to style it yourself.

### Badges, chips, and score tiers

- Badges: `badge badge-xs` / `badge-sm` with `badge-outline`, `badge-primary`, `badge-ghost`, or semantic colors (`badge-error`, `badge-warning`, `badge-success`).
- Categorical tag chips: `tag-chip-slate`, `tag-chip-rose`, `tag-chip-amber`, `tag-chip-lime`, `tag-chip-emerald`, `tag-chip-sky`, `tag-chip-violet`, `tag-chip-fuchsia`. These are muted tinted chips (14-16% background, 30% ring) with per-theme text colors, defined in `app.css`. Use them for keyword tags and categorical labels. Matching solid dots (`.tag-dot-*`, exposed via `tagDotClass` / `tagSwatchClass` in `src/shared/tag-colors.ts`) pair with the chips for swatches and legends. AI platform accents (`platform-border-*` / `platform-dot-*`) follow the same pattern for model/platform cards.
- Keyword difficulty scores: `score-badge` plus `score-tier-na` or `score-tier-1` (easiest, emerald) through `score-tier-6` (hardest, dark red), rendered as small circles (`inline-flex size-6 rounded-full text-[10px] font-semibold tabular-nums`). See `src/client/features/keywords/components/DifficultyBadge.tsx`.

### Tables

Do not hand-roll tables. Use the toolkit in `src/client/components/table/`:

- `AppDataTable`: renders DaisyUI `table table-sm` inside `overflow-x-auto`; supports `empty` and `loading` slots (rendered instead of the table), `stickyHeader` (`bg-base-200` head), `fixedLayout` + colgroup, and per-column `meta.headerClassName` / `meta.cellClassName`.
- `SortableHeader` for sort toggles, `TablePagination` for the footer (range label with `tabular-nums`, `select select-bordered select-sm` page size, spinner while fetching).
- `TableBulkActionBar` and `makeSelectionColumn` for row selection (`checkbox checkbox-xs` with shift-range select via `tableSelection.ts`).
- `ExportToSheetsButton` / `ExportToSheetsModal` for Google Sheets export (modal mounted globally in `__root.tsx`).

### Tabs

`tabs tabs-border` with `tab-active`. The active tab underline is forced to `primary` by an override in `app.css` (DaisyUI defaults to currentColor). Tab switches update the URL search param.

### Modals

Use the custom `src/client/components/Modal.tsx`, NOT DaisyUI's `modal` class:

```tsx
<Modal maxWidth="max-w-lg" onClose={handleClose} labelledBy="title-id">
  <h2 id="title-id" className="text-lg font-semibold">
    Title
  </h2>
  {/* body */}
</Modal>
```

It renders a `fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4` overlay with a `card bg-base-100 border border-base-300 shadow-xl` panel and Escape-to-close. `max-w-sm` is the default; pass wider `maxWidth` for forms.

### Forms

TanStack Form with DaisyUI fields:

- Text inputs: a `<label className="input input-bordered ...">` wrapper, optionally with a leading lucide icon and a bare inner `<input>`; validation failure adds `input-error`.
- Selects: `select select-bordered` (`select-sm` in toolbars).
- Field errors: `<p className="text-sm text-error">` below the field, driven by helpers in `src/client/lib/forms.ts` (`getFieldError`, `shouldValidateFieldOnChange`).
- Submit: `btn btn-primary`, disabled while submitting, with a `loading-spinner` or `Loader2 animate-spin` icon.
- Filter panels use a draft/applied model with explicit Apply and Clear buttons (each applied filter can trigger a billed DataForSEO call), see `src/client/features/domain/components/DomainFilterPanel.tsx`.

### Alerts

Custom restyled alerts (not DaisyUI defaults): `alert alert-warning`, `alert-info`, `alert-success`, `alert-error` use a 70% tinted border and 40% tinted background in light mode (60% / 20% in dark). Base class `alert` is `flex gap-3 rounded-lg border p-4 text-base-content/70`.

### Charts

recharts conventions (see `BacklinksPageCharts.tsx`, `RankTrackingTrendChart.tsx`):

- `LineChart` / `AreaChart`, `type="monotone"`, `dot={false}`, `strokeWidth={2}`.
- Grid: `CartesianGrid strokeDasharray="3 3" stroke="currentColor"` with `opacity={0.1}` on the container.
- Series colors are the fixed palette: blue `#2563eb`, teal `#14b8a6`, green `#16a34a`, red `#ef4444`, amber `#f59e0b`. Assign in a consistent order.
- Grid, axis, fill, and tooltip theming flows from the `--trend-*` CSS variables in `app.css` (with dark overrides); read them in components instead of hardcoding.
- Measure width from the container (`useChartWidth` ref hook); chart height is around 220px.
- Empty data renders a dashed placeholder box with copy like "No history yet", never an empty axis.

### Toasts

sonner `<Toaster position="bottom-right" mobileOffset={{ bottom: 100 }} />` is mounted once in `__root.tsx`. Usage pattern in mutation handlers: `toast.error(getStandardErrorMessage(error, "fallback message"))`.

### Icons

lucide-react only, PascalCase imports, sized with `size-4` by default (`h-5 w-5` in the top bar, `size-3.5` in dense toolbars). Icons pair with labels in nav, buttons, and menus; icon-only buttons need `aria-label`. The one custom SVG is `src/client/features/gsc/GoogleGlyph.tsx` (Google "G" for GSC surfaces).

### Segmented toggles

`src/client/components/SegmentedToggle.tsx` for view/device/range switches: `inline-flex rounded-lg bg-base-300 p-0.5` well, active item `bg-primary/20 text-primary shadow-sm`, inactive `btn-ghost text-base-content/40`. Follow the same idiom for new pill toggles.

## States

- **Loading**: skeleton mirrors of the real layout (`skeleton h-8 w-52`, skeleton cards/tables, `aria-busy`), or an inline `Loader2 animate-spin`. See `BacklinksPageStates.tsx`.
- **Empty**: `rounded-xl border border-dashed border-base-300 p-10 text-center text-sm text-base-content/55` with a short explanation and, where useful, the action that produces data. See `BacklinksPageEmptyTableState.tsx`.
- **Error**: `rounded-2xl border border-error/30 bg-error/5` panel with the icon in a `bg-error/10` tile and a `btn btn-sm` Retry; page-level failures use `alert alert-error`.

## Responsive and mobile

- Breakpoint `md` separates mobile from desktop shell (sidebar, top bar, panel cutout). Grids collapse: cards `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`, scorecards `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`, toolbars `flex-col lg:flex-row`.
- Tables scroll horizontally (`overflow-x-auto`); never shrink text to fit.
- `pb-safe` / `pt-safe` utilities handle notched devices; the chat TabBar uses the `.dock` flex override for Safari's toolbar.
- Inputs stay at 16px to prevent iOS zoom.

## Do's and don'ts

Do:

- Use design tokens and their opacity modifiers for all colors.
- Keep both themes (`seotool`, `seotool-dark`) in sync when touching `app.css`.
- Use `AppDataTable`, `Modal`, `SegmentedToggle`, and the table toolkit instead of raw equivalents.
- Put table/tab/page state in URL search params with `replace: true`.
- Use `font-mono` + `tabular-nums` for numbers and URLs.
- Mirror the real layout with skeletons; never block on spinners for whole pages.

Don't:

- Don't hardcode hex colors in components (chart series colors are the only exception).
- Don't use DaisyUI's `modal` class; the custom `Modal` is the one true modal.
- Don't add webfonts to the SaaS app; it uses the system stack.
- Don't import marketing styles (`.itc-*`, fumadocs tokens) into the app, or app tokens into `web/`.
- Don't introduce shadows for depth on static surfaces; the design is flat with hairline borders.

## Appendix: other styled surfaces

Two other surfaces in this repo are deliberately NOT part of this design system:

- **Marketing site (`web/`)**: a separate TanStack Start app, dark-only "Dark Command Center" theme. Key tokens: canvas `#0a0b14`, surface `#12141f`, ink `#ebedf2`, hairline `#1e2030`, cyan accent `#00e5ff`, orange CTA `#ff5600`. Fonts: Inter (body), Space Grotesk (display), JetBrains Mono (eyebrows/data). All component styles are plain CSS scoped under `.itc` in `web/src/components/landing-page.css`, with page-specific additions in `web/src/components/free-tools.css` (free tools pages, same `.ft-` conventions), plus fumadocs CSS variable bridges in `web/src/styles/app.css`. It is intentionally more dramatic (glows, gradient borders) than the product UI. Never mix the two systems.
- **`badseo/`**: a static light-themed fixture microsite used as an audit demo target (navy `#0c1b3a` on paper `#e7ecf4`, IBM Plex). It exists for testing, not as a style reference.
