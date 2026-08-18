# Program Media Dashboard Evidence

## Binding and Scope

- Product commit: `55f4e33ec21ab04a1d1460b3ed7d28b51995bf50`
- Evidence payload commit: `17ee917e1881cc574314d88990a98cbe69534155`
- This report and `manifest.sha256` are intentionally self-excluded from the manifest. The manifest hashes every retained payload artifact and binds that payload to both commits above.
- Scope is evidence only. No product layout, registry, feed implementation, or integration code changed.

## TDD and Gate Outputs

| Evidence | Raw output | Normalized output | Result |
| --- | --- | --- | --- |
| RED at base `4420ae8` | `raw-red-dashboard.log` | `normalized-red-dashboard.log` | 6 cross-browser failures: the dashboard landmark/panels were absent. |
| GREEN focused E2E | `raw-focused-e2e.log` | `normalized-focused-e2e.log` | 22 passed. |
| Contracts | `raw-contracts.log` | `normalized-contracts.log` | 23 passed. |
| Full E2E | `raw-full-e2e.log` | `normalized-full-e2e.log` | 180 passed. |
| Lint | `raw-lint.log` | `normalized-lint.log` | passed. |
| Typecheck | `raw-typecheck.log` | `normalized-typecheck.log` | passed. |
| Build | `raw-build.log` | `normalized-build.log` | passed with public test values. |
| Diff check | `raw-payload-diff-check.log` | `normalized-payload-diff-check.log` | passed for `55f4e33..17ee917`. |

## Live Visual Evidence

The capture server received the user-provided YouTube credential only as a transient process environment variable. It was neither written to the repository nor included in the outputs. `capture-metadata.json` records only public response fields and rendered dimensions.

Each capture is a dashboard target, not a geometry crop: it includes the dominant lead media, all three panels, and their responsive context.

| Route | Desktop | Mobile |
| --- | --- | --- |
| `/alta-data-te-tire` | `alta-data-te-tire-desktop-thumbnail.png`, `alta-data-te-tire-desktop-player.png` | `alta-data-te-tire-mobile-thumbnail.png`, `alta-data-te-tire-mobile-player.png` |
| `/mas-que-nutricion` | `mas-que-nutricion-desktop-thumbnail.png`, `mas-que-nutricion-desktop-player.png` | `mas-que-nutricion-mobile-thumbnail.png`, `mas-que-nutricion-mobile-player.png` |

The live scoped feeds returned 9 Alta episodes and 8 Más que Nutrición episodes. The rendered lead images loaded at non-zero media resolutions, and the player-state captures show the corresponding scoped `youtube-nocookie` embeds. Desktop metadata records the lead above the three aligned panels; mobile metadata records the same-width vertical panel stack.

## Reproduction

1. Start the already-built candidate with the required public variables and a transient `YOUTUBE_API_KEY`.
2. Run `BASE_URL=http://127.0.0.1:<port> node evidence/wp-7-program-media-dashboard/capture-live-dashboard.mjs`.
3. Run `node evidence/wp-7-program-media-dashboard/normalize-output.mjs` and `node evidence/wp-7-program-media-dashboard/create-manifest.mjs`.

## Rollback

Revert evidence commits `17ee917` and this binding commit; product commit `55f4e33` remains unchanged.
