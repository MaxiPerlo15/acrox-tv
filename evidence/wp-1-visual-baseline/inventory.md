# WP-1 Evidence Inventory

| Item | Permanent tracked path | Status |
| --- | --- | --- |
| Capture contract and references | `manifest.md` | Recorded |
| Capture 1 | `run-1/` (20 PNG + SHA-256 inventory) | Recorded |
| Capture 2 | `run-2/` (20 PNG + SHA-256 inventory) | Recorded |
| RED alias assertion | `tests/e2e/acroxtv-wp1-legacy-alias.red.spec.ts` | Executed: expected fail, 404 received |
| Capture lifecycle contract | `tests/e2e/acroxtv-wp1-capture-contract.spec.ts`, `playwright.wp1-capture.config.ts` | PASS: one Chromium process asserts all 20 permanent matrix paths, stale-run cleanup, and child-server port release; excluded from normal matrix |
| Reproducibility comparison | `reproducibility.md` | PASS: 20/20 exact matched pairs; reviewer decision still pending |

Every image is produced with feed/media mocks and external HTTPS blocked. No `/tmp` file is evidence.
