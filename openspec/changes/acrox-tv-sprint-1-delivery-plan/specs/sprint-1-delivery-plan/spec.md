# Sprint 1 Delivery Plan Specification

## Purpose

Define six dependency-ordered packages for the 10–16 August increment. It authorizes no product, Git, or Notion change.

## Requirements

### Requirement: WP-1 Re-baseline Fidelity

WP-1 MUST start from clean tracker `05aad18`, declare both canonical routes, target matrix, neutral states, and capture rules. Evidence MUST include a manifest, RED route result, inventory/checksums, references, and route decision. DoD: PO/design accepts a reproducible target; child branch → tracker, ≤200 lines. **Notion sync:** objective, scope, inputs, dependencies, workflow, DoD, evidence, branch/SHA, risks/blockers.

#### Scenario: Baseline rejects a legacy route
- GIVEN a clean `05aad18` worktree and a legacy `/alta-data` assertion
- WHEN WP-1 publishes its baseline
- THEN both canonical routes and their capture rules are approved
- AND the route decision and RED evidence are linked to the task page

### Requirement: WP-2 Shared Program Template

WP-2 MUST depend on WP-1 and deliver shared-shell direct routes, registered program-owned YouTube, and explicit unavailable Instagram. Evidence MUST include RED-to-GREEN, route/SEO and isolation proof, captures, and commands. DoD: quality checks pass; branch → WP-1, ≤380 lines. **Notion sync:** dependency, branch/parent SHA, evidence, DoD, failures, handoff.

#### Scenario: Program media remains truthful
- GIVEN both canonical routes and unavailable Instagram authorization
- WHEN the template is evaluated on desktop and mobile
- THEN each route renders its shared shell and only its registered playlist
- AND unavailable Instagram and no cross-program fallback are proven

### Requirement: WP-3 Prototype-Faithful Home

WP-3 MUST depend on WP-1/WP-2, show two equal canonical cards, supplied Alta artwork, and honest Más/sponsor neutral states. Evidence MUST include asset decisions, matrix captures, keyboard/reduced-motion proof, and diff stat. DoD: visual review and checks pass; branch → WP-2, ≤360 lines. **Notion sync:** asset status/owner, dependencies, branch/SHA, evidence, DoD.

#### Scenario: Missing artwork stays neutral
- GIVEN final Más or sponsor assets are absent
- WHEN the home is captured at the approved viewports
- THEN two readable canonical cards and an explicit neutral state are shown
- AND no invented brand, person, live, feed, or social content appears

### Requirement: WP-4 Visual Gate

WP-4 MUST depend on WP-2/WP-3, freeze one SHA, repeat captures, and issue reproducible PASS/FAIL. Evidence MUST include Chromium, Firefox, WebKit, iPhone 12, E2E, lint, typecheck, build, diff-check, checksums, and triage. DoD: every result is reproducible and owned; evidence-only branch → WP-3. **Notion sync:** SHA, matrix, report, failure owner/disposition, verdict, readiness.

#### Scenario: Drift blocks the candidate
- GIVEN repeated captures of the frozen SHA differ without approval
- WHEN the visual gate completes
- THEN it records FAIL with the discrepancy and owner
- AND it MUST NOT mark the candidate ready for Sprint Review

### Requirement: WP-5 Sprint Review

WP-5 MUST depend on WP-4 PASS and demo the exact preview SHA on desktop/mobile, including unavailable states. Evidence MUST include script, preview URL/SHA, feedback, and PO decision. DoD: each item has a disposition and owner; no `main` merge. **Notion sync:** preview, gate, attendance, feedback, PO decision, blockers.

#### Scenario: PO rejects a candidate
- GIVEN the preview SHA matches the passing gate evidence
- WHEN the PO records a blocking defect or rejection
- THEN the feedback is assigned to its originating package
- AND the task does not imply acceptance or a `main` merge

### Requirement: WP-6 Retrospective and Sprint 2 Backlog

WP-6 MUST depend on WP-4 evidence and WP-5 decision, compare plan/actual, and create independently estimable follow-ups. Evidence MUST include retro, metrics, risk/dependency register, owners/dates, and PO-approved Sprint 2 goal. DoD: every deferred item has reason, owner, dependency, priority; no code branch. **Notion sync:** metrics, risk owner, backlog, due date, PO goal, closure.

#### Scenario: External dependency becomes backlog work
- GIVEN an asset or authorization owner is unresolved
- WHEN WP-6 closes Sprint 1 planning
- THEN it records a separately estimable follow-up with owner and unblock evidence
- AND it MUST NOT represent that dependency as completed code work
