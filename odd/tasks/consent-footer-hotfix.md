# Consent footer hotfix

## Objective and authorization
Remove the permanent analytics-preferences button from the shared footer. Show initial consent until a choice is made; persist either acceptance or rejection and suppress automatic reappearance on navigation and reload. The user explicitly authorized committing, merging to main, and pushing this hotfix only.

## Scope and constraints
- Base: main/origin main at 37d7402153cf3543c13a0c65f314beb311066782 (remote verified).
- Branch: hotfix-consent-footer; isolated linked worktree consent-footer-hotfix.
- Preserve the primary checkout and all unrelated dirty UI/hero changes. No develop merge, stash, reset, dependency install, force push, or redesign.
- Retain existing explicit preference/withdrawal access on Privacy; it must not appear permanently in the footer.
- Existing consent already saves accepted and rejected choices in localStorage. Do not change working persistence without a demonstrated failing test.
- Storage cleared/unavailable and a different browser are not persistence guarantees.
- Delivery strategy: ask-on-risk; forecast fewer than 200 authored diff lines, generated files excluded.

## Tasks
- [ ] T1 — Remove the footer trigger and verify initial/persisted consent. **In progress.** Route: delegated writer; source plus deterministic regression tests requires multi-file writing. Observe a failing updated footer contract before the fix, then passing focused node/browser checks, lint and build. Commit behavior and tests as one work unit.
- [ ] T2 — Review the isolated candidate and integrate/push main. Route: parent Git delivery plus delegated independent verification if assessment requires it. Only exact reviewed hotfix commits may reach main; verify remote SHA after a non-force push.

## Acceptance criteria
- Shared footer has no analytics preferences control; privacy and terms links remain.
- A fresh browser receives initial consent and GA is not loaded before acceptance.
- Acceptance and rejection both hide consent, persist under acrox-ga-consent, and remain hidden after client navigation and reload.
- Rejection does not load Google Analytics; acceptance retains existing opt-in behavior.
- Privacy can still explicitly reopen preferences and withdraw consent.
- Only footer, analytics-specific tests and this task document differ from the main baseline.

## Verification and progress
- Read-only main inspection confirms the footer trigger is present in production baseline, while persistence already exists.
- Branch namespace collision with existing hotfix prevented initial worktree creation; verified no checkout was created and used hotfix-consent-footer instead.
- Primary checkout changed branch externally; leave it untouched and coordinate delivery with advertised peer sessions.
- Observed RED: updated Node footer contract failed before the source removal; GREEN: 1 Node contract passed after removal.
- Writer verification: 16 Playwright cases passed across desktop/mobile Chromium; lint, build and diff whitespace checks passed. Existing acceptance/rejection persistence, Privacy withdrawal and GA queue/security behavior are covered.
- Independent verification: 1 Node contract and 8 desktop Chromium cases passed; diff whitespace check passed. The isolated server used port 53451, not the primary checkout's port 3000.
- Earlier failed attempts: a Playwright contract was initially invoked incorrectly through Node; an initial build lacked environment configuration. Both were corrected and final applicable checks passed. Existing environment and dependencies were linked, not installed.
- Dev-server Instagram token errors are pre-existing external logs; mocked consent tests passed. No passing screenshots captured; Firefox/WebKit and deployed production ingestion were not tested.
- Native review switch: on. Initial assessment was unassessable due to undeclared untracked task document; independent verification completed. Inspect subsequently selected exactly this document and three hotfix paths; ready for native START, no approval claimed.
- Commit identities: pending.
- Next: review the isolated candidate, then commit and integrate main without the primary checkout's UI changes.
