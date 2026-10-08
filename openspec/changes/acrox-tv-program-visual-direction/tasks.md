# Tasks: Acrox TV Program Visual Direction

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 620–760 authored lines (under 800 ceiling) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 home slice → PR 2 sponsor slice → PR 3 hero slice |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Base | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|---|
| 1 | Remove home sponsor band and ship the green no-band directory contract | PR 1; base = feature/tracker branch | `npm run test:e2e -- tests/e2e/acroxtv-editorial.spec.ts` | `npm run dev`; inspect `/` on desktop/mobile and both card links | Revert `StreamingSection.tsx` plus its home assertions |
| 2 | Add program-owned sponsor waiting strips after all three cards | PR 2; base = PR #1 branch | `npm run test:e2e -- tests/e2e/acroxtv-editorial.spec.ts tests/e2e/acroxtv-program-media-preview.spec.ts` | `npm run dev`; verify cards → sponsor → footer and waiting state | Revert sponsor registry/page/ribbon changes and tests |
| 3 | Ship cover-ready hero waiting state and responsive/accessibility regressions | PR 3; base = PR #2 branch | `npm run test:e2e -- tests/e2e/acroxtv-program-polish.spec.ts tests/e2e/acroxtv-editorial.spec.ts` | `npm run dev`; test 380px overflow, focus, and reduced motion | Revert hero/CSS changes and polish assertions |

## Phase 1: PR 1 — Home Directory Vertical Slice

- [x] 1.1 **RED:** Add home assertions in `tests/e2e/acroxtv-editorial.spec.ts` for exactly two canonical cards and zero sponsor regions on desktop/mobile. Completed via the explicitly authorized isolated reconstructed RED/GREEN experiment; this is not evidence of the original implementation's chronology, and mobile project/WebKit remain unverified.
- [x] 1.2 **GREEN:** Remove sponsor import, constant, and render from `src/components/sections/home/StreamingSection.tsx`; reconcile legacy home sponsor expectations and pass the focused Chromium suite.

## Phase 2: PR 2 — Sponsor Vertical Slice

- [x] 2.1 **RED:** Add placement/ownership/waiting assertions in `tests/e2e/acroxtv-editorial.spec.ts` and `tests/e2e/acroxtv-program-media-preview.spec.ts` for one sponsor region after all three media cards and before `contentinfo`. RED observed: both new contracts failed because no sponsor region rendered (30 passed, 2 expected failures).
- [x] 2.2 **GREEN:** Add `sponsors?` to `src/domain/programs.ts`; wire `src/components/ProgramPage.tsx` and `src/components/SponsorRibbon.tsx` for program-owned static waiting state; pass both focused suites. GREEN passed both focused Chromium suites.

## Phase 3: PR 3 — Approved Covers and Regression Vertical Slice

- [x] 3.0 **ASSETS:** Converted all 16 ZIP images to unique WebPs in a no-overwrite Downloads sibling directory with source/output hash manifest; only the confirmed `ADTT 1.jpg` and `Más que nutrición 1.jpg` covers are present under `public/programs/covers/`. No sponsor files are approved by this delivery. Independently verified ZIP and output digests.
- [x] 3.1 **RED:** Added a native Node cover-ownership contract: before source changes it failed because both `coverSrc` values were absent. It preserves home-card logo ownership and no sponsor attribution. Existing footer/keyboard/reduced-motion/380px Playwright contracts remain for a later authorized run.
- [x] 3.2 **GREEN:** Added optional `coverSrc` with the two approved WebPs and uncropped portrait/neutral-fallback styles in `src/domain/programs.ts`, `src/components/ProgramPage.tsx`, and `src/app/globals.css`; `coverLogoSrc` still belongs to home cards. The same no-output Node test passed 1/1 and independent read-only browser inspection covered both direct pages at 1440/380. The absent-cover fixture, full Playwright suite and WebKit/mobile-project checks remain pending under the no-generated-artifact restriction; this checkoff records the scoped implementation, not final release verification.

## Phase 4: Final Scope Check

- [ ] 4.1 Confirm only the two approved portrait covers became publicly served, all 16 were converted to WebP outside the repository, no sponsor attribution/generic assets/fabricated facts/route or media changes entered the slice, and legacy files remain untouched; report unrun browser suites and delivery boundaries.
