import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const media = read("src/components/AcroxTvMediaSection.tsx");
const carousel = read("src/components/SocialCarousel.tsx");
const css = read("src/app/globals.css");
const sponsor = read("src/components/SponsorRibbon.tsx");
const preview = media.slice(media.indexOf("const ProgramEpisodePreview"), media.indexOf("const ProgramInstagramUnavailableCard"));
const has = (source, expression) => expression.test(source);

test("program media exposes semantic latest episode heading and distinct reveals", () => {
  assert.ok(has(media, /<p className=\{`\$\{styles\.latestEyebrow\} program-media-heading`\}>Último episodio<\/p>/));
  for (const target of ["program-latest", "program-most-viewed", "program-episodes", "program-instagram"]) {
    assert.ok(media.includes(`data-reveal="${target}"`) || media.includes(`dataReveal="${target}"`), `missing ${target} reveal`);
  }
});

test("latest preview uses the external media wrapper and preserves the player contract", () => {
  assert.ok(has(media, /youtube-nocookie\.com\/embed/));
  assert.ok(has(media, /loading="lazy"/));
  assert.ok(has(css, /aspect-ratio:\s*16\s*\/\s*9/));
  assert.ok(has(css, /\.program-latest/));
});

test("program carousel thumbnails and latest preview use native lazy loading", () => {
  assert.ok(has(preview, /<Image[^>]*loading="lazy"/));
  assert.ok(has(carousel, /lazyImages/));
  assert.ok(has(carousel, /loading=\{lazyImages[^}]*\}/));
});

test("program reveal is observer-gated, directional, and reduced-motion safe", () => {
  assert.ok(has(css, /\.program-page\.reveal-ready \[data-reveal\]/));
  for (const target of ["program-latest", "program-most-viewed", "program-episodes", "program-instagram", "program-sponsors"]) assert.ok(css.includes(target), `missing motion style for ${target}`);
  assert.ok(has(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.program-page[\s\S]*transform:\s*none/));
  assert.ok(has(css, /\.program-page \[data-reveal\][^{]*\{\s*opacity:\s*1/));
});

test("shared observer retains one-shot behavior and async insertion support", () => {
  const observer = read("src/components/ScrollReveal.tsx");
  assert.ok(has(observer, /unobserve\(entry\.target\)/));
  assert.ok(has(observer, /MutationObserver/));
});

test("program sponsor waits for mounted media and latest/sponsor motion is perceptible", () => {
  const observer = read("src/components/ScrollReveal.tsx");
  assert.match(sponsor, /if \(sponsors\.length === 0\) return null/);
  assert.match(sponsor, /sponsors\.map\(/);
  assert.match(sponsor, /tabIndex=\{isDuplicate \? -1 : undefined\}/);
  assert.match(observer, /program-media/);
  assert.match(observer, /program-sponsors/);
  assert.match(observer, /programMediaReady\s*=\s*true;[\s\S]*?programPage\?\.querySelectorAll\(\s*['"]\[data-reveal="program-sponsors"\]['"]\s*\)\.forEach\(\(element\)\s*=>\s*observeElement\(element\)\)/);
  assert.match(observer, /ready/);
  assert.match(css, /\[data-reveal="program-latest"\]\s*\{\s*transform:\s*none;\s*transition:\s*opacity/);
  assert.match(css, /\[data-reveal="program-sponsors"\]\s*\{[^}]*transition-duration:\s*\.8s/);
  assert.match(css, /\[data-reveal="program-most-viewed"\]\s*\{\s*transform:\s*translate3d\(-18px, 0, 0\)/);
  assert.match(css, /\[data-reveal="program-instagram"\]\s*\{\s*transform:\s*translate3d\(18px, 0, 0\)/);
});
