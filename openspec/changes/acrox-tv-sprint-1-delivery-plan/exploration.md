## Exploration: Acrox TV Sprint 1 Delivery Plan

### Current State

Sprint 1 is a one-week, client-reviewable visual-fidelity increment (10–16 August 2026). Its Notion board has six tasks, all `Sin empezar`, with only title, date, estimate, priority, status, sprint, and short notes. The task-page bodies are blank; the schema has no fields for scope, dependencies, inputs, DoD, review evidence, or branch target. This document proposes the missing work-package content only; it does not update Notion.

The approved prototype remains the implementation contract: exactly two home cards; direct routes `/alta-data-te-tire` and `/mas-que-nutricion`; the real shared Navbar/Footer; existing Acrox hierarchy, CSS tokens, and fonts; program-owned YouTube playlists; honest Instagram-unavailable states; and no fabricated people, sponsor brands, or missing artwork. Live ownership, Instagram authorization, final sponsor assets, final Más que Nutrición artwork, and a merge to `main` remain out of scope.

The committed editorial-release tracker is `feat/acrox-tv-editorial-release` at `05aad18`, which contains the original seven release slices. It is the only safe product baseline for this sprint. The `editorial-design-fidelity` worktree is checked out at that commit but has 488 uncommitted changed lines across eight files; `feat/acrox-tv-prototype-home` is a separate descendant at `dbf0f4c`, with 602 changed lines from the tracker. Neither is integrated and neither may be assumed as Sprint 1's starting state. The active root checkout is on `feat/acrox-tv-program-pages-pr2`, which descends from the tracker but has unrelated working-tree changes and untracked artifacts.

The existing review workflow is Playwright E2E with Chromium, Firefox, WebKit, and iPhone 12 projects; the fidelity worktree runs a production build plus `next start` before tests. Required quality commands are `npm run test:e2e`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Existing editorial tests already cover route ownership, shell presence, source isolation, keyboard paths, responsive layout, fallback artwork, and sponsor motion, but the tracker tests still contain legacy `/alta-data` expectations. A canonical-route decision is therefore a gating dependency before visual baselines can be approved.

### Affected Areas

- `Notion Tasks` data source `collection://31e4cec8-abb5-8076-891c-000bafb8f653` — current Sprint 1 task pages need the proposed work-package bodies; no schema migration is required for the first pass.
- `openspec/changes/acrox-tv-sprint-1-delivery-plan/exploration.md` — planning artifact for the new SDD change.
- `feat/acrox-tv-editorial-release` at `05aad18` — proposed clean tracker baseline and eventual preview integration target; it must remain distinct from `main`.
- `tests/e2e/acroxtv-editorial.spec.ts`, `playwright.config.ts`, and `package.json` — current evidence and command conventions to preserve when implementation begins.
- `src/components/sections/home/StreamingSection.tsx`, `ProgramDirectoryCard.tsx`, `SponsorRibbon.tsx`, `ProgramPage.tsx`, `AcroxTvMediaSection.tsx`, `src/domain/programs.ts`, and `src/app/globals.css` — expected implementation surfaces for the template/home packages, not modified by this exploration.
- `prototypes/acrox-tv-v2/index.html` and approved/supplied artwork — visual reference and asset source; missing Más and sponsor assets require neutral states.

### Work Packages

#### WP-1 — Re-baseline visual fidelity

