# Main thumbnail-resolution hotfix

## Goal
Fix the soft latest-episode preview on `main` by selecting the highest thumbnail URL actually supplied by YouTube. Ship a focused `hotfix` branch based on `origin/main` and push it; do not merge or push directly to main.

## Constraints
- Main checkout began on dirty `develop`; user explicitly authorized a temporary tracked+untracked stash and pausing/restarting the local dev server. No worktrees.
- Preserve and verify the prior checkout and stash before returning to `develop`; stash is not an implementation input.
- No generated verification artifact writes. Use `node --test` with a pure selector, `npm run lint`, `npx tsc --noEmit --incremental false` (if safe), and `git diff --check`; do not invoke Playwright or Next build.
- Select only actual supplied `maxres`, `standard`, `high`, `medium`, or `default` URLs; skip empty strings and do not guess an unavailable `maxresdefault.jpg` URL. Preserve current feed/playback behavior.

## Tasks
- [ ] 1. Reproduce the selection defect on `main` with a focused native Node test, then implement the minimal selector and wire it into both YouTube API parsing paths. Behavior-specific RED: `node --test tests/node/youtube-thumbnails.test.mjs` failed maxres preference and standard fallback while empty-maxres passed; GREEN same exact command 3/3 passed. `npm run lint` and `git diff --check` passed. `npx tsc --noEmit --incremental false` FAILED because stale existing `.next` validators reference app/API modules absent from main; no generated files were modified. Both live-search and details parsing call selector. Commit pending.
- [ ] 2. Independently verify source scope and no-write checks, handle blocked TypeScript baseline honestly, commit the single behavior work unit, push `hotfix`, restore `develop` and restart the server, then verify original path/content manifest. Evidence pending.

## Baseline
`origin/main` and `main` were both `67410f9945c4f24da580c5d20a9d1d83eea8a4bf` after fresh fetch. Hotfix branch was created at that exact commit; dirty `develop` was stashed under `preserve-develop-before-main-thumbnail-hotfix-2026-09-30`. Original eligible tracked+untracked content manifest SHA-256: `80f09be97364fda7fadd5b8fc6e11a6e54fa57b36cf38440245d765e8ce91920` across 50 files; porcelain status SHA-256: `096cec2247c47b21d81366ab75096e7b8334f4b6c1bb752d552e6a6dcafebd2c`.

## Review unit
One focused change containing selector, wiring, native Node regression test, and this evidence. Rollback: revert only that hotfix commit; no migrations, asset deletion or route changes. Runtime harness: native Node test and, if feasible without generated writes, read-only inspection of current YouTube image source. Production Next build/E2E intentionally skipped due explicit no-generated-artifact constraint.
