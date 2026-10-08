# Program host artwork refresh

## Goal and authorized scope
Use the new Nutrition host silhouette from `~/Downloads/silueta-conductora-masnutri.png`, convert it losslessly to WebP, and replace the current displayed portrait. Make both host-name images the same rendered size without stretching their original artwork.

## Decisions
- New asset: `public/programs/hero/silueta-conductora-masnutri.webp`. Update only Nutrition hero source and measured intrinsic dimensions in the program registry. Retain the old `silueta-romi.webp` and Downloads files unchanged; do not use the unrelated `Más que nutrición 2.jpg`.
- Preserve source dimensions, alpha and visible RGB. No crop, recolor, background cleanup or resizing during conversion. Fully transparent RGB canonicalization is acceptable only if alpha/visible RGB are identical.
- Name images already share width caps (430px desktop, 360px mobile) but have different natural ratios: Luichi2101×259 and Romina2088×470. Use a common responsive image slot with aspect ratio2101/259, current widths and contain fitting. Both boxes and painted heights match; Romina's artwork is narrower inside the box, never stretched. Retain zero vertical identity/name gap.
- Preserve centered330px desktop logos, mobile160px logo cap and logo→identity→copy order, cover390/300px sizing, typography/CTAs, transparent borderless sponsors, consent and privacy.

## Constraints and routing
Branch `feat/program-ui-consistency`, HEAD791a219; preserve all earlier uncommitted work and generated/unrelated artifacts. No commit/push, dependency installation, cache/TLS/font/config changes or userdev3000 termination. No parallel writers/worktrees. Old native receipts cover prior frozen candidates only. One bounded writer for asset/registry/CSS/tests, then independent verifier and parent-owned native review. Advisory forecast100–200 authored diff lines plus one WebP binary; protect review scope. Work-unit commits deferred pending explicit user authorization.

## Tasks
- [x] H1 — Convert and wire the new portrait; normalize the shared name slot; add/update meaningful test-first asset/geometry contracts. **Complete: 20Node/3Chromium/lint/diff, lossless alpha/visibleRGB verified.** Work-unit commit pending explicit authorization.
- [x] H2 — Independently verify lossless conversion and both program heroes at375/1024/1440, common name boxes/painted heights, contain fitting, compact identity gap and existing home/sponsor/consent behavior. **Complete: independent20Chromium/20Node/lint/diff and lossless alpha/visibleRGB validation.** Work-unit commit pending explicit authorization.
- [ ] H3 — Normalize intended scope, run fresh native review when enabled, acknowledge exact approved continuation and report local outcome. **Blocked: reviewer relay timed out; provider declared unachievable_lens_slot. No verdict, approval or acknowledgement.**

## Mapped surfaces
- `src/domain/programs.ts` Nutrition hero source/dimensions only.
- `src/components/ProgramPage.module.css` shared host-name sizing only.
- New WebP asset, existing `tests/node/program-hero-branding.test.mjs` and `tests/e2e/acroxtv-program-hero-branding.spec.ts`.
- Narrow asset expectation in `tests/e2e/acroxtv-program-polish.spec.ts` if needed; its old caratula expectation predates this request. Do not repair unrelated legacy typography or visual assumptions.
- `ProgramPage.tsx` already consumes registry dimensions and needs no behavior change.

## Acceptance and verification
Observe real RED before behavior changes: old Nutrition src and unequal name heights. GREEN includes identical rendered name dimensions (subpixel tolerance only), correctly calculated contain-painted geometry, no distortion/cropping, meaningful alpha-bound-derived adjacency. Compare originalPNG and WebP decoded alpha/visible RGB and report actual dimensions/bytes. Asset checks must be portable, not depend on Downloads at test runtime; conversion proof may use the supplied original locally.
Use existing production E2E runner on its owned free port, sequentially with lint. Fonts/reveals/target images should settle without waiting every below-fold lazy asset. Capture actual375/1440 screenshots under `/tmp/acrox-host-artwork-refresh`.
Commands: `node --experimental-strip-types --test tests/node/*.test.mjs`, `npm run lint`, `git diff --check`, and `node scripts/run-e2e.mjs` with targeted Chromium specs. Full modern slice includes hero branding/home DS/sponsor invitation/analytics consent/media preview. No runtimeNode19 request: installed Node24 runs a suite previously containing19 tests.

