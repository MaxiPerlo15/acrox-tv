# WP-3 Home Fidelity — Immutable Quality and TDD Provenance

## Scope and identity

- Scope: WP-3 only. No WP-4 work or product-behavior changes were made for this evidence pass.
- Accepted base revision: `ba25efe90926b79ab7c96efa3c83eb54210b637d`.
- Current `HEAD`: `ba25efe90926b79ab7c96efa3c83eb54210b637d`.
- Candidate product tree: `d95667737a47846a4766df941205f1e5c4bfb914`.
  This is the simulated Git tree made from the base plus the current uncommitted WP-3 product paths only: `src/app/globals.css`, `src/components/ProgramDirectoryCard.tsx`, and `tests/e2e/acroxtv-editorial.spec.ts`.
- Candidate product patch SHA-256: `fcee7143cec79e349426224d8ea7784cadc43b1c26aaf580e8d118d77e11af6f`.
- Candidate state remains uncommitted.

## RED → GREEN provenance

The new test is `keeps each canonical program name in the visible editorial hierarchy` in `tests/e2e/acroxtv-editorial.spec.ts`.

| Stage | Command | Result | Retained output |
| --- | --- | --- | --- |
| RED | In a fresh detached worktree at `ba25efe`, apply only the candidate test diff, then run `npx playwright test tests/e2e/acroxtv-editorial.spec.ts --project=chromium -g "keeps each canonical program name in the visible editorial hierarchy"` | Expected failure (exit 1): the level-three `Alta Data ¡Te Tire!` heading was not found. | `provenance/red.raw.txt`, `provenance/red.normalized.txt` |
| GREEN | In this candidate worktree, run `npx playwright test tests/e2e/acroxtv-editorial.spec.ts --project=chromium -g "keeps each canonical program name in the visible editorial hierarchy"` | Pass (exit 0). | `provenance/green.raw.txt`, `provenance/green.normalized.txt` |

The RED command used a temporary detached base worktree and its own `npm ci --ignore-scripts` install. The temporary path is normalized only in the normalized transcript; the raw transcript is retained unchanged.

## Quality verification

| Check | Exact command | Result | Raw / normalized output |
| --- | --- | --- | --- |
| Full E2E | `npm run test:e2e` | PASS — 154 tests, exit 0. | `quality/raw/e2e.txt` / `quality/normalized/e2e.txt` |
| Lint | `npm run lint` | PASS — exit 0. | `quality/raw/lint.txt` / `quality/normalized/lint.txt` |
| Typecheck | `npx tsc --noEmit` | PASS — exit 0. | `quality/raw/typecheck.txt` / `quality/normalized/typecheck.txt` |
| Production build | `NEXT_PUBLIC_WHATSAPP_NUMBER=5491100000000 NEXT_PUBLIC_CONTACT_EMAIL=contact@example.com NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/example NEXT_PUBLIC_TIKTOK_URL=https://tiktok.com/@example NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@example npm run build` | PASS — exit 0. | `quality/raw/build.txt` / `quality/normalized/build.txt` |
| Diff check | `git diff --check ba25efe` | PASS — exit 0. | `quality/raw/diff-check.txt` / `quality/normalized/diff-check.txt` |

The E2E raw output includes expected unavailable-Instagram configuration messages; the suite still passed and no fallback content was introduced.

## Normalization and integrity

Normalized outputs are derived from their corresponding raw outputs by stripping terminal ANSI control codes, absolute temporary/worktree paths, and elapsed-time values. They preserve assertions, command output, and exit codes.

`manifest.sha256` hashes every evidence file in this directory except the manifest itself, including the prior visual matrix, this report, and all RED/GREEN and quality transcripts. Recalculate after any artifact edit:

```sh
for file in evidence/wp-3-home-fidelity/**/*(.N); do
  [[ "$file" == "evidence/wp-3-home-fidelity/manifest.sha256" ]] || shasum -a 256 "$file"
done | LC_ALL=C sort > evidence/wp-3-home-fidelity/manifest.sha256
```

All evidence paths are intentionally left uncommitted with the candidate. When the candidate is committed later, add the complete directory with:

```sh
git add evidence/wp-3-home-fidelity/
```
