# DESIGN.md: OpenRouter.ai (clone reference)

## Source
- URL: https://openrouter.ai/
- Capture date: 2026-08-31
- Evidence: firecrawl branding+images+markdown (confidence 0.925), full-page screenshot at .firecrawl/openrouter-screenshot.png

## Design Summary
Developer-facing, data-dense, radically flat. One violet accent on near-white (light) / near-black (dark). Muted gray body text, never pure black/white. Hairline borders do the work shadows would do. Typography-led hierarchy: one huge headline, everything else small and quiet. Dense stat rows, favicon logo clouds, compact data cards with mono numbers.

## Design Tokens

### Colors (observed)
| Role | Light | Dark (inferred from lockup/text tokens) |
|---|---|---|
| primary / accent / link | #7624F4 | #7624F4 (same) |
| background | #FCFCFE | #03080A..#0d1117 range, near-black |
| text primary | #505456 (muted gray) | #b0b4b6 range, muted |
| border | #E8E8EA | rgba(255,255,255,0.08) |
| button secondary bg | #FCFCFE, text #03080A | inverted |
| button primary | bg #7624F4, text #FCFCFE, no shadow | same |

Single accent color. Success/error only in data contexts.

### Typography
- Font: Gordita / Jakarta (commercial); fallback: system-ui stack (keep existing stack, add tighter tracking on headings)
- h1: 56px bold; h2/section: 16px semibold; body: 16px; small labels: 12-13px
- Headings tight tracking, body relaxed leading; data numbers use mono/tabular figures

### Spacing And Layout
- Base unit 4px; section rhythm ~96-128px desktop
- Radius: 6px buttons/fields, 8-12px cards (inferred; site uses square-ish 0-6px, prefer 6-8)
- Shadows: none. Hairline 1px borders + background contrast only
- Container ~1152px (max-w-6xl equivalent)

## Components
- Navbar: slim, logo left, center links, "Sign Up" primary btn right; sticky, translucent blur
- Hero: h1 + subhead with inline links on key words + 2 CTAs (primary filled, secondary bordered with tiny logos inside) + trust microcopy
- Stat row: 4 big numbers (font-black) + small gray labels, no boxes
- Logo cloud: grayscale provider favicons, wraps
- Feature sections: alternating text/visual, bold title + 2-sentence copy + "Learn more" link
- Data cards: icon, name, "by provider", 2 key metrics with trend deltas
- Pricing: bordered cards, one highlighted with accent border, big price, checklist

## Page Patterns
Nav → Hero → Stats → Logo cloud → Feature alternates → Featured cards grid → CTA band → Footer (multi-column links, subtle). Everything SSR, semantic HTML.

## Content Style
Declarative and concrete: "Better prices, better uptime, no subscriptions." Numbers everywhere (300T+, 10M+, 80+, 500+). No exclamation marks, no buzzwords. CTA verbs: "Get API Key", "Discover Models", "View all".

## Agent Build Instructions
1. Map accent to --color-primary (#7624F4), keep existing dual DaisyUI themes; dark theme becomes default-look for marketing.
2. Replace gradient/glow marketing surfaces with flat bordered surfaces; muted text via base-content/70.
3. One accent only: no multi-hue feature icons; use neutral icons, accent on hover/active.
4. Hero: 56px h1, subhead with inline <a> on value words, primary+secondary CTA, stat row under.
5. Cards: hairline border, 6-8px radius, no shadow, hover = border-color change only.
6. Numbers: font-mono tabular-nums.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://openrouter.ai/
target_stack: TanStack Start + Tailwind v4 + DaisyUI 5
output: docs/DESIGN-OPENROUTER.md
