# Proposal: Acrox TV Program Visual Direction

## Intent

Replace generic Acrox TV sponsorship and identity treatment with truthful, program-owned visual surfaces. This prepares each direct program page for Guillermo's future cover and sponsor assets without inventing brands, people, or topics.

## Scope

### In Scope
- Remove the generic sponsor band from the home directory while retaining its two program cards.
- Replace each program hero identity tile with a cover-art-ready waiting state using only its known name and summary until a cover is supplied.
- Add one program-owned sponsor strip after `Episodios`, `Más visto`, and `Instagram`, before the shared footer; render a polished, explicit waiting state until program-specific sponsors exist.
- Define future cover/sponsor inputs as program-owned registry data and update Playwright contracts through strict TDD.

### Out of Scope
- Cover art or sponsor asset creation, invented logos/names, SEO, media acquisition, authorization, or new routes.
- Changes to media ownership, fetching, authorization, routes, Navbar/Footer, or the three media cards and their behavior.
- Removing legacy sponsor files unless later design proves a tracked asset is unused.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `acrox-tv-editorial-experience`: Program visual/asset fidelity and sponsor requirements become program-owned, truthful waiting-state behavior; the home sponsor carousel is removed.

## Approach

Retain the shared `ProgramPage` template and canonical registry. Remove home-level sponsor ownership, add explicit absent-asset states to the shared hero and sponsor surfaces, and reserve registry fields for future per-program inputs. Keep the media subtree isolated and unchanged.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/components/sections/home/StreamingSection.tsx` | Modified | Remove home sponsor band. |
| `src/components/ProgramPage.tsx` | Modified | Cover-ready hero and appended sponsor strip. |
| `src/components/SponsorRibbon.tsx` | Modified | Accessible program-owned waiting state. |
| `src/domain/programs.ts` | Modified | Future per-program visual inputs. |
| `src/app/globals.css` | Modified | Responsive waiting-state and placement styling. |
| `tests/e2e/acroxtv-*.spec.ts` | Modified | Red-first visual, placement, shell, and mobile contracts. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Placeholder implies unsupplied facts | Med | Permit only known name and summary. |
| Visual changes disrupt shell/media layout | Med | Preserve shared components; test ordering, routes, and mobile overflow. |
| Legacy assets leak into program pages | Med | No default sponsor/cover assets; remove only proven-unused tracked files. |

## Rollback Plan

Revert the visual work unit to restore the prior home sponsor band and hero tile; retain no new data migrations or route changes. Restore prior E2E contracts with the rollback.

## Dependencies

- Guillermo must supply approved per-program cover and sponsor assets for populated states.

## Success Criteria

- [ ] Home shows exactly the existing two program cards and no sponsor region.
- [ ] Each direct program page shows one honest cover and sponsor waiting state in the specified order.
- [ ] Canonical routes, shared shell, three media cards, and media isolation remain unchanged.
- [ ] Strict-TDD Playwright coverage passes via `npm run test:e2e` after implementation.
