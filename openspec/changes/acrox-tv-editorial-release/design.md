# Design: Acrox TV Editorial Release

## Technical Approach

Build the approved prototype as a focused presentation follow-up on committed tracker `feat/acrox-tv-editorial-release` (`05aad18`), not as a replacement architecture. Keep its finite root registry, guarded `/${slug}` App Router page, program-scoped API, source registry, and SWR isolation. Correct Alta Data’s canonical slug, then reshape the home and shared program template with the existing Acrox shell, CSS variables, Exo 2/Montserrat fonts, and real provider data. Program pages expose YouTube plus Instagram unavailable/error UI; live remains absent from the program presentation and the Navbar keeps its independent legacy live request.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Explicit duplicate pages vs existing root `[slug]` | Explicit files duplicate metadata/template code | Retain `src/app/[slug]/page.tsx`, `generateStaticParams`, `dynamicParams = false`, and registry guards; rename `alta-data` to `alta-data-te-tire` everywhere. No `/acrox-tv/[slug]` or legacy alias. |
| New visual shell vs shared production shell | Shared components constrain prototype-only styling | `ProgramPage` renders the real `Navbar` and `Footer`; pass `anchorPrefix="/"` so footer anchors return home. Extend only namespaced global classes and existing font/design tokens. |
| Fabricated art vs honest asset states | Some surfaces remain textual until delivery | Use verified files only (`/alta-data-logo.png` and existing Acrox marks). Missing Más que Nutrición or sponsor art renders named neutral UI; no generated people, logos, or sponsors. |
| JS carousel vs CSS marquee | CSS offers less runtime control | Keep one shared `SponsorRibbon` Server Component, rendered once by `StreamingSection`; duplicate only the visual track with `aria-hidden`, pause on hover/focus, and disable translation under reduced motion. With no approved sponsors, render a static unavailable message. |
| New media stack vs tracker contracts | Existing response still contains deferred `live` | Preserve scoped API/cache contracts and exact playlists; the shared template consumes episodes, ignores program `live`, and renders Instagram only as `unavailable` or `error`, without global-profile fallback. |

## Data Flow

    PROGRAMS → two home cards → /alta-data-te-tire | /mas-que-nutricion
         │                                      ↓
         └→ shared ProgramPage → /api/acroxtv-feed/[slug]
                                      ↓
       PROGRAM_MEDIA_SOURCES → YouTube adapter → scoped SWR → real episode UI
                                      └────────→ Instagram unavailable/error UI

## File Changes

| File | Action | Description |
|---|---|---|
| `src/domain/programs.ts` | Modify | Canonical slugs and typed editorial/artwork fields for both cards and one template. |
| `src/infrastructure/program-media-sources.ts` | Modify | Re-key Alta Data while preserving the two approved playlist IDs. |
| `src/app/[slug]/page.tsx`, `src/app/sitemap.ts` | Modify | Continue registry-derived direct routes, metadata, and discovery. |
| `src/components/sections/home/StreamingSection.tsx`, `ProgramDirectoryCard.tsx` | Modify | Exact two-card section; no home feed/live/social surfaces. |
| `src/components/SponsorRibbon.tsx` | Modify | Shared accessible marquee and honest empty state. |
| `src/components/ProgramPage.tsx` | Modify | One hero/media template with real shared shell and corrected footer navigation. |
| `src/components/AcroxTvMediaSection.tsx` | Modify | Real latest/most-viewed/episode presentation from `EpisodeItem`; Instagram state card only; no program live panel. |
| `src/app/globals.css` | Modify | Prototype layout/motion under existing Acrox tokens and responsive breakpoints. |
| `tests/contracts/*`, `tests/e2e/acroxtv-*.spec.ts`, `critical.spec.ts` | Modify | Canonical route, ownership, media, shell, motion, and responsive coverage. |

## Interfaces / Contracts

`PROGRAMS` remains the public source of truth. Artwork uses a discriminated contract: verified `{ kind: "image", src, alt }` or honest `{ kind: "text", label }`. `PROGRAM_MEDIA_SOURCES satisfies Record<ProgramSlug, ProgramMediaSource>` retains Alta Data `PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y` and Más `PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq`. Browser requests send only the slug.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Contract | Exact slugs/playlists, route collisions, scoped cache/API, zero provider calls for invalid slugs | Existing Playwright contract runner with provider fakes. |
| E2E | Two cards, direct refresh, shared Navbar/Footer, real episode titles/thumbnails/links, Instagram unavailable/error, no live/cross-program fallback | Mock provider responses; Chromium, Firefox, WebKit, and mobile. |
| Accessibility/visual | Keyboard cards/sponsor links, paused/reduced motion, readable neutral assets, responsive prototype fidelity | Playwright media emulation plus focused screenshots; then lint, typecheck, build. |

## Migration / Rollout

No data migration. Follow-up chain from `05aad18`: **A** canonical slug/contracts; **B** shared program template and scoped media UI; **C** home cards, asset policy, and SponsorRibbon. Keep each slice under 400 changed lines and target its predecessor. Roll back C for presentation/motion, B for page media/template, or A for route/source-key changes; cache keys naturally move with the slug and require no purge. Uncommitted fidelity-worktree changes are not baseline.

## Open Questions

- [ ] Non-blocking: approved Más que Nutrición and sponsor image files are not in `public/`; neutral states remain until supplied and reviewed.
