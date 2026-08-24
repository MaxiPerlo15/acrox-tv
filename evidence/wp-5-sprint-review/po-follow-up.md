# WP-5 PO Review — Bounded Home Surface Follow-up

## Decision

- Reviewed baseline: accepted candidate `933e0ad`.
- PO feedback: the Acrox TV home directory's heading, program cards, and sponsor ribbon should read directly against the page background instead of as content inside a visible outer panel.
- Approved bounded follow-up: remove only the outer surface of `#acroxtv.program-directory` on the home page.

## Scope boundary

- Keep the directory's existing layout spacing, cards, artwork and neutral states, keyboard focus, mobile stacking, and sponsorship-ribbon behavior unchanged.
- Do not modify shared `.section` styling or `ProgramDirectoryCard`.
- Do not start WP-6 and do not merge `main`.

## Visual evidence

The captures below are element screenshots of the exact review target, `#acroxtv.program-directory`, not full-page screenshots. For each documented viewport, the capture script waits for `networkidle` and `document.fonts.ready`, disables CSS animations, scrolls that target into view with `locator.scrollIntoViewIfNeeded()`, then calls `locator.screenshot()`. This makes the complete target—including its heading, both cards, and sponsor ribbon—visible in each PNG even where the target is taller than the viewport.

They were produced from the local preview of this follow-up (`http://localhost:3000/`) with Playwright's bundled Chromium `145.0.7632.6`. Both use a desktop browser context without device emulation: `deviceScaleFactor: 1`, `isMobile: false`, and `hasTouch: false`.

| Capture | Target / capture method | Playwright viewport | Actual PNG dimensions | SHA-256 | Result |
| --- | --- | --- | --- | --- | --- |
| `po-follow-up-desktop.png` | `#acroxtv.program-directory` via `locator.screenshot()` after `scrollIntoViewIfNeeded()` | 1440 × 900 | 1208 × 1327 | `4fab3584006c6ada5df533590862d19fca634ef36b74731c83ec44a08478f1ca` | The complete directory heading, both cards, and sponsor ribbon sit on the page background; card surfaces remain intact. |
| `po-follow-up-mobile.png` | `#acroxtv.program-directory` via `locator.screenshot()` after `scrollIntoViewIfNeeded()` | 375 × 812 | 311 × 1465 | `fc831f560f009c1e10237ecc35b5c67bfe1c8769ce8dcbfbd112de1d5ae2319a` | The complete target shows the absent outer panel, stacked program cards, and sponsor ribbon. |

### Reproduction recipe

From this worktree, start the local preview on port 3000:

```sh
npm run dev -- --port 3000
```

In a second terminal, run the capture and integrity commands:

```sh
node evidence/wp-5-sprint-review/capture-po-follow-up.mjs
sips -g pixelWidth -g pixelHeight \
  evidence/wp-5-sprint-review/po-follow-up-desktop.png \
  evidence/wp-5-sprint-review/po-follow-up-mobile.png
shasum -a 256 \
  evidence/wp-5-sprint-review/po-follow-up-desktop.png \
  evidence/wp-5-sprint-review/po-follow-up-mobile.png
```

`capture-po-follow-up.mjs` defaults to `http://localhost:3000/`; set `BASE_URL` to capture a preview on another origin. Its console output records the browser version, viewport, target selector, rendered target size, and computed target surface values.

The live browser capture measured `background-color: rgba(0, 0, 0, 0)`, `background-image: none`, and a `0px` top border on `#acroxtv.program-directory` at both viewports.

## Verification

- Focused RED: the new desktop and mobile surface assertions failed against `933e0ad` because the generic section panel resolved to `rgba(13, 20, 37, 0.82)` with a `1px` border.
- Focused GREEN: 4/4 Playwright runs pass after the scoped override.
- Full quality: lint, TypeScript, production build with the documented public test environment, and `npm run test:e2e` pass (158/158).
- Fresh implementation review: approved. The diff is limited to the scoped CSS override, its E2E contract, and this WP-5 evidence.
