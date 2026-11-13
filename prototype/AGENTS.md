# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Product direction

- Keep the interface child-friendly without toy-like 3D art or decorative clutter.
- Use a full-viewport pixel-art Heilbronn scene with recognizable city, Neckar, vineyard, and experimenta cues.
- Animate separate cloud, grass, water, foreground, and Bobby layers with subtle stepped ambient motion. Do not move scene elements in response to pointer movement.
- Show Bobby's smiling sprite while voice mode is active.
- Provide a static reduced-motion state and prefer native browser animation over heavy runtime dependencies.
- Import offers through provider-specific HTTP adapters into a validated `public/data/offers.json` catalogue. Use browser automation only when a provider cannot be read reliably through normal HTTP requests.
