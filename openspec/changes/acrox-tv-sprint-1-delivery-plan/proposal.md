# Proposal: Acrox TV Sprint 1 Delivery Plan

## Intent

Make Sprint 1 (10–16 Aug) a one-week, PO-reviewable visual-fidelity increment by replacing six blank Notion task bodies with executable, evidence-backed work packages. The canonical Alta Data route is `/alta-data-te-tire`.

## Scope

### In Scope
- Enrich the six existing Sprint 1 Notion task pages when separately authorized; preserve their current metadata.
- Deliver from clean tracker `feat/acrox-tv-editorial-release` at `05aad18` to preview branches only.
- Produce deterministic visual and quality evidence for PO review.

### Out of Scope
- Application, Git, branch, or Notion changes in this planning change.
- `main` merge, live content, Instagram authorization, or invented artwork/sponsors.

## Capabilities

### New Capabilities
None — this is a delivery-planning artifact.

### Modified Capabilities
None — existing editorial and program-media requirements remain unchanged.

## Approach

Use a dependency-ordered feature-branch chain. Each Notion page receives: objective, scope, inputs, dependencies, workflow, DoD, evidence, branch target, and risks. The user is PO and accepts/rejects the preview candidate.

| WP | Package and delivery contract |
|---|---|
| 1 | **Re-baseline fidelity**: declare canonical routes, viewport/browser matrix, neutral states, deterministic readiness rules, and RED route assertions. Evidence: manifest, checksums, route decision. `feat/...-visual-baseline` → tracker, ≤200 lines. |
| 2 | **Shared program template**: direct routes, real Navbar/Footer, registered YouTube playlists, unavailable Instagram, source isolation, keyboard/mobile. Evidence: RED→GREEN output, route/SEO proof, captures. → WP-1, ≤380 lines. |
| 3 | **Prototype-faithful home**: exactly two equal canonical cards, supplied Alta asset, neutral Más/sponsor states, accessible reduced-motion ribbon. Evidence: asset log, matrix captures. → WP-2, ≤360 lines. |
| 4 | **Visual gate**: freeze SHA; capture twice; run Chromium, Firefox, WebKit, iPhone 12, E2E, lint, typecheck, build, and diff check. Evidence: reproducible PASS/FAIL report. Evidence-only review branch → WP-3. |
| 5 | **Sprint review**: demo preview SHA on desktop/mobile; disclose unavailable states; classify feedback; record PO decision. Evidence: script, feedback log, preview URL/SHA. Never `main`. |
| 6 | **Retro and Sprint 2 backlog**: compare plan/actual; assign owners for assets, Instagram, and live; prioritize independently estimable follow-ups. Evidence: retro, risk register, PO-approved goal. No code branch. |

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `Notion Tasks` collection | Modified later | Six page bodies receive the packages above. |
| `openspec/changes/.../` | New | Planning, design, specs, and task artifacts. |
| Tracker at `05aad18` | Future modified | Clean preview-only delivery baseline. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Legacy `/alta-data` tests | High | WP-1 makes the confirmed canonical route explicit. |
| Visual drift or dirty worktrees | High | Clean baseline, fixed capture rules, repeated checksums. |
| Missing assets/social access | High | Honest neutral/unavailable states; assign external owners. |

## Rollback Plan

Abandon or revert only the affected preview branch to its parent; retain evidence and restore Notion task bodies from page history. Never merge Sprint 1 work to `main`.

## Dependencies

- Clean `05aad18` worktree; approved prototype and supplied assets; Playwright browser environment; PO review availability.

## Success Criteria

- [ ] All six pages have complete, dependency-ordered work-package content and evidence links.
- [ ] Preview candidate proves the two routes, truthful media/asset states, and deterministic visual gate.
- [ ] PO records a Sprint 1 review decision without a `main` merge.
