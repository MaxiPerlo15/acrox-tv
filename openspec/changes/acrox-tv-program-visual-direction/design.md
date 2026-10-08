# Design: Acrox TV Program Visual Direction

## Technical Approach

Keep the current App Router routes, shared `ProgramPage`, `Navbar`, `Footer`, and `ProgramMediaSection`. Move visual ownership into `PROGRAMS`: an optional program cover and optional approved sponsor list. With an approved program cover, render only that program's portrait cover; without one, retain an honest name/summary-only waiting state. No sponsor assets are supplied, so keep sponsor waiting surfaces; do not fall back to the Alta logo, generic sponsors, or invented artwork. This implements the delta's directory, asset-fidelity, and sponsor-placement requirements.

## Architecture Decisions

| Decision | Options / trade-off | Decision and rationale |
|---|---|---|
| Asset ownership | Shared home constants reuse obsolete sponsors vs. registry-owned inputs | Remove `APPROVED_SPONSORS` and place optional cover/sponsors on each program. The direct page receives only its registry entry, preventing cross-program or home leakage. |
| Approved covers and absent assets | Reuse home logos/decorative cells vs. separate program-owned covers | User confirmed `ADTT 1.jpg` for Alta Data and `Más que nutrición 1.jpg` for Más que Nutrición. Convert them to WebP, render each uncropped in its direct-page hero, keep the home logo mapping separate, and retain the name/summary-only fallback when no cover exists. Sponsors still have no approved identities and remain in a static waiting state. |
| Supplied sponsors | Replace carousel vs. preserve its accessible behavior | Reuse `SponsorRibbon` only when a program has approved assets; retain its keyboard pause and reduced-motion rules. |
| Placement | Insert inside media cards vs. after media section | Render one ribbon after `ProgramMediaSection` and before the existing footer. This preserves media ownership, card order, previews, and responsive layout. |
| Asset conversion and cleanup | Publish all incoming images vs. stage privately | Convert all 16 incoming ZIP images to WebP in `~/Downloads/infoparawebacrox-webp/` with a source/output manifest. Copy only the two approved covers into `public/programs/covers/`; do not publish the other 14 unassigned images. Do not delete legacy assets, prototypes, or untracked logos. |

## Data Flow

```text
PROGRAMS (coverSrc?, sponsors?)
       |                         
Home -> StreamingSection -> two ProgramDirectoryCards (no sponsor surface)
       |
/[slug] -> ProgramPage -> hero cover or neutral state
                         -> ProgramMediaSection (unchanged)
                         -> SponsorRibbon (current program only)
                         -> shared Footer
```

The direct route continues to validate the slug, derive metadata, and pass the matching registry object. No feed, API, routing, or shell data flow changes.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/domain/programs.ts` | Modify | Add optional program-owned `coverSrc` with only the two confirmed portrait WebPs; leave `sponsors` absent. Retain `coverLogoSrc` for the unchanged directory card only, never as a hero cover. |
| `src/components/sections/home/StreamingSection.tsx` | Modify | Remove the sponsor import, obsolete constant, and ribbon render; retain the exact two-card map. |
| `src/components/ProgramPage.tsx` | Modify | Render cover-or-waiting hero and one program-owned ribbon after media, before the unchanged footer. |
| `src/components/SponsorRibbon.tsx` | Modify | Accept the current program's sponsors; make the empty branch a polished static semantic state and retain the populated carousel's accessibility contract. |
| `src/app/globals.css` | Modify | Style neutral hero and sponsor waiting surfaces within existing CSS/breakpoints; keep populated marquee reduced-motion rules and prevent mobile overflow. |
| `tests/e2e/acroxtv-editorial.spec.ts` | Modify | Replace obsolete home/approved-logo assertions with RED-first directory, per-program hero, sponsor ownership, ordering, and reduced-motion contracts. |
| `tests/e2e/acroxtv-program-media-preview.spec.ts` | Modify | Preserve preview/media-isolation assertions and add placement/no-overflow coverage around the appended sponsor surface. |
| `tests/e2e/acroxtv-program-polish.spec.ts` | Modify | Preserve footer parity and verify the new static surfaces do not break mobile or shared-shell polish. |

## Interfaces / Contracts

```ts
type ProgramSponsor = { name: string; logoSrc: string };
type Program = {
  slug: string;
  name: string;
  summary: string;
  coverLogoSrc?: string; // existing home-directory artwork only
  coverSrc?: string;
  sponsors?: readonly ProgramSponsor[];
};
```

`coverSrc` points to the approved WebP portrait for each current program; `sponsors` remains omitted. `coverLogoSrc` remains limited to the unchanged directory card and is never selected by `ProgramPage`. A cover belongs only to its program and displays without cropping at responsive sizes; populated sponsor images would require separate approval of name and source. The hero waiting branch still exposes only `name` and `summary`; the sponsor waiting branch exposes no logos or brand names.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | N/A | No unit runner is configured. |
| Integration | N/A | No integration runner is configured. |
| E2E | Home removal; absent/present ownership contracts; program-page order; keyboard/reduced motion; 380px overflow; media and footer regression | Write failing Playwright assertions first in the three existing suites, implement minimally, then run `npm run test:e2e`. |

## Threat Matrix

N/A — no routing, shell command, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary changes. Existing routes and shell remain intact.

## Migration / Rollout

No migration required. The sponsor absent state remains; add only the two confirmed program covers and an uncropped portrait hero. The other converted files stay outside the public site pending explicit assignments. Roll back the hero/registry/cover work unit without altering the preserved home card logo or sponsor state.

## Open Questions

- [x] User confirmed `ADTT 1.jpg` and `Más que nutrición 1.jpg` as the respective program covers.
- [ ] Guillermo must provide approved program-specific sponsor identities/assets before populated sponsor states can be enabled.
