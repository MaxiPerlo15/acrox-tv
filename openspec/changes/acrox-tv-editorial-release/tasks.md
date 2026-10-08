# Tasks: Acrox TV Editorial Release

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 760–980 across three follow-up slices |
| 400-line budget risk | High overall; each slice ≤400 |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Exact PR Order

| Unit | Goal | PR / base / limit |
|---|---|---|
| 1 | Canonical route and shared shell | `feat/acrox-tv-prototype-shell` → `feat/acrox-tv-editorial-release` at `05aad18`, ≤260 |
| 2 | Template and truthful media | `feat/acrox-tv-prototype-media` → PR 1 branch, ≤380 |
| 3 | Home, assets, ribbon, visual proof | `feat/acrox-tv-prototype-home` → PR 2 branch, ≤390 |

No new `size:exception`: retarget/rebase any child showing its parent’s diff.

## Completed Tracker History (not re-planned)

- [x] 0.1 The seven original tracker slices (registry, scoped YouTube/API, direct pages, directory, media states/discovery) are integrated at `05aad18`.

## Phase 1: Canonical Route and Shared Shell (PR 1)

- [ ] 1.1 RED: extend `tests/contracts/acroxtv-feed.route.test.ts` and `tests/e2e/acroxtv-editorial.spec.ts` for direct `/alta-data-te-tire` (read-only), no `/alta-data` (read-only) alias, and shared `Navbar`/`Footer` after refresh.
- [ ] 1.2 GREEN: only if tracker behavior diverges, align `src/domain/programs.ts`, `src/infrastructure/program-media-sources.ts`, `src/app/[slug]/page.tsx`, and `src/app/sitemap.ts` to the canonical Alta slug and registered playlists.
- [ ] 1.3 Update `src/components/ProgramPage.tsx` to use real `Navbar`/`Footer` with `anchorPrefix="/"`; run focused Playwright tests.

## Phase 2: Shared Program Template and Media (PR 2)

- [ ] 2.1 RED: add `tests/e2e/acroxtv-editorial.spec.ts` coverage for one shared template, real YouTube episode thumbnails/links, no program live panel, and no sibling/producer fallback.
- [ ] 2.2 GREEN: reshape `src/components/ProgramPage.tsx` and `src/components/AcroxTvMediaSection.tsx` around `EpisodeItem`; render Instagram only as explicit unavailable/error, never global-profile media.
- [ ] 2.3 REFACTOR: add namespaced program-page rules in `src/app/globals.css` using existing Acrox tokens, labels, H1/body hierarchy, Exo 2, and Montserrat; verify keyboard and mobile paths.

## Phase 3: Approved Home and Sponsor Presentation (PR 3)

- [ ] 3.1 RED: cover exactly two canonical cards, verified `/alta-data-logo.png`/neutral Más fallback, sponsor focus/hover pause, and reduced-motion behavior in `tests/e2e/acroxtv-editorial.spec.ts`.
- [ ] 3.2 GREEN: update `StreamingSection.tsx`, `ProgramDirectoryCard.tsx`, `SponsorRibbon.tsx`, and scoped `globals.css`; render one shared animated duplicated track only for approved sponsors, otherwise the honest static state.
- [ ] 3.3 Compare desktop and mobile screenshots with `prototypes/acrox-tv-v2/index.html`; run `npm run test:e2e`, lint, typecheck, and build per slice before its chained PR.