- **Notion page:** `3b74cec8abb58180954de6fa7f299deb` (`60 min`, High).
- **Objective:** Establish one reproducible, approved visual and route baseline before presentation work starts.
- **In scope:** Record the approved viewport matrix, route matrix, source-of-truth prototype reference, canonical URLs, expected neutral states, and screenshot capture rules; reconcile legacy `/alta-data` test expectations with the approved `/alta-data-te-tire` route.
- **Out of scope:** Product styling, new assets, provider/API changes, live/Instagram authorization, and `main` merge.
- **Dependencies:** Clean worktree from `05aad18`; Product Owner confirmation that the approved prototype and direct routes remain authoritative; executable browser dependencies.
- **Inputs/assets:** `prototypes/acrox-tv-v2/index.html`; approved requirements; supplied `/alta-data-logo.png`; neutral fallback policy for Más and sponsors; existing Playwright configuration.
- **Workflow:** (1) Create a clean, isolated child worktree from `05aad18`. (2) Inventory tracker behavior versus approved requirements. (3) Write failing/updated route and visual assertions first, including desktop, tablet, and iPhone 12 targets. (4) Record capture readiness rules: stable viewport, settled fonts/images, mocked deterministic media, no animation drift. (5) Publish the baseline manifest and identify every intentional neutral state.
- **Expected artifacts:** Baseline manifest; canonical route matrix; deterministic capture checklist; initial RED test report; screenshot/reference inventory.
- **Acceptance criteria:** Both approved routes are named as the only canonical targets; all reference states are attributable to supplied assets or named neutral placeholders; every viewport and browser owner is explicit; no legacy route is silently accepted.
- **Definition of Done:** Baseline is reviewed by the PO/design reviewer, RED assertions demonstrate any tracker divergence, and the next package has an unambiguous pass/fail target.
- **Review evidence:** Baseline manifest, prototype comparison links, test output, screenshot paths/checksums, and a recorded route-decision note.
- **Branch target:** Proposed `feat/acrox-tv-s1-visual-baseline` → `feat/acrox-tv-editorial-release` at `05aad18`; target size ≤200 changed lines.
- **Risks/blockers:** The current fidelity worktree is dirty and cannot be reused as proof; legacy tests use `/alta-data`; browser/font/image nondeterminism can invalidate visual comparisons.

#### WP-2 — Shared program-page template

- **Notion page:** `3b74cec8abb5814bb3c1cdaf1d469bd0` (`180 min`, High).
- **Objective:** Deliver one reusable direct-program template that preserves Acrox’s shared shell and shows only truthful, program-owned media states.
- **In scope:** Canonical direct-route correction if WP-1 proves it is needed; shared Navbar/Footer; hero and full-width media layout; typed program data; registered YouTube playlist presentation; explicit Instagram unavailable/error UI; desktop and mobile keyboard behavior.
- **Out of scope:** New live UI, global/producer/sibling media fallback, real Instagram content, new program routes, final portrait/sponsor artwork, and home-card/ribbon work.
- **Dependencies:** WP-1 route decision and visual manifest; tracker source registry; approved playlists (Alta Data `PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y`, Más que Nutrición `PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq`).
- **Inputs/assets:** Existing shared Navbar/Footer and font tokens; `PROGRAMS`/source registry; mocked scoped API responses; approved editorial copy; neutral presenter/artwork states.
- **Workflow:** (1) Add RED E2E/contract assertions for the two canonical paths, refresh, shared shell, source isolation, no live panel, no cross-program fallback, and honest Instagram state. (2) Implement the minimum route/template changes. (3) Refactor namespaced CSS only after green tests. (4) Test keyboard and iPhone 12 flow. (5) Capture template screenshots against WP-1’s manifest.
- **Expected artifacts:** One template implementation; scoped media-state tests; contract-test output; route/SEO evidence; desktop/mobile comparison captures.
- **Acceptance criteria:** Both routes refresh successfully in the real shared shell; one template renders program-specific facts and only the registered playlist’s media; Instagram is visibly unavailable/error until authorized; no live, producer, or sibling content appears.
- **Definition of Done:** RED→GREEN→refactor evidence exists; focused and full E2E suites pass across the configured browser matrix; lint, typecheck, build, and diff check pass; diff is ≤380 changed lines.
- **Review evidence:** PR/worktree diff stat, Playwright report/traces on failure, route/SEO assertions, source-isolation test output, screenshots, and command transcript.
- **Branch target:** Proposed `feat/acrox-tv-s1-program-template` → `feat/acrox-tv-s1-visual-baseline`; target size ≤380 changed lines.
- **Risks/blockers:** Canonical-slug migration can affect registry, sitemap, API paths, and test mocks together; the legacy Navbar retains an independent feed request; absent provider credentials must remain mocked/explicitly unavailable rather than substituted.

#### WP-3 — Prototype-faithful Acrox TV home

