# Alta Data sponsor logos

## Goal and scope
Convert the five user-provided Downloads PNG logos to lossless WebP with alpha preserved and register them only in Alta Data's existing sponsor ribbon. Preserve supplied artwork, dimensions and visible pixels; no cropping, cleanup, color/background changes or component/CSS redesign. Do not touch Nutrition, home sponsors, hero work, GA4 or unrelated dirty files. This request does not authorize publication or committing unrelated work.

## Sources and identities
- logo-pinar-tennis.png -> Pinar Tenis Las Varillas
- logo-mangus.png -> Magnus (visible name differs from filename)
- logo-fgbeauty.png -> FG Beauty (provided filename; visible FG monogram)
- logo-san-jose.png -> San José
- logo-sharolmoda.png -> Sharol moda

## Tasks
- [x] T1 — Convert all five assets into public/programs/sponsors/alta-data/. Route: bounded writer; passive format conversion has no meaningful RED. Sharp verified 5/5 WebP outputs, source dimensions (1254x1254 each), identical alpha bytes and all visible RGB pixels. PNG total 2841.81 KB -> WebP total 1715.19 KB. No dependencies installed; no cropping/cleanup. Source work verified; commit not authorized in this sponsor request.
- [x] T2 — Register Alta Data's five sponsors and verify its existing ribbon. Route: sequential bounded writer, fresh-read exact insertion of the sponsor property only, preserving all existing registry fields. Focused Node regression observed RED for missing sponsors, then GREEN; scoped lint passed. Independent Node rerun passed. Chromium at 1440px and 375px verified five accessible unique logos, HTTP 200 WebP images, no document overflow/page errors, and no sponsors on Nutrition. Commit/publication not authorized for this request.

## Acceptance
Exactly five unique sponsor identities appear in Alta Data's accessible original track, using WebP assets with descriptive alt; the duplicated animation track is not double-counted. Nutrition remains unchanged. All five files decode with source dimensions and preserved alpha/visible pixels. No unrelated registry fields, components, styling or assets change.

## Checks and delivery
- Passed: independent Sharp metadata/alpha/visible-pixel checks (5/5); focused Node regression (1/1, including independent rerun); scoped ESLint; desktop/mobile Chromium browser checks. Output total: 1,756,356 bytes.
- Screenshots: /tmp/alta-data-sponsors-desktop.png and /tmp/alta-data-sponsors-mobile.png, inspected after reveal settled. Existing source padding/speckles/colors are preserved.
- Skipped: full build and broad UI suites while unrelated UI work remains dirty; Firefox/WebKit not run. Node emitted a harmless module-type warning. Browser checks passed after waiting for existing reveal motion.
- Native assessment was unassessable because untracked scope was undeclared; independent verification completed. Inspect showed unrelated tracked UI edits plus an intended-untracked selection stop. No START/approval: isolated review remains pending before any authorized delivery.
- Shared checkout is feat/program-ui-consistency with pre-existing dirty registry/components; avoid whole-file replacement and coordinate exact sponsor-property ownership.
- Conversion tooling: installed Sharp, no installation needed.
- Delivery strategy: ask-on-risk; forecast under 150 authored diff lines, binary/generated assets excluded.
- Work-unit commit/publication: pending; previous explicit main delivery authorization was restricted to the consent hotfix.
- Next: implementation and focused functional verification are complete. If delivery is requested, isolate the sponsor slice, review it and obtain commit/push authorization; do not publish unrelated UI changes.
