# WP-2 Program Template Evidence

- Candidate SHA: `f5bcca0bb47878f7bac56ba47372908ba22d8115`
- Parent accepted WP-1 SHA: `da69785`
- Branch: `feat/acrox-tv-s1-program-template`
- Scope: WP-2 only; no merge to `main`.

## RED → GREEN

`tests/e2e/acroxtv-wp2-program-isolation.spec.ts` was written before the
provenance guard. The RED run failed in both directions because a response
labelled for the sibling program rendered its episode three times. The GREEN
run passed after the direct-program client rendered unavailable surfaces when
the response `programSlug` did not match the requested route.

## Verification

| Command | Result |
| --- | --- |
| `npx playwright test tests/e2e/acroxtv-editorial.spec.ts --project=chromium` | PASS, 22 tests |
| `npx playwright test tests/e2e/acroxtv-wp2-program-isolation.spec.ts --project=chromium` | RED: 2 failures; GREEN: 2 passes |
| `npm run test:e2e` | PASS, 151 tests across Chromium, Firefox, WebKit, and mobile |
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run build` with public example environment | PASS; both direct routes statically generated |
| `git diff --check` | PASS |

The unconfigured `npm run build` fails by design because public environment
values are required; the documented example values above make the build pass.

## Route, media, and accessibility proof

- `/alta-data-te-tire` and `/mas-que-nutricion` are static canonical routes with route metadata.
- Both render the shared Acrox Navbar and Footer; keyboard/mobile checks pass in the full matrix.
- The registered playlist sources remain `PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y` (Alta Data) and `PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq` (Más que Nutrición).
- Instagram remains explicitly unavailable per program. A mismatched scoped-feed response renders unavailable program surfaces, never sibling content.

## Visual captures

Captured from the production server for candidate SHA `f5bcca0bb47878f7bac56ba47372908ba22d8115`:

| File | SHA-256 |
| --- | --- |
| `alta-data-te-tire-desktop.png` | `d842c21f6474c08418fd632c4e3565f99c8e76fc591ab50ee5e6b1059082492c` |
| `alta-data-te-tire-mobile.png` | `423dccd80a8f2ac30aac4af660d245bc0587576322f017795898228217e0c223` |
| `mas-que-nutricion-desktop.png` | `936aeb2eebc422b17396768aeb1635f13f1cd7504c281544ebabd0c76abb1ab6` |
| `mas-que-nutricion-mobile.png` | `a904192fa569b4ee03f053076b2b965b6b9f87e737f6b5380866f128107bc690` |

## Pending reviewer gate

Reviewer acceptance remains pending. The available tool surface cannot append
the required Notion daily log; append this report's branch, candidate SHA,
commands, captures, and pending-review state to WP-2 before moving the task to
`Listo`.
