## Exploration: acrox-tv-program-visual-direction

### Current State

The home page renders the two registered `PROGRAMS` through `StreamingSection`, then appends one shared `SponsorRibbon` populated with five legacy sponsor logo files. Direct program routes are generated from the same registry and render the shared `ProgramPage` template.

Each program page currently renders a generic `.program-hero` with program name/summary plus a `coverLogoSrc` identity tile when available. `Alta Data ¡Te Tire!` uses `/alta-data-logo.png`; `Más que Nutrición` has no cover asset and falls back to text. `ProgramMediaSection` renders the latest episode followed by exactly three cards—`Más visto`, `Episodios`, and `Instagram`—inside `.program-media-row__cards`.

The requested follow-up is visual-only: remove the home sponsor band; add a program-owned sponsor strip after all three media cards on each direct program page; and replace the hero identity tile with an individually specific cover-art-ready waiting state until Guillermo supplies real per-program covers. No new cover-art or program-specific sponsor assets have been provided. Existing generic/icon/logo assets and the five current sponsor assets must not be reused for the new program hero or program-owned sponsorship direction.

### Affected Areas

- `src/components/sections/home/StreamingSection.tsx` — remove the home-level `SponsorRibbon` and its legacy `APPROVED_SPONSORS` mapping while preserving the two-card directory.
- `src/components/ProgramPage.tsx` — replace the current `coverLogoSrc` hero identity rendering and place a program-owned sponsor surface after `ProgramMediaSection`.
- `src/components/SponsorRibbon.tsx` — likely extend the existing accessible/reduced-motion ribbon to express an honest prepared/waiting state when a program has no supplied sponsors; do not invent names or logos.
- `src/domain/programs.ts` — likely clarify the registry contract for future per-program cover/sponsor assets without fabricating values; route slugs, names, summaries, and canonicalization remain unchanged.
- `src/app/globals.css` — update `.program-hero`, hero waiting-state styling, and `.sponsor-ribbon` placement/state styling; preserve responsive behavior and the existing three-card media layout.
- `tests/e2e/acroxtv-editorial.spec.ts` — current assertions encode the old home sponsor band, old program-page absence of sponsors, current logo asset, and current five-logo marquee. These are direct red tests for the new direction and should be replaced or amended during strict-TDD apply.
- `tests/e2e/acroxtv-program-media-preview.spec.ts` — existing desktop/mobile assertions prove the three media cards and their order/layout; add placement assertions without changing media ownership behavior.
- `tests/e2e/acroxtv-program-polish.spec.ts` — preserves shared shell/footer and mobile overflow; useful regression coverage for the redesigned hero and appended sponsor state.
- `tests/e2e/acroxtv-wp2-program-isolation.spec.ts` and `tests/e2e/acroxtv-contracts.spec.ts` — remain regression coverage for program isolation and canonical routes, not implementation targets.
- `openspec/specs/acrox-tv-editorial-experience/spec.md` — the new proposal should modify this capability’s visual/asset and sponsor requirements; `openspec/specs/program-scoped-media/spec.md` should remain untouched unless implementation discovery proves a boundary issue.

### Approaches

1. **Shared template with explicit per-program waiting states** — keep `ProgramPage` and `ProgramMediaSection` shared, pass future program-owned assets through the registry, render a neutral program-specific hero preparation panel and sponsor preparation strip when arrays/assets are absent.
   - Pros: preserves route/template reuse, keeps ownership explicit, supports later asset insertion without another layout rewrite, and isolates the change from media fetching.
   - Cons: requires careful distinction between “asset not supplied” and “asset failed,” plus updates to existing visual E2E contracts.
   - Effort: Medium

2. **Dedicated hero and sponsor components per program** — create separate page-level compositions for Alta Data and Más que Nutrición, each owning its future cover and sponsor configuration.
   - Pros: maximum per-program art direction freedom immediately.
   - Cons: duplicates shared shell/layout, increases drift and route-specific testing, and is premature while no real assets exist.
   - Effort: High

### Recommendation

Use the shared-template approach. Keep `PROGRAMS`, canonical routes, Navbar/Footer, and the existing media subtree unchanged; remove only the home sponsor ownership, append one sponsor strip after `ProgramMediaSection`, and define explicit neutral waiting states that use only each program’s existing name and summary. Treat future cover and sponsor inputs as program-owned registry data, but leave them absent until supplied. Update/add Playwright tests first under `npm run test:e2e`, covering: no home sponsor region; exactly one sponsor region below the three media cards on each direct route; honest no-logo/no-invented-name waiting copy; no current generic hero asset requests; two-card directory and route parity; desktop/mobile ordering and no overflow.

### Risks

- Existing editorial tests assert the opposite sponsor placement and current `alta-data-logo.png` hero behavior; leaving them unchanged will make the intended TDD RED phase look like a regression unless the proposal explicitly replaces those contracts.
- The current `SponsorRibbon` empty path renders neutral cells rather than a clear waiting message, and `.sponsor-ribbon-empty` appears to be unused; accessibility and honesty require a deliberate empty-state contract.
- The current hero CSS is shaped around a compact identity tile, including a mobile absolute tile; a cover-art-ready waiting panel needs responsive redesign without changing the shared shell.
- Legacy sponsor files remain in `public/sponsors/` and must not be accidentally retained through a shared default or copied into per-program configuration.
- `.codegraph/`, `openspec/`, and other unrelated modified/untracked files already exist in the checkout; only the new exploration artifact should be added.

### Ready for Proposal

Yes. The scope is sufficiently bounded for proposal/spec work: amend `acrox-tv-editorial-experience`, leave `program-scoped-media` intact, and explicitly record that no cover or program-specific sponsor assets are available yet. Apply should remain strict TDD with Playwright (`npm run test:e2e`).
