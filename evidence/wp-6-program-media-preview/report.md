# Program Media Preview Evidence

## Candidate

- Base: `043433e`
- Implementation and raw-evidence commit: `5939f93`
- Branch: `feat/acrox-tv-s1-program-media-preview`
- Scope: direct program media only; no playlist registry, source service, API, or global-feed changes.

## TDD Record

- Safety net: `npm run test:e2e -- tests/e2e/acroxtv-wp2-program-isolation.spec.ts` — 6 passed.
- RED: `tests/e2e/acroxtv-program-media-preview.spec.ts` — 10 expected failures before production changes.
- GREEN/refactor: focused preview contract — 13 passed across Chromium, Firefox, WebKit, and mobile.
- Triangulation: latest preview checks Escape and outside interaction; carousel checks a distinct most-viewed order and keyboard advancement; mobile checks no horizontal overflow.

## Verification

| Command | Result | Raw evidence |
| --- | --- | --- |
| `npm run test:contracts` | 23 passed | `raw/contracts.txt` |
| `npm run test:e2e` | 171 passed | `raw/e2e.txt` |
| `npm run lint` | passed | `raw/lint.txt` |
| `npx tsc --noEmit` | passed | `raw/typecheck.txt` |
| `npm run build` with documented public test variables | passed | `raw/build.txt` |
| `git diff --check` | passed | `raw/diff-check.txt` |

The E2E run logs expected unavailable-Instagram messages and mocked-thumbnail 404 responses; neither changes the passing result.

## Captures

- `desktop.png`: 1440×1100 capture of `/alta-data-te-tire` with deterministic scoped feed interception.
- `mobile.png`: 375×812 capture of the same scoped route and feed interception.

## Rollback

Revert `5939f93` to remove only program-page preview/carousel behavior, its contracts, and this evidence set. The registry, source adapters, API routes, global Acrox TV feed, and `ProgramPage` footer remain unchanged.
