# Program Visual Polish Evidence

## Binding

- Base commit: `2861d2b912de14b47873d3f5823aaf3daa811568`
- Product commit: `74d98e2`
- The checksum manifest binds the raw verification output and the four captures to this product commit and its deterministic-evidence remediation.

## Strict TDD

- Safety net: the existing program-media preview suite passed **22 tests** before changes.
- RED: `tests/e2e/acroxtv-program-polish.spec.ts` initially failed in all applicable browsers because the direct page still rendered the signal badge and heading, and the home kicker lacked the shared visual treatment.
- GREEN: the focused E2E contract passes **10 tests** across Chromium, Firefox, WebKit, and mobile.
- REFACTOR: the prior mobile hierarchy coverage now asserts the retained accessible latest-preview region instead of the intentionally removed visible heading.

## Contracts covered

- Direct-program pages have no visible signal badge, latest-episode heading, or presenter copy.
- The latest preview retains the accessible `Último episodio` region name, opens via its labeled trigger, removes the pseudo-element overlay, and restores trigger focus on Escape.
- The existing shared Footer is retained and its program-page `Nosotros` link navigates to `/#quienes-somos`.
- The home Acrox TV directory kicker has the same rendered marker and typography treatment as `QUIÉNES SOMOS`.

## Quality gates

| Gate | Raw evidence | Result |
| --- | --- | --- |
| Focused E2E | `raw/focused-e2e.log` | 10 passed; both legacy and scoped feeds intercepted |
| Full E2E | `raw/full-e2e.log` | 190 passed |
| Contracts | `raw/contracts.log` | 23 passed |
| Lint | `raw/lint.log` | passed |
| Typecheck | `raw/typecheck.log` | passed |
| Build | `raw/build.log` | passed with non-secret fixture environment |
| Diff check | `raw/diff-check.log` | passed |

## Visual capture

- `home-desktop.png` and `home-mobile.png` capture `/` at 1440×960 and 375×812.
- `program-desktop.png` and `program-mobile.png` capture `/alta-data-te-tire` at the same viewports with local legacy and scoped feed fixtures.
- The Navbar's legacy `/api/acroxtv-feed` request is fulfilled with no live or episode content and `instagramError: true`; the scoped fixture uses `instagram: { state: "unavailable" }`. This preserves the honest unavailable-Instagram state while preventing all provider calls during focused verification and capture.
- Sponsor data and assets were not altered; sponsor work remains blocked because this worktree has no `logo-*.jpg` assets.