## Known outstanding checks outside this feature
Contracts are blocked by missing local server-only; no installation/guard bypass authorized. Pre-existing legacy hero typography expects1.04 while unchanged source uses.94; defer. Firefox/WebKit and full legacy suite not claimed green. Lazy image diagnostic measured20 own missing-dimension attributes across three routes with positive-size containers, but65 remains unaccounted for; await original URL/listed source, no image-loading changes here. Engram session/core incompatibility blocks memory mirror; this document is the recovery record, topic `odd/program-host-artwork-refresh/tasks`.

## Evidence and next step
H1: Node RED18pass/2fail for new source/shared slot; browser RED2pass/1fail with oldname heightdifference33.70px. GREEN20Node/3Chromium/lint/diff passed. New WebP1122×1402,1388770bytes vsPNG2122979bytes; decoded0alphamismatch/0visibleRGBmismatch,17267fullytransparentRGBcanonicalized. Original/oldartwork unchanged. Name slotsdesktop430×53.0 andmobile375331×40.8 with equalboxes/containpaintedheights; Romina paintnarrower, no stretch. Sharedslotonly CSS addition; registrysource+dims and narrow oldpolishcaratula expectation updated. Screenshots /tmp/acrox-host-artwork-refresh/{alta-data-te-tire,mas-que-nutricion}-{375,1440}.png actualproductionrunner. Independent H2 aggregate20Chromium/20Node/lint/diff passed sequentially without startupretry. At1024bothnames430×53,paintedLu430×53/Romi235.5×53,zeroverticalgap and330pxlogos. IndependentPillowalpha/visibleRGBmismatch0/0; transparentRGBdifferences7120 (decoder-specific vsSharp17267, irrelevantfullytransparentpixels only). No baselineoriginal-filehash captured, so do not claim independently proved unchanged hash; originalstillpresent with2122979bytes andoldWebP retained/no rawPNGinrepo. Screenshots refreshed375/1440; parentread both1440heroes: newRomina source visible, common-height containednames contiguous. Legacypolish/fulllegacy skipped due otherpreexistingoracles; Firefox/WebKit/contracts notrun. NativeASSESSunavailable undeclareduntracked, highriskindependent plan followed. Native H3 blocked; see authority evidence below. Existing Instagram credential warnings not blockers. No commit/push.

## Native H3 blocker and handoff

Fresh ordinary review `review-95d7a2c0b8ef94a2` froze target `sha256:70c5a38d061b6276ff7296f8baffe88bdf9c1251859ccea8c31621cc212697c8`, candidate tree `eda1bd7ad21aa7df1833d17af1a41f4354368a1a`, medium28paths/848logicalchangedlines with one review-reliability lens. Intended-untracked selection includes the new silhouette and new task document; unused old Romi asset was preserved but excluded. Generated tracked next-env/old preview ledger remain preserved, not authorized for staging.

One model-run forecast was relayed and acknowledged. Capture returned `unachievable-lens-slot-declared`: elapsed1204253ms, configuredbound1013658ms, materializedprompt132421bytes, subjecthash `sha256:bd06f0c8d99408e27624a54073718199bac71b5ad24a2eca0a6dc2c36c915529`, provider stop `unachievable_lens_slot`, authority still reviewing revision `sha256:c9744eef1162427f767275005ad88260b8e84e2f892461d961b2e4226e495548`. The facade already reconciled status and declared this terminal stop; parent made no additional lifecycle call. No verdict/approval/acknowledgement/authority burn. No same-slot replay, withdraw, reset, recovery, timeout environment change or new START. RDD remains on.

Next step: human local visual acceptance; later resolve native blocker by an explicitly authorized bounded review scope or timeout-policy adjustment. Do not repeat unchanged slot, infer approval from passing tests, disable RDD or deliver automatically. H1/H2 complete with20Chromium/20Node/lint and pixel proof; H3 stays unchecked. Full legacy, Firefox/WebKit and blocked contracts were not run. All source changes local/uncommitted, no push. This task-file update is bookkeeping only; no application changes after freeze.
