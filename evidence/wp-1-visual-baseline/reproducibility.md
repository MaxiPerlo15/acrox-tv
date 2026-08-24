# WP-1 Reproducibility Check

## Commands executed

```text
npx playwright test tests/e2e/acroxtv-wp1-legacy-alias.red.spec.ts --project=chromium
npm run test:e2e
npm run test:e2e:wp1-capture
WP1_RUN=run-1 node scripts/capture-wp1-visual-baseline.mjs
WP1_RUN=run-2 node scripts/capture-wp1-visual-baseline.mjs
WP1_RUN=run-1 node scripts/capture-wp1-visual-baseline.mjs
WP1_RUN=run-2 node scripts/capture-wp1-visual-baseline.mjs
npx tsc --noEmit
npm run lint
git diff --check
```

## Results

- **RED route assertion**: expected `308`, received `404` for `/alta-data`; canonical `/alta-data-te-tire` returned `200`. This intentional RED failure remains the legacy-alias divergence evidence; no route was changed.
- **Capture-contract test**: **PASS (2/2)**. `npm run test:e2e` excludes this self-managed contract (and the intentional RED route proof) from the permanent Chromium/Firefox/WebKit Playwright matrix, so the normal green path cannot schedule duplicate builds. `npm run test:e2e:wp1-capture` runs one Chromium project and one worker with no Playwright `webServer`; it invokes the capture script exactly once, asserts the exact 20-file Chromium/Firefox/WebKit/viewport matrix, proves a stale artifact in the target run directory is removed, then proves port `3117` is reusable after the managed capture completes.
- **Matrix captured twice**: **PASS**. The two fresh runs each produced 20 PNGs; browser/viewport coverage is defined in `manifest.md`, asserted by the single-process contract, and individually SHA-256 checksummed.
- **Exact checksum comparison**: **PASS — 20/20 matched pairs**. The comparison normalizes only the `run-1/` versus `run-2/` pathname before comparing SHA-256 values; the PNG bytes for every same browser/viewport/route pair are identical.
- **Static checks**: `npx tsc --noEmit`, `npm run lint`, and `git diff --check` passed.
- **Managed server cleanup**: **PASS**. The capture script starts a fresh production server only after confirming the port is free, terminates its process group in `finally`, and post-run port `3017` was free.

## Checksum and drift triage

| Comparison class | Result | Disposition |
| --- | --- | --- |
| Same browser + viewport + route, run 1 vs run 2 | 20/20 exact SHA-256 matches | No unexpected drift remains. |
| Chromium vs Firefox vs WebKit | Not compared as equivalent images | Permitted renderer variation: these are independent control baselines, not duplicate captures. |
| WebKit mobile viewport vs WebKit iPhone 12 device control | Not compared as equivalent images | Permitted device-emulation variation: distinct viewport/device contracts. |
| Legacy `/alta-data` route | Expected `308`, actual `404` | Intentional RED evidence; product routing is out of WP-1 scope. |

The initial 13/20 drift result was not reproducible after isolating the capture inputs. Its capture process left server lifecycle completion outside the capture promise, did not clear the target run directory first, and lacked a complete readiness contract. The replacement contract fixes the server lifecycle, resets output, uses a pinned production environment and feed response, blocks external HTTPS, fixes browser context settings, disables motion/media behavior, waits for network-idle/fonts/two paints, and captures from a controlled scroll position.

## Reviewer gate

Reviewer route/capture acceptance is **pending**. The reproducibility blocker is resolved, but this report does not claim reviewer acceptance. Do not pull WP-2 until the reviewer explicitly accepts the manifest and legacy-route disposition.
