# Program surface spacing and sponsor links

## Approved scope and rationale
Make program sponsor cards transparent and borderless, blending with the existing page color without adding a grid. Move desktop H1/summary/CTAs closer to the label and lower artwork in both programs. Preserve DS metrics/colors, proportional artwork, mobile art-first layout and visually clipped accessible H1. Every Alta Data sponsor card links to its supplied Instagram. Preserve unrelated dirty work; no asset changes, commits or publication authorized.

## Destinations
- Pinar Tenis Las Varillas: https://www.instagram.com/pinartenislasvarillas/
- Sharol moda: https://www.instagram.com/sharolmoda/
- San José: https://www.instagram.com/distribuidora_sanjose/
- Magnus: https://www.instagram.com/empanadasmagnus/
- FG Beauty: https://www.instagram.com/fgbeautyday/

## Tasks and routes
- [x] T1 — Transparent, borderless, whole-card sponsor links. Delegated writer required by cross-file data/component/CSS/tests. URLs observed Node RED/GREEN; border tests observed RED 1px in desktop/mobile then GREEN. Ten browser cases, sponsor Node contract and scoped lint passed. Secure new tabs, full-card bounds, original keyboard stops, duplicate tabindex=-1 and visible focus preserved.
- [x] T2 — Compact copy and lower desktop artwork in both heroes. Sequential delegated writer observed RED gap 78px versus 14px, then GREEN. Ten browser cases at 1440/1024/mobile passed; scoped lint and sponsor Node contract passed. Reserving former gap plus responsive art shift preserved scale; mobile/DS unchanged. Earlier exact artwork-to-label/CTA anchors superseded by this approved direction.
- [x] T3 — Independent desktop/mobile verification. Read-only verifier passed 10 browser cases, sponsor Node contract and focused ESLint. Settled screenshots inspected by verifier and parent; transparent/borderless links, keyboard focus, both heroes and overflow checks passed. Native assessment was unassessable, so independent verification was required.

## Acceptance and evidence
- Program-scoped sponsor overrides only: no normal/hover border or colored fill; retain dimensions, animation and focus ring. Whole-card hit areas use exact destinations and noopener noreferrer. Duplicate links cannot receive focus.
- Desktop label/title box gap approximately 14px; title metrics unchanged, copy raised, artwork lowered without clipping or meaningful scale loss. Preserve mobile art-before-description and accessible hidden H1.
- Current screenshots: /tmp/program-surface-spacing/{alta-data-te-tire,mas-que-nutricion}-{1440,375}.png and regenerated borderless alta-data-sponsor-card.png.
- T1 Impeccable detector exited 2 for pre-existing unrelated CSS warnings, not a clean pass. T2 initial all-page-image wait timed out; focused hero-image settling passed.
- Independent current desktop geometry matched recovered original writer stdout: at 1440, copy moved up 64px and artwork down 24px; at 1024, copy moved up 51.1875px and artwork down 20px. Cover-height change <=0.02px. Historical baseline provenance is the writer's original successful command stdout, not an independent historical run; independent current measurements corroborated it.
- Mobile functional/layout tests passed with untouched mobile CSS; exact historical before/after mobile coordinates were not independently proved. The sponsor-card screenshot includes the intentional keyboard focus ring, not a normal-state border.
- Broad lint/build and Firefox/WebKit remain skipped; dirty unrelated UI must not be silently repaired. Native inspect stopped at intended-untracked selection with unrelated tracked UI changes; no START or native approval. Isolated review pending for authorized delivery.

## Delivery and next step
Branch feat/program-ui-consistency is heavily dirty. Source surfaces: program module/global sponsor CSS, SponsorRibbon, sponsor type/registry and focused tests. UI Skills CLI unavailable; installed Impeccable/Playwright guidance used, no installation. Delivery ask-on-risk; forecast under 300 authored lines. Native review requires isolated scope; no mixed-workspace approval claimed. Work-unit commits/publication await explicit authorization (previous grant covered consent hotfix only).
Engram mirror pending: the final T3 completion save failed because gentle-engram 0.3.0 could not resume against Engram core 2.2.1. This file is the final local recovery copy; resynchronize after the memory server is upgraded/restarted, without changing repository behavior.
Next: local implementation and focused verification complete. Before any authorized delivery, isolate this slice, run applicable full checks and native review; no deployment claimed.
