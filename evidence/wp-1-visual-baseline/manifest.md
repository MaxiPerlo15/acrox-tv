# WP-1 Visual Baseline Manifest

- **Branch/base/head**: `feat/acrox-tv-s1-visual-baseline` / `dbf0f4c3c3328562133ad04f377c269f1834391d` / `dbf0f4c3c3328562133ad04f377c269f1834391d`
- **Canonical routes**: `/#acroxtv`, `/alta-data-te-tire`; legacy `/alta-data` is intentionally divergent (404, no redirect).
- **Approved prototype**: [dbf0f4c](https://github.com/MaxiPerlo15/acrox-tv/tree/dbf0f4c3c3328562133ad04f377c269f1834391d)
- **Assets**: [Alta logo](https://github.com/MaxiPerlo15/acrox-tv/blob/dbf0f4c3c3328562133ad04f377c269f1834391d/public/alta-data-logo.png), [Acrox navbar logo](https://github.com/MaxiPerlo15/acrox-tv/blob/dbf0f4c3c3328562133ad04f377c269f1834391d/public/logo-acrox-navbar.png).

## Capture contract

Each run captures both routes: Chromium, Firefox, and WebKit at desktop 1440×900, tablet 768×1024, and mobile 390×844; WebKit iPhone 12 is the mobile-device control. The WP-1 contract asserts the complete 20-PNG filename matrix, so the permanent evidence remains explicitly cross-browser and cross-viewport even though its execution host is one Chromium process. Before every run, the capture script removes that run's output directory, confirms port 3017 is free, builds, and starts one managed production server. It pins the public environment, color scheme, device scale factor, locale, time zone, and reduced-motion preference; mocks the Acrox TV feed, blocks external HTTPS, disables animation/transition/media playback, waits for network idle, fonts, and two paints, resets scroll, and terminates the server process group in `finally`.

The normal `npm run test:e2e` configuration ignores the self-managed WP-1 contract and the intentional RED route proof, preventing the browser matrix from scheduling duplicate builds while retaining a green product suite. Run `npm run test:e2e:wp1-capture` for the contract: its dedicated config uses one Chromium project, one worker, and no Playwright `webServer`; the contract itself invokes the capture script exactly once.

## Evidence inventory

`run-1/` and `run-2/` each contain 20 PNGs plus `checksums.sha256`. Reproducibility requires equal checksums for matching browser/viewport/route paths after normalizing only the run-directory prefix. The latest matrix passes 20/20 exact pairs. See `reproducibility.md` for the permanent checksum triage and current reviewer block. `WP1_RUN=run-{1,2} node scripts/capture-wp1-visual-baseline.mjs` regenerates the inventory.

## RED route decision

`tests/e2e/acroxtv-wp1-legacy-alias.red.spec.ts` deliberately expects the legacy alias to redirect (`308`). Its executed RED output is `404`, proving that `/alta-data` diverges from the canonical direct route. This is evidence only; WP-1 does not modify product routing. Reviewer acceptance is pending.
