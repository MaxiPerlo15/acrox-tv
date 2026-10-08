# Design: Acrox TV Sprint 1 Delivery Plan

## Technical Approach

Operate the six existing Notion tasks as one dependency-ordered Scrum/SDD delivery chain. The proposal, delta spec at `specs/sprint-1-delivery-plan/spec.md`, and current source specs define scope; each package supplies immutable evidence before the next is pulled. Product work starts only from tracker `feat/acrox-tv-editorial-release` at [`05aad18`](https://github.com/MaxiPerlo15/acrox-tv/commit/05aad1877143d81db4a222a003b9d4de3cddd29c). This design changes no application code, branch, Git state, or Notion content.

## Architecture Decisions

| Option | Tradeoff | Decision and rationale |
|---|---|---|
| Parallel tasks vs dependency chain | Parallelism appears faster but duplicates route and visual decisions | Use WP-1 → WP-2 → WP-3 → WP-4 → WP-5 → WP-6. Template precedes home despite current dates because it owns canonical routes and reduces rebase risk. |
| Extra Notion statuses vs current schema | A review status is clearer but requires schema migration | Keep `Sin empezar → En curso → Listo`. Review is an explicit gate checklist inside the task; work remains `En curso` until accepted. |
| Mutable branch links vs SHA-pinned evidence | SHA links require deliberate recording | Evidence MUST link commits, reports, screenshots, and previews to one candidate SHA; local or `/tmp` paths are invalid because reviewers cannot reproduce them. |
| File-type commits vs work-unit commits | File-type splits can leave incomplete states | One behavior/evidence unit per commit, with its tests and docs. WP-2 and WP-3 stay below 400 changed lines and target their immediate predecessor. |

## Data Flow and Operating Workflow

    Notion task → pull check → child branch → RED/GREEN/refactor → daily evidence
         ↑                                                        ↓
         └── feedback/FAIL ← review gate ← immutable evidence index
                                              ↓ PASS
                                         next task / PO review / retro

**WIP limit:** one `En curso` Sprint 1 task. A blocked task stays `En curso`; another task is pulled only after the PO records a replan. A task moves to `Listo` only when its package DoD, evidence index, and required gate are approved. Failed review returns actions to the same task, not a new hidden work item.

| WP | Branch/base | Exit gate |
|---|---|---|
| 1 | `feat/acrox-tv-s1-visual-baseline` → tracker `05aad18` | PO/reviewer accepts route and capture manifest; RED divergence is recorded. |
| 2 | `feat/acrox-tv-s1-program-template` → WP-1 | Focused/full tests and quality checks pass; PR diff ≤380 lines. |
| 3 | `feat/acrox-tv-s1-home-fidelity` → WP-2 | Visual/accessibility review passes; PR diff ≤360 lines. |
| 4 | `review/acrox-tv-s1-visual-gate` → WP-3, evidence-only | Frozen SHA receives reproducible PASS across two capture runs. |
| 5 | WP-3 candidate or integrated tracker successor; never `main` | PO records accepted, follow-up required, or rejected. |
| 6 | No code branch | Retro actions and Sprint 2 candidates receive owner, dependency, priority, and evidence need. |

Each workday appends: UTC timestamp; current state; branch/base/HEAD links; completed scope; changed-line count; command/result links; screenshot/report links; blocker/owner; next pull condition. Never replace prior entries.

## File Changes

| File | Action | Description |
|---|---|---|
| `openspec/changes/acrox-tv-sprint-1-delivery-plan/design.md` | Create | Operating workflow and evidence contract. |
| Six linked Notion task bodies | Modify later | Add approved package, daily log, gate checklist, and evidence index; preserve metadata until separately authorized. |

## Interfaces / Contracts

Sprint charter: [Sprint 1](https://app.notion.com/p/3b74cec8abb581c684d2ed2f2e292db6). Task links: [WP-1](https://app.notion.com/3b74cec8abb58180954de6fa7f299deb), [WP-2](https://app.notion.com/3b74cec8abb5814bb3c1cdaf1d469bd0), [WP-3](https://app.notion.com/3b74cec8abb581d19bb8c2761ac1e4ab), [WP-4](https://app.notion.com/3b74cec8abb5819d83d3ceeb1bf1450e), [WP-5](https://app.notion.com/3b74cec8abb58140b0edfc16f6fa4943), [WP-6](https://app.notion.com/3b74cec8abb58155b4bad14981318600).

Every task evidence index MUST contain: pinned SDD artifact URL (`blob/<sha>/openspec/changes/acrox-tv-sprint-1-delivery-plan/...`), base/head commit URLs, PR URL when applicable, permanent test/visual report URLs, and preview URL plus displayed SHA.

**Global DoD:** package acceptance is satisfied; dependencies and rollback are documented; tests/docs accompany behavior; `npm run test:e2e`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check` pass where code exists; no unexplained visual drift, fabricated asset, unowned failure, or `main` merge exists.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Artifact | Six bodies contain required fields and valid permanent links | Checklist audit before execution. |
| Gate | State, dependency, WIP, branch, and SHA invariants | Reviewer reproduces each exit gate from its evidence index. |
| E2E/visual | Routes, shell, media isolation, accessibility, browser/mobile fidelity | Existing Playwright four-project matrix plus repeated deterministic captures. |

## Migration / Rollout

No schema or data migration. After explicit authorization, enrich task bodies, correct execution order, then pull WP-1. WP-5 demos the exact WP-4 SHA on desktop and mobile, discloses unavailable states, and categorizes every comment. WP-6 compares plan/actual time, scope, changed lines, failures, and review outcomes; it records one measurable process improvement and a PO-approved Sprint 2 goal.

## Open Questions

None blocking.
