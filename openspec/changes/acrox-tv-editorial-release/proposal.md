# Proposal: Acrox TV Editorial Release

## Intent

Ship the user-approved focused Acrox TV prototype as the production experience: a two-program home entry point and faithful, direct program pages without misattributing media or replacing Acrox's existing visual system.

## Scope

### In Scope
- Mandatory two-card Acrox TV home section and reusable program-page template for `/alta-data-te-tire` and `/mas-que-nutricion`.
- The real shared `Navbar` and `Footer` on both program pages; retain existing Acrox labels, H1/body hierarchy, CSS, and project fonts.
- Use supplied or appropriate real assets only; do not invent assets, sponsors, people, or brand material.
- Accessible animated sponsor carousel with keyboard-safe motion and reduced-motion support.
- Registry-bound YouTube and Instagram API integration, source-scoped by program; mapped playlists remain Alta Data `PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y` and Más `PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq`.

### Out of Scope
- Live streams until channel ownership and canonical ID are confirmed.
- Instagram media until each professional account is Page-linked and authorized; producer Instagram remains global-only.
- Invented/fallback sibling media, CMS adoption, or `/acrox-tv/[slug]` routes.

## Capabilities

### New Capabilities
- `acrox-tv-editorial-experience`: Focused directory, direct program routes, shared Acrox shell, approved assets, and accessible sponsor carousel.
- `program-scoped-media`: Registry-governed YouTube/Instagram sources, ownership isolation, and explicit unavailable/stale/error states.

### Modified Capabilities
None — `openspec/specs/` has no baseline capabilities.

## Approach

Implement the approved two-card home and one shared template using existing design primitives and fonts. Keep public editorial data separate from server-only source configuration; allowlist slugs at `/api/acroxtv-feed/[slug]`, namespace provider/cache/proxy keys by program and source, and never accept provider IDs from the browser. Missing validation stays visibly unavailable, never cross-program.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/app/[slug]/page.tsx`, `src/components/*` | New/Modified | Direct pages, shared shell/template, carousel. |
| `src/domain/programs.ts`, `acroxtv-feed.ts` | New/Modified | Editorial and source contracts. |
| `src/app/api/acroxtv-feed/[slug]/route.ts`, `src/infrastructure/*` | New/Modified | Source-scoped providers, caching, authorization states. |
| `src/lib/env.ts`, `.env.example`, tests | Modified | Server-only configuration and isolation coverage. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Incorrect media attribution | Med | Registry-only IDs; no sibling/producer fallback. |
| Live/Meta authorization absent | High | Keep only the affected surface unavailable. |
| Prototype fidelity drifts | Med | Treat approved scope and existing Acrox primitives as mandatory. |

## Rollback Plan

Revert each merged release slice independently; restore the prior home surface and remove new direct routes/API registrations. Disable only the affected provider source if authorization or ownership is revoked.

## Dependencies

- Live owner and canonical channel ID before live assignment.
- Per-program Instagram professional account, linked Facebook Page, validated token/permissions, owner, and fallback URL.

## Success Criteria

- [ ] Both direct pages use the real shared `Navbar`/`Footer`, Acrox hierarchy/CSS/fonts, and the shared template.
- [ ] Home contains only the approved two-card section; assets and sponsors are real/supplied and carousel accessibility/motion behavior works.
- [ ] Each program returns only its registered YouTube/Instagram media; unavailable sources never show producer or sibling content.