- **Notion page:** `3b74cec8abb581d19bb8c2761ac1e4ab` (`180 min`, High).
- **Objective:** Deliver the approved two-card Acrox TV home section and accessible shared sponsor ribbon without introducing invented assets or touching `main`.
- **In scope:** Exactly two equal cards; approved content hierarchy, typography, and container; canonical card links; supplied Alta artwork; neutral Más fallback; sponsor ribbon with only supplied sponsors or an honest static unavailable state; hover/focus pause, keyboard accessibility, reduced-motion behavior, and responsive layout.
- **Out of scope:** Third cards, home live/feed/social modules, fabricated sponsor logos, fabricated people/brands, program-template/media changes, and final missing assets.
- **Dependencies:** WP-1 visual manifest; WP-2 canonical route exports; supplied Alta asset; explicit confirmation of whether any sponsor/Más assets were delivered before work starts.
- **Inputs/assets:** Prototype reference; `/alta-data-logo.png`; current Acrox design tokens/fonts; approved card copy; asset inventory and neutral-state design.
- **Workflow:** (1) Add RED tests for exact card count/links/equal prominence, asset failure, no legacy media modules, keyboard activation, ribbon focus/hover pause, reduced motion, and iPhone 12 stacking. (2) Implement the smallest focused home/ribbon surface. (3) Keep CSS scoped to the editorial home. (4) Capture desktop/tablet/mobile screenshots only after fonts, images, and motion are ready. (5) Compare against WP-1’s manifest and document intentional neutral states.
- **Expected artifacts:** Two-card home implementation; accessible ribbon/neutral-state implementation; E2E coverage; visual comparison captures; asset decision log.
- **Acceptance criteria:** The home exposes exactly two equally prominent canonical cards; it contains no live/feed/social content; all artwork and sponsors are either verified assets or explicit neutral states; the ribbon does not obstruct focus or reduced-motion users; 390px/mobile layout is readable.
- **Definition of Done:** All acceptance tests are green in the configured matrix; visual reviewer accepts desktop/tablet/mobile comparisons; lint, typecheck, build, and diff check pass; diff is ≤360 changed lines.
- **Review evidence:** Before/after visual captures, browser-matrix results, keyboard/reduced-motion recordings or assertions, asset inventory, and diff stat.
- **Branch target:** Proposed `feat/acrox-tv-s1-home-fidelity` → `feat/acrox-tv-s1-program-template`; target size ≤360 changed lines.
- **Risks/blockers:** Final Más and sponsor assets remain unavailable; copying the dirty fidelity worktree would bypass reviewable history; global CSS can cause unrelated visual regressions if not scoped.

#### WP-4 — Visual gate and quality checks

