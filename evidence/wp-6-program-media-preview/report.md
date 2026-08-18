# Program Media Preview Evidence

## Candidate

- Base: `043433e`
- Base remediation commit: `5e76df7`
- Branch: `feat/acrox-tv-s1-program-media-preview`
- Scope: direct program media only; no playlist registry, source service, API, or global-feed changes.

## TDD Record

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Restore focus to the invoking latest-preview trigger | `tests/e2e/acroxtv-program-media-preview.spec.ts` | E2E | 13 passed | Focus assertions written before validation | 16 passed | Escape and outside-pointer close each return focus to the scoped latest trigger | None needed |
| Fill the intended latest-preview media container | `tests/e2e/acroxtv-program-media-preview.spec.ts` | E2E | 13 passed | Initial border-box dimension assertion failed in Chromium, Firefox, WebKit, and mobile | 16 passed | Desktop and mobile assert 16:9 container ratio plus iframe dimensions within the 2px border | None needed |

The RED dimension result exposed an invalid border-box expectation, not a product defect: the iframe intentionally fills the container's media area inside its 1px border. The corrected behavioral contract would fail if the player stopped filling that area or the container stopped preserving 16:9.

## Verification

| Command | Result | Raw evidence |
| --- | --- | --- |
| `npm run test:contracts` | 23 passed | `raw/contracts.txt` |
| `npm run test:e2e -- tests/e2e/acroxtv-program-media-preview.spec.ts` | 16 passed | `raw/e2e-focused.txt` |
| `npm run test:e2e` | 174 passed | `raw/e2e.txt` |
| `npm run lint` | passed | `raw/lint.txt` |
| `npx tsc --noEmit` | passed | `raw/typecheck.txt` |
| `npm run build` with documented public test variables | passed | `raw/build.txt` |
| `git diff --check 043433e..HEAD` | passed (empty clean transcript) | `raw/diff-check.txt` |

The program-preview fixture now uses the local `public/e2e-thumbnail.svg` asset and verifies that the rendered thumbnail has a positive natural width. Both focused and full E2E transcripts contain zero `i.ytimg.com` references and zero external-thumbnail 404s. Expected unavailable-Instagram messages remain unrelated to this fixture. Captured text transcripts were normalized to remove trailing whitespace and EOF blank lines before this SHA-pinned report.

## Captures

- `desktop.png`: 1440×1100 capture of `/alta-data-te-tire` with deterministic scoped feed interception.
- `mobile.png`: 375×812 capture of the same scoped route and feed interception.
- `checksums.sha256`: SHA-256 manifest for both captures and every raw verification transcript, including the focused deterministic-thumbnail proof.

## Rollback

Revert this evidence refresh to remove only the local test thumbnail, preview-fixture coverage, and verification evidence. The registry, source adapters, API routes, global Acrox TV feed, Instagram behavior, and `ProgramPage` footer remain unchanged.
