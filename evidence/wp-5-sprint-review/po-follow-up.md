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

The captures below are viewport screenshots, not full-page screenshots. They were produced from the local preview of this follow-up (`http://localhost:3000/`) with Playwright's bundled Chromium `145.0.7632.6`. Both use a desktop browser context without device emulation: `deviceScaleFactor: 1`, `isMobile: false`, and `hasTouch: false`.

| Capture | Playwright viewport | `fullPage` | Actual PNG dimensions | SHA-256 | Result |
| --- | --- | --- | --- | --- | --- |
| `po-follow-up-desktop.png` | 1440 × 900 | `false` | 1440 × 900 | `08a5774b70daac8fa0feaf854694dcb6f5e575acdc52680ed11852935de0ee69` | The directory heading, two cards, and ribbon sit on the page background; card surfaces remain intact. |
| `po-follow-up-mobile.png` | 375 × 812 | `false` | 375 × 812 | `4f1f05ef2a9cb9e5c4b2903766dda03d316119724a60f7de0aaf65ed5adab728` | The panel remains absent while the program cards continue to stack. |

### Reproduction recipe

From this worktree, start the local preview on port 3000, then run:

```sh
node evidence/wp-5-sprint-review/capture-po-follow-up.mjs
sips -g pixelWidth -g pixelHeight \
  evidence/wp-5-sprint-review/po-follow-up-desktop.png \
  evidence/wp-5-sprint-review/po-follow-up-mobile.png
shasum -a 256 \
  evidence/wp-5-sprint-review/po-follow-up-desktop.png \
  evidence/wp-5-sprint-review/po-follow-up-mobile.png
```

`capture-po-follow-up.mjs` waits for `networkidle` and `document.fonts.ready`, and disables CSS animations during each capture. Set `BASE_URL` to capture a preview on another origin; it defaults to `http://localhost:3000/`.

The live browser capture measured `background-color: rgba(0, 0, 0, 0)`, `background-image: none`, and a `0px` top border on `#acroxtv.program-directory` at both viewports.

## Verification

- Focused RED: the new desktop and mobile surface assertions failed against `933e0ad` because the generic section panel resolved to `rgba(13, 20, 37, 0.82)` with a `1px` border.
- Focused GREEN: 4/4 Playwright runs pass after the scoped override.
- Full quality: lint, TypeScript, production build with the documented public test environment, and `npm run test:e2e` pass (158/158).
- Fresh implementation review: approved. The diff is limited to the scoped CSS override, its E2E contract, and this WP-5 evidence.
