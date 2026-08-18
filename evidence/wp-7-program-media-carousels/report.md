# Program Media Carousel Evidence

## Binding

- Product implementation: `1f675822ee0b259f960acdf4d1d4011e5708a80a`
- Immutable evidence payload: `e25d0ff705c5526b81de512e7a17566e8cdcec45`
- This metadata commit creates `manifest.sha256` and is intentionally excluded from payload hashing.

## Strict TDD

The focused cross-browser program-media test was first run after its contract rewrite and failed because the former dashboard did not expose the home-row landmark/cards. The final focused gate is retained as `raw-focused-e2e.log` / `normalized-focused-e2e.log`: **22 passed**.

The contract asserts the scoped YouTube carousel behavior (including automatic advance after 4 seconds), no external arrows or dots, internal title/play badges, an image-free unavailable Instagram card, keyboard-accessible preview control, desktop equal-width cards, and mobile reflow.

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

## Visual Capture

The four screenshots (`*-desktop.png`, `*-mobile.png`) each contain the dominant lead plus all three lower-card surfaces. `capture-program-media-row.mjs` intercepts only each local capture route's program-feed response with public YouTube thumbnails from the corresponding program; it does not alter application code, the playlist registry, source service, API client, home feed, or Instagram content. `capture-metadata.json` records three cards per route and non-zero rendered thumbnail dimensions.
