# Reference: "VS Goods" (website section)

Rebuild the Team section from vs-goods.store as a component in my project: same structure, hierarchy, layout and motion, but made with my project's own components, tokens and content.

- Reference: VS Goods — a website section from Craftwork Inspiration
- Type: Team
- Live site: https://vs-goods.store/
- Reference image: https://craftwork-files.b-cdn.net/bunny-s3-v2/previews/74edd324-dedb-493f-8050-4f438971ee60/vs-goods.store_-3-1.png
- Craftwork page: https://craftwork.design/curated/section/vs-goods-7522
- Tags: Team, Animated, Pastel
- Notes: Plug-and-play mockups created by hot designers for real creators.

## Study the reference first
1. Open https://vs-goods.store/. Use the browser tools you have (Playwright / Chrome MCP, Cursor's browser, or a fetch of the HTML and CSS).
2. Find the section that matches the reference image — it is the Team section. Scroll the page and compare against the image until you have the exact block, then note its selector.
3. Inspect that section's DOM and computed styles: structure, grid and breakpoints, font sizes and weights, spacing, colors, radii, image treatment. Check it at 1440, 768 and 390 px — rebuild its real tablet and mobile layout.
4. Motion: scroll it into view several times and hover every element. Write down each animation's trigger, properties, duration, delay, easing and stagger, reading the values from the styles and scripts.
5. Download the reference image into a temporary folder (not into the project) and look at it at full size. Measure proportions, spacing and alignment on it instead of eyeballing.
If vs-goods.store is down or the section has changed, work from the reference image alone and tell me.

## Build it on this project's design system
1. Explore this project before writing code. Find its design system: tokens (CSS variables, Tailwind theme/config, theme files), UI components (Button, Card, Badge, Input, Tabs, Dialog…), typography styles, spacing scale, icon set, image component and the animation library already in use. Write down what you'll reuse.
2. Build with those components and tokens. Don't hardcode colors, font sizes, radii or shadows; if the reference needs a value the system doesn't have, add it as a token next to the existing ones and tell me.
3. Follow the project's conventions: framework, folder structure, file naming, styling approach, i18n, data loading. Don't add a dependency when the project already has one for the job (e.g. use its existing animation library).
4. Take the idea, not the brand: don't copy logos, trademarks, product names, copy text, photos or illustrations from the original. Use my project's content, or placeholders of the same size and mood that I can replace.
5. Motion: animate transform, opacity and filter only; keep durations and easings as shared values; trigger entrances once; respect `prefers-reduced-motion`; the UI must work without JavaScript animation.
6. Responsive down to 360 px with no horizontal scroll, visible `:focus-visible` states, touch targets of at least 44 px, semantic markup and alt text.

## The code
- One component (plus small sub-components if needed), with its content passed as typed props or a data object, not hardcoded in JSX.
- Place it where I asked; if I didn't, create it next to the project's other sections and ask where to mount it.
- Compare with the reference at 1440, 768 and 390 px, motion included, and fix differences before finishing.

## Settle before you start (ask me if unclear)
- Which page should the section go on, and what content should it show?
- Keep the reference's motion as is, or tone it down?

## When you're done
Report what you built and where, which existing components and tokens you reused, which tokens you added, the motion you implemented (with timings), placeholders I need to replace, and any differences from the reference you couldn't close.
