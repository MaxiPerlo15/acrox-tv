# Program Media Dashboard Evidence

## Binding and Scope

- Product commit: `55f4e33ec21ab04a1d1460b3ed7d28b51995bf50`
- Evidence payload commit: `73ff1802781464a408b578937dfde2034daea19b`
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

The live scoped feeds returned 9 Alta episodes and 8 Más que Nutrición episodes. The thumbnail captures are live: the rendered lead images loaded at non-zero media resolutions. Desktop metadata records the lead above the three aligned panels; mobile metadata records the same-width vertical panel stack.

### Player-state capture fixture (not live playback)

Headless Chromium paints the live YouTube iframe black. For **player-state screenshots only**, `capture-live-dashboard.mjs` installs this deterministic route **before user activation**:

```js
await context.route("https://www.youtube-nocookie.com/embed/**", async (request) => {
  await request.fulfill({ contentType: "text/html; charset=utf-8", body: captureOnlyPlayerHtml });
});
```

The production application remains untouched. Clicking the real lead control still produces its real `youtube-nocookie` iframe URL; the capture script asserts that its origin is `https://www.youtube-nocookie.com` and that `/embed/<videoId>` matches the scoped leading item before the intercept supplies the following local HTML:

```html
<main class="player" aria-label="Capture-only YouTube player fixture">
  <div class="badge" aria-hidden="true"></div>
  <div class="label">YouTube</div>
  <div class="notice">Capture-only player fixture</div>
</main>
```

The complete deterministic HTML and interception pattern are recorded verbatim in `capture-live-dashboard.mjs` and `capture-metadata.json`. `CAPTURE_PLAYER_FIXTURE=1` also routes only the two program-feed requests to public, previously live-captured leading items so capture can run without credentials; it preserves the prior live thumbnail records and overwrites only the four player-state PNGs. The recognizable red play badge, YouTube label, and fixture notice make the player-state PNGs visibly distinguishable from live playback. They prove activation, production URL/scoped-video binding, and lead-container layout only; they do **not** claim rendered YouTube playback. Thumbnail PNGs remain the live thumbnail evidence.

## Reproduction

1. Start the already-built candidate with the required public variables and a transient `YOUTUBE_API_KEY`.
2. For a full run with a transient `YOUTUBE_API_KEY`, run `BASE_URL=http://127.0.0.1:<port> node evidence/wp-7-program-media-dashboard/capture-live-dashboard.mjs`. This captures live thumbnails and capture-only fixture player states.
3. For the deterministic player-only remediation, run `CAPTURE_PLAYER_FIXTURE=1 BASE_URL=http://127.0.0.1:<port> node evidence/wp-7-program-media-dashboard/capture-live-dashboard.mjs`. This keeps the retained live thumbnail metadata and re-captures only desktop/mobile player states for both routes.
4. Run `node evidence/wp-7-program-media-dashboard/normalize-output.mjs` and `node evidence/wp-7-program-media-dashboard/create-manifest.mjs`.

## Rollback

Revert evidence commits `17ee917` and this binding commit; product commit `55f4e33` remains unchanged.
