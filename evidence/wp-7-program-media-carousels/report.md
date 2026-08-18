# Program Media Carousel Evidence

## Binding

- Product implementation: `ea0a637ab4c80af8af1510c085c9c9efab1a82aa`
- Immutable evidence payload: `bdaf3e3` (`test(carousel): prove auto-slide movement`)
- This metadata commit creates `manifest.sha256` and is intentionally excluded from payload hashing.

## Strict TDD

The focused cross-browser program-media test was first run after its contract rewrite and failed because the former dashboard did not expose the home-row landmark/cards. The final focused gate is retained as `raw-focused-e2e.log` / `normalized-focused-e2e.log`: **22 passed**.

The contract asserts the scoped YouTube carousel behavior (including automatic advance after 4 seconds), no external arrows or dots, internal title/play badges, an image-free unavailable Instagram card, keyboard-accessible preview control, desktop equal-width cards, and mobile reflow. The auto-slide proof measures the Episodes track's computed `translateX` and first-card viewport x-position before and after 4,700 ms; both must move left by more than 1 px, so DOM presence alone cannot pass the assertion.

## Quality Gates

| Gate | Raw | Result |
| --- | --- | --- |
| Contracts | `raw-contracts.log` | 23 passed |
| Focused E2E | `raw-focused-e2e.log` | 22 passed |
| Full E2E | `raw-full-e2e.log` | 180 passed |
| Lint | `raw-lint.log` | passed |
| Typecheck | `raw-typecheck.log` | passed |
| Build | `raw-build.log` | passed |
| Diff check | `raw-diff-check.log` | passed |

## Review Remediation

`raw-review-remediation.log` records the post-review runs: focused E2E **22 passed (32.4s)** and full E2E **180 passed (1.1m)**. `scripts/run-e2e.mjs` snapshots and restores the committed `next-env.d.ts` after Playwright exits; `.next` remains ignored. Those gates left no generated Next artifact or type-shim drift.

## Visual Capture

The four screenshots (`*-desktop.png`, `*-mobile.png`) each contain the dominant lead plus all three lower-card surfaces. `capture-program-media-row.mjs` intercepts only each local capture route's program-feed response with public YouTube thumbnails from the corresponding program; it does not alter application code, the playlist registry, source service, API client, home feed, or Instagram content. `capture-metadata.json` records three cards per route and non-zero rendered thumbnail dimensions.
