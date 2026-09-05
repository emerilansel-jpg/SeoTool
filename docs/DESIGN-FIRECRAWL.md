# DESIGN.md: Firecrawl.dev (clone reference)

## Source

- URL: https://www.firecrawl.dev/
- Capture date: 2026-08-31
- Evidence: firecrawl branding+images+markdown (confidence 0.925), full-page screenshot .firecrawl/firecrawl-screenshot.png

## Reference Screenshot

![Firecrawl homepage](./.firecrawl/firecrawl-screenshot.png)

## Design Summary

Developer-tool marketing with a blueprint/terminal personality: faint grid-cell backgrounds annotated with mono `[ SCRAPE ]`-style labels, a huge grotesk two-line headline whose second line carries the accent color, an interactive product widget embedded in the hero, logo marquees, bento feature grids, and high-energy but restrained motion. Flat surfaces, soft-gray secondary buttons, one saturated accent.

## Design Tokens (observed)

### Colors

| Role                    | Value                                           |
| ----------------------- | ----------------------------------------------- |
| primary / accent / link | #FF4C00 (orange-red)                            |
| secondary tint          | #F9C2AB                                         |
| background              | #F9F9F9                                         |
| text primary            | #262626                                         |
| secondary button        | #EFEFEF bg, #262626 text                        |
| grid lines              | light blue-gray, ~1px cells ~80px               |
| mono labels             | muted gray `[ 200 OK ]` markers at grid corners |

**SeoTool.im palette swap (required: different palette):** accent #7624f4 violet (dark-mode #9a6cff), background #fcfcfd, text #191b1e, grid lines base-300, secondary button base-200.

### Typography

- Font: Suisse (commercial grotesk). Substitute: system-ui stack, headings tracking-tight
- h1: 60px extrabold, two lines, second line in accent color
- h2: 52px bold with two-line pattern ("Fast, reliable, token-efficient." + accent line)
- body: 16px; mono for data labels/terminal text

### Spacing And Layout

- Base unit 4px; radius 4-10px (buttons 10px, cards 12-16px)
- Primary button: accent bg + subtle inset glow shadow; secondary: #EFEFEF flat
- Container ~1120px; generous section padding (~96-128px)

## Components

- Announcement pill banner (full-width rounded accent bar, centered text + underlined link with arrow)
- Nav: icon+wordmark left, center links (with dropdown carets), right: GitHub star chip + pill "Sign up"
- Hero: pill badge w/ arrow chip, 2-line headline, subhead with bold-highlighted phrase, primary+secondary CTA, interactive demo widget (input + segmented Search/Scrape/Map/Crawl tabs + circular accent arrow button), browser/editor mockup below with line numbers and accent syntax
- Grid bg with mono `[ ... ]` labels and small 4-point star accents at intersections
- Logo marquee (customer logos, duplicated track, seamless loop)
- Stats block under "Fast, reliable" heading
- Bento feature grid ("We handle the hard stuff")
- Use-case cards with visual chips
- FAQ accordion
- Footer: multi-column, subtle

## Page Patterns

Announcement → Nav → Hero (grid bg + demo widget) → browser mockup → Logo marquee → Feature sections (alternating) → Bento → Use cases → Logo marquee 2 → Testimonials → FAQ → Footer.

## Content Style

Verb-first, concrete: "Power AI agents with clean web data", "Start searching today". Bold key phrase inside subhead. Numbers as proof. No exclamation marks. CTA: "Start for free", "Setup for agents".

## Agent Build Instructions

1. Marketing = light base, near-black text, single violet accent, faint grid background with mono corner labels in the hero only.
2. Headline: two lines, second line accent color, 60px equivalent, tracking-tight.
3. Embed an interactive-looking product widget in the hero (segmented tabs + input + circular accent button) above a browser-mockup card.
4. Marquee: duplicate track for seamless CSS loop, pause on hover, edge fade mask.
5. Motion: staggered hero load-in, IntersectionObserver scroll-reveals, caret blink in terminal-style elements; all disabled under prefers-reduced-motion.
6. Buttons: accent filled rounded-[10px] with inset glow; secondary flat gray. Hover: slight scale/translate only.
7. NO fabricated logos/testimonials/stars: use real integrations (DataForSEO, Google, Bing, ChatGPT, Claude, Gemini, Perplexity, PayPal, GSC, GA4, MCP).

## Rerun Inputs

workflow: firecrawl-website-design-clone
source_url: https://www.firecrawl.dev/
target_stack: TanStack Start + Tailwind v4 + DaisyUI 5
output: docs/DESIGN-FIRECRAWL.md
