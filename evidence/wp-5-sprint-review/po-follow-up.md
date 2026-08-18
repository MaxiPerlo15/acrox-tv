# WP-5 PO Review — Bounded Home Surface Follow-up

## Decision

- Reviewed baseline: accepted candidate `933e0ad`.
- PO feedback: the Acrox TV home directory's heading, program cards, and sponsor ribbon should read directly against the page background instead of as content inside a visible outer panel.
- Approved bounded follow-up: remove only the outer surface of `#acroxtv.program-directory` on the home page.

## Scope boundary

- Keep the directory's existing layout spacing, cards, artwork and neutral states, keyboard focus, mobile stacking, and sponsorship-ribbon behavior unchanged.
- Do not modify shared `.section` styling or `ProgramDirectoryCard`.
- Do not start WP-6 and do not merge `main`.

## Evidence

| Capture | Viewport | Result |
| --- | --- | --- |
| `po-follow-up-desktop.png` | 1440 × 900 | The directory heading, two cards, and ribbon sit on the page background; card surfaces remain intact. |
| `po-follow-up-mobile.png` | 375 × 812 | The panel remains absent while the program cards continue to stack. |

The live browser capture measured `background-color: rgba(0, 0, 0, 0)`, `background-image: none`, and a `0px` top border on `#acroxtv.program-directory` at both viewports.

## Verification

- Focused RED: the new desktop and mobile surface assertions failed against `933e0ad` because the generic section panel resolved to `rgba(13, 20, 37, 0.82)` with a `1px` border.
- Focused GREEN: 4/4 Playwright runs pass after the scoped override.
- Full quality: lint, TypeScript, production build with the documented public test environment, and `npm run test:e2e` pass (158/158).
- Fresh implementation review: approved. The diff is limited to the scoped CSS override, its E2E contract, and this WP-5 evidence.
