# Develop preview snapshot

## Authorization
User explicitly confirmed committing current application, runtime assets, tests and documentation and pushing develop for Guillermo's Vercel preview. This is an unfinished preview, not final visual acceptance or production delivery. Do not modify/push main.

## Scope
Base feature HEAD/local and remote develop: c1c4d06f67cf03cccb48028ac980afe3688573ab. Main remains c2b936b387822a5d7332f83c66d8127f4ab19505.
Explicit allowlist: 82 site/config/asset/test/doc paths, including 16 WebPs. Exclude .DS_Store, logs, caches/tsconfig.tsbuildinfo, .pi, .codegraph, prototypes, loose root JPG originals, environment files and generated next-env.d.ts churn. Leave exclusions on disk; never add the repository wholesale, force push, stash/reset unrelated work or install dependencies.

## Tasks and routes
- [x] T1 — Inventory and core checks. Parent Git inventory plus delegated verifier/limited test writer. Build and final full lint passed; 14 Node tests and 12 focused Chromium cases passed independently after stale assertions were updated. Literal credential scan of candidate text files found no assignments. Commit evidence pending with snapshot work unit.
- [ ] T2 — Commit and review the exact snapshot. In progress. Parent explicit staging and commit; native review against the original develop boundary. No test result substitutes for native approval.
- [ ] T3 — Fast-forward and push develop. Pending. Verify remote before/after non-force push and main unchanged; never invent Vercel deployment status.
- [ ] T4 — Restore local contract-test environment and rerun contracts. Pending follow-up, not a preview source regression. No install authorized.

## Verification evidence and limitations
- Initial broad checks: build/lint passed, Node 10 passed/4 stale failures, selected Chromium 31 passed/5 stale failures. Test-only updates retained analytics privacy/security, source contracts, player geometry and sponsor accessibility.
- Final independent checks: Node 14/14, focused analytics/media Chromium 12/12, full lint and whitespace checks passed. Other previously green cases were not rerun as a complete combined suite after test-only changes; no invented aggregate result.
- One lint run failed ENOENT for test-results; later rerun passed. Root cause was not proven. Instagram API token errors were logged; asserted tests passed.
- Contracts failed because server-only is missing locally. Independently reproduced ERR_MODULE_NOT_FOUND. Package/lock and both guard-import files are unchanged from develop; this is a proven pre-existing environment-resolution failure, not a introduced runtime behavior change. No guard bypass or installation performed.
- Firefox/WebKit and Vercel deployment were not verified. Generated next-env may be rewritten by the dev server; excluded from staging regardless.

## Budget and delivery
Tracked source/test delta initially 836 authored diff lines plus new components/tests/docs. User explicitly requested the broad develop WIP snapshot; preserve one preview-only delivery, no PR/main merge. Record actual staged count and native risk; binary assets excluded from authored count. This is not a final production approval.
Memory mirror unavailable: gentle-engram/core resume capability mismatch; this file is the local recovery record.
Next: exact staging, commit and native candidate review, then authorized develop push.