- **Notion page:** `3b74cec8abb5819d83d3ceeb1bf1450e` (`150 min`, High).
- **Objective:** Produce a release-candidate verdict backed by deterministic visual, browser, accessibility, and build evidence.
- **In scope:** Repeatable captures for approved desktop/tablet/mobile targets; Chromium, Firefox, WebKit, and iPhone 12 E2E; route/shell/media assertions; lint, typecheck, production build, diff check; triage/retest of failures.
- **Out of scope:** New product behavior, acceptance of visual mismatches without a PO decision, performance/Lighthouse scope unless separately requested, `main` merge.
- **Dependencies:** WP-2 and WP-3 complete; clean integrated preview branch; WP-1 baseline manifest; runnable production-like Playwright server/configuration.
- **Inputs/assets:** Accepted screenshot manifest; existing Playwright projects; deterministic API mocks; command list from `openspec/config.yaml`; implementation diffs.
- **Workflow:** (1) Freeze the candidate commit/worktree. (2) Run visual captures twice to detect drift. (3) Run the full browser matrix and review failures with traces/screenshots. (4) Run lint, typecheck, build, and `git diff --check`. (5) Classify each discrepancy as defect, intentional approved difference, or infrastructure flake; retest after a fix. (6) Publish PASS/FAIL report.
- **Expected artifacts:** Visual gate report; command transcript; screenshot set/checksums; browser-matrix results; failure-triage log; release-candidate SHA.
- **Acceptance criteria:** No unexplained visual drift; all four configured browser projects pass; quality commands pass; direct routes, shared shell, source isolation, responsive layout, and neutral asset states are proven.
- **Definition of Done:** A reviewer can reproduce the result from the recorded SHA, commands, environment variables, and capture rules; the result is explicitly PASS or FAIL with no unowned failure.
- **Review evidence:** `npm run test:e2e`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check` outputs; Playwright report/traces; side-by-side screenshots.
- **Branch target:** Proposed evidence-only `review/acrox-tv-s1-visual-gate` → `feat/acrox-tv-s1-home-fidelity`; no product changes, no separate PR unless evidence must be versioned.
- **Risks/blockers:** Browser-specific rendering, motion/font/image timing, unavailable browser binaries, and an already-dirty target worktree can make a passing result non-reproducible.

#### WP-5 — Sprint Review client demo

- **Notion page:** `3b74cec8abb58140b0edfc16f6fa4943` (`60 min`, High).
- **Objective:** Give the Product Owner and client a bounded, evidence-backed preview demo and collect decisions without merging to `main`.
- **In scope:** Demo the preview branch, two-card home, both direct pages, shared shell, YouTube state, Instagram-unavailable state, responsive views, quality-gate result, and client feedback capture.
- **Out of scope:** On-the-spot scope changes, implementation during the ceremony, production deployment, `main` merge, and unverified provider authorization.
- **Dependencies:** WP-4 PASS; accessible preview environment tied to the release-candidate SHA; PO (Maxi) availability; demo script and feedback template.
- **Inputs/assets:** Preview URL; release-candidate SHA; visual gate report; approved prototype references; known out-of-scope list.
- **Workflow:** (1) Confirm preview SHA matches WP-4 evidence. (2) Demonstrate the scripted happy path on desktop and mobile. (3) State honest unavailable assets/integrations before feedback. (4) Capture feedback as accept, defect, deferred request, or Sprint 2 candidate. (5) Record PO decision: accepted for current sprint, follow-up required, or rejected.
- **Expected artifacts:** Demo script, attendance/feedback notes, PO decision, linked visual-gate report, and categorized backlog entries.
- **Acceptance criteria:** The client sees the intended scope on the preview branch; all feedback has an owner and disposition; no statement implies that `main` was changed or that unavailable integrations are live.
- **Definition of Done:** PO decision and feedback record are linked to the candidate SHA; any defect blocking acceptance is returned to the correct work package; no merge occurs without explicit PO approval.
- **Review evidence:** Preview URL/SHA, screen recording or screenshots, demo checklist, feedback log, and PO acceptance/rejection note.
- **Branch target:** `feat/acrox-tv-s1-home-fidelity` release candidate (or its integrated tracker successor); target remains `feat/acrox-tv-editorial-release`, never `main` during Sprint 1.
- **Risks/blockers:** Preview may not match the tested SHA; client feedback may request out-of-scope assets/integrations; no explicit PO decision leaves the increment ambiguous.

#### WP-6 — Retrospective and Sprint 2 backlog

- **Notion page:** `3b74cec8abb58155b4bad14981318600` (`45 min`, Medium).
- **Objective:** Convert the review result and delivery evidence into prioritized, dependency-aware Sprint 2 candidates.
- **In scope:** Review workflow/visual stability lessons; record decision on real Más/sponsor assets, Instagram authorization, live ownership, remaining defects, and next sprint goal; update delivery metrics and backlog ordering.
- **Out of scope:** Starting Sprint 2 implementation, silently changing scope, granting social-provider access, or merging to `main`.
- **Dependencies:** WP-5 feedback and PO decision; WP-4 quality report; asset/integration-owner input where available.
- **Inputs/assets:** Work-package evidence, review feedback, branch/PR state, unresolved risk register, current Notion backlog.
- **Workflow:** (1) Compare planned versus actual scope, duration, changed lines, and failures. (2) Identify root causes for any visual or environment instability. (3) Convert feedback into independently estimable backlog items. (4) Document external dependency owners and evidence required to unblock them. (5) Propose the Sprint 2 goal and sequence for PO prioritization.
- **Expected artifacts:** Retrospective note; Sprint 2 candidate backlog; updated dependency/risk register; action owners and due dates.
- **Acceptance criteria:** Every deferred item has a reason, owner, dependency, and proposed priority; no unresolved external dependency is disguised as a code task; at least one measurable process improvement is chosen.
- **Definition of Done:** PO has enough evidence to prioritize Sprint 2; lessons are recorded without changing product code, branches, or `main`.
- **Review evidence:** Retro checklist, Sprint metrics, dependency register, prioritized backlog, and PO-approved next-sprint goal.
- **Branch target:** No code branch. Notion/SDD planning artifacts only; any future implementation branch is selected during Sprint 2 planning.
- **Risks/blockers:** Missing owners for assets/social access; feedback without a clear acceptance decision; planning a new sprint before the visual gate has a reproducible verdict.

### Proposed Notion Updates

When authorized, replace the blank bodies of the six listed Sprint 1 task pages with their corresponding `WP-1` through `WP-6` sections above. Preserve the existing status, Sprint, priority, estimates, and dates until the Product Owner explicitly changes them. Add links to the SDD exploration, tracker SHA, visual-gate report, and review evidence to each page. The current schema can support the first pass through page content; add dedicated relation/URL properties only if the team later needs cross-sprint reporting.

### Sequencing and Missing Dependencies

1. **WP-1 → WP-2 → WP-3 → WP-4 → WP-5 → WP-6** is the recommended review-safe sequence. The current Notion dates place the home task before the shared-template task; reverse those execution dates or explicitly allow parallel work from the WP-1 baseline, because the template owns canonical route behavior and reduces rebase/visual-contract risk.
2. A Product Owner route decision is required because tracker tests still refer to `/alta-data`, while the approved requirements require `/alta-data-te-tire`.
3. A clean worktree based on `05aad18` is required. The root checkout and the `editorial-design-fidelity` worktree are dirty; the separate `dbf0f4c` prototype-home history is not integrated.
4. The delivered source of any final Más/sponsor assets must be identified before accepting non-neutral artwork. Without it, neutral states are the approved result.
5. Instagram authorization requires a per-program professional account, linked Facebook Page, owner, token, permissions, and fallback URL. Live requires channel ownership and canonical ID. Neither is a Sprint 1 coding blocker because both remain explicitly unavailable.
6. Browser dependencies and production-like Playwright environment variables must be available before WP-4; otherwise visual evidence is not release-grade.

### Approaches

1. **Enrich and execute the existing six Notion tasks as a dependency-ordered branch chain** — Keep the sprint scope, but add the work packages, evidence requirements, and clean-baseline rule proposed here.
   - Pros: Retains the agreed sprint and board; gives reviewers small, independently verifiable work units; protects `main` and the 400-line budget.
   - Cons: Requires a date/sequence correction and explicit PO route decision before implementation.
   - Effort: Medium.

2. **Treat the dirty fidelity worktree or `dbf0f4c` as the Sprint 1 baseline** — Continue from prior local work.
   - Pros: Appears faster.
   - Cons: Carries unreviewed changes, exceeds the review budget, obscures the diff from `05aad18`, and cannot provide reproducible baseline evidence.
   - Effort: High risk.

### Recommendation

Use Approach 1. Start from a clean child branch at tracker `05aad18`, complete the route-and-baseline gate first, then ship template and home as separate ≤400-line work units, and run the visual gate only on their integrated candidate. This preserves the approved prototype contract, keeps the review story coherent, and avoids treating uncommitted or unintegrated work as accepted progress.

### Risks

- Canonical-route drift (`/alta-data` versus `/alta-data-te-tire`) can make test evidence and public URLs disagree.
- The dirty tracker worktree and unrelated active root checkout can contaminate implementation or review evidence.
- Visual screenshot nondeterminism from fonts, images, animation, or browser differences can create false pass/fail results without WP-1 capture rules.
- Missing final artwork, Instagram authorization, and live ownership must remain explicit product states, not be replaced with fabricated or cross-program content.
- The six current Notion task pages are blank, so execution will be ambiguous until the proposed work-package content is approved and added.

### Ready for Proposal

Yes — after the Product Owner confirms the canonical Alta Data route and accepts the recommended sequence. The proposal should formalize the clean `05aad18` baseline, work-unit branch chain, evidence gate, and the planned Notion task-body updates; it must not alter application code, branches, Git state, or Notion until explicitly authorized.
