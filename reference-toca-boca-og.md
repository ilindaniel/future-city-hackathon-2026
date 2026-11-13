# Reference: "Toca Boca" (OG image)

Build an Open Graph image for my project in the style of this reference: same composition and typographic idea, but my brand, fonts and colors, and generated from code so every page gets its own image.

- Reference: Toca Boca — a OG image from Craftwork Inspiration
- Original source (tocaboca.com): https://www.tocaboca.com/
- Reference image (1200×630): https://curated-images.b-cdn.net/objects/a8d8cc15c3ba549cb7d712487b54965f0653a882b86304348910c99531d34769/5e71218116804d0a89017fd7ee370169b15618ef3349bd756ca9937ce2459813/retina-v1/detail-image-1200.webp?token=6M3MK4S7yegR57UGtLTIp8O5rX3fH-hICHK2Pbfu6gA&expires=2109963367
- Craftwork page: https://craftwork.design/curated/og-image/toca-boca-22c266

## Study the reference first
1. Download the reference image into a temporary folder (not into the project) and look at it at full size. Measure proportions, spacing and alignment on it instead of eyeballing.
2. Open https://www.tocaboca.com/ and check how the site uses this image (`og:image` meta, per-page variants).
3. Describe the composition: grid, margins, where the title, logo and supporting elements sit, type sizes relative to the 1200×630 canvas, background treatment.

## Build it on this project's design system
1. Explore this project before writing code. Find its design system: tokens (CSS variables, Tailwind theme/config, theme files), UI components (Button, Card, Badge, Input, Tabs, Dialog…), typography styles, spacing scale, icon set, image component and the animation library already in use. Write down what you'll reuse.
2. Build with those components and tokens. Don't hardcode colors, font sizes, radii or shadows; if the reference needs a value the system doesn't have, add it as a token next to the existing ones and tell me.
3. Follow the project's conventions: framework, folder structure, file naming, styling approach, i18n, data loading. Don't add a dependency when the project already has one for the job (e.g. use its existing animation library).
4. Take the idea, not the brand: don't copy logos, trademarks, product names, copy text, photos or illustrations from the original. Use my project's content, or placeholders of the same size and mood that I can replace.
5. Motion: animate transform, opacity and filter only; keep durations and easings as shared values; trigger entrances once; respect `prefers-reduced-motion`; the UI must work without JavaScript animation.
6. Responsive down to 360 px with no horizontal scroll, visible `:focus-visible` states, touch targets of at least 44 px, semantic markup and alt text.

## The image
- Generate it from code at 1200×630: in Next.js use `next/og` (`ImageResponse`) in `opengraph-image.tsx` or a route handler; otherwise Satori/`@vercel/og` or the framework's equivalent.
- Use the project's brand tokens, logo and fonts (load the font files explicitly — the renderer can't see CSS). Title and optional subtitle come from the page's metadata.
- Long titles must wrap and shrink gracefully; test with a short, a long and a non-Latin title.
- Wire it into the page metadata (`og:image`, `twitter:image`, width, height, alt).

## Settle before you start (ask me if unclear)
- One template for all pages, or variants per page type (blog post, product, docs)?

## When you're done
Report what you built and where, which existing components and tokens you reused, which tokens you added, the motion you implemented (with timings), placeholders I need to replace, and any differences from the reference you couldn't close.
