# Home Sponsor Assets Evidence

## Binding

- Base commit: `1854207918b96177b9faddbb80c3036a970fd4e6`
- This evidence records the home-only SponsorRibbon asset slice. Direct program pages, media APIs, and Footer were not changed.

## Strict TDD

- RED: the new approved-logo contract failed because `Magnus` was absent from the empty sponsor registry.
- GREEN: the focused Chromium sponsor-logo and carousel/reduced-motion tests passed after registering the five approved WebP assets.
- TRIANGULATION: the mobile contract proves the five-image ribbon remains inside a 390px viewport; the full suite passed in Chromium, Firefox, WebKit, and mobile.

## Captures

- `home-ribbon-desktop.png` captures the `/` ribbon at 1440x960 and visibly shows the converted approved logos.
- `home-ribbon-mobile.png` captures the same ribbon at 390x844 without horizontal page overflow.
- The capture script intercepts the legacy home feed locally. It does not navigate to direct program routes or call external media providers.

## Quality Gates

| Gate | Result |
| --- | --- |
| Focused E2E | 2 Chromium sponsor contracts passed; 1 mobile overflow contract passed |
| Full E2E | 201 passed |
| Lint | passed |
| Typecheck | passed |
| Build | passed with non-secret public fixture environment |
| WebP validation | five RIFF/WebP files and manifest SHA-256 entries verified |
| Diff check | passed |
