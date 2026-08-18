# Program Media Dashboard Evidence

## Candidate

- Base: `4420ae8`
- Product commit: `55f4e33ec21ab04a1d1460b3ed7d28b51995bf50`
- Branch: `fix/acrox-tv-s1-program-media-dashboard`
- Scope: direct-program media composition only. The registry, YouTube client/service/API, home feed, Instagram integration, and shared footer were not modified.

## TDD Record

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Rebuild the direct-program media dashboard | `tests/e2e/acroxtv-program-media-preview.spec.ts` | E2E | 16 passed before the new contracts | 6 cross-browser failures: dashboard landmark absent | 22 focused passes | Desktop geometry plus mobile reflow contracts; existing preview, carousel, isolation, unavailable-Instagram, and Footer scenarios remain covered | Restored the legacy media landmark around the new dashboard after the full suite exposed its established accessibility contract |

## Verification

| Command | Result |
| --- | --- |
| `npm run test:contracts` | 23 passed |
| `npm run test:e2e -- tests/e2e/acroxtv-program-media-preview.spec.ts` | 22 passed |
| `npm run test:e2e` | 180 passed |
| `npm run lint` | passed |
| `npx tsc --noEmit` | passed |
| `NEXT_PUBLIC_* test values npm run build` | passed |
| `git diff --check` | passed |

## Captures

- `desktop-dashboard.png`: 1440px dashboard-only capture of `/alta-data-te-tire` with a deterministic, program-scoped feed fixture.
- `mobile-dashboard.png`: 375px dashboard-only capture of the same route and fixture.
- The fixture is local for deterministic evidence; production renders the latest scoped YouTube `thumbnailUrl` as a cover image.

## Review Notes

- The lead is a full-width 16:9 preview with the scoped YouTube nocookie player replacing that same media container on activation.
- Desktop has aligned Más visto, Episodios, and honest unavailable Instagram panels. Mobile stacks those panels without horizontal overflow.
- Both YouTube panes retain keyboard-operable carousels; the Footer and legacy `Programación del programa` landmark are preserved.

## Rollback

Revert `55f4e33ec21ab04a1d1460b3ed7d28b51995bf50` to remove only this dashboard composition and its E2E contracts.
