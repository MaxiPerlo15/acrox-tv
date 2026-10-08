import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("home program directory follows the shared design-system contract", async () => {
  const [card, streaming, hero, page, css] = await Promise.all([
    source("../../src/components/ProgramDirectoryCard.tsx"),
    source("../../src/components/sections/home/StreamingSection.tsx"),
    source("../../src/components/sections/home/HeroSection.tsx"),
    source("../../src/app/page.tsx"),
    source("../../src/app/globals.css"),
  ]);
  assert.match(card, /home-projects-teaser-card/);
  assert.doesNotMatch(card, /position|program-directory-card-meta/);
  assert.match(streaming, /<span>ACROX TV<\/span>/);
  assert.doesNotMatch(streaming, /PROGRAMACIÓN ORIGINAL|position=/);
  assert.doesNotMatch(hero, /HomeMetric|metrics|hero-metrics/);
  assert.doesNotMatch(page, /HOME_METRICS|metrics=/);
  assert.match(css, /\.home-page \.hero-title-accent \{\s*background: var\(--brand-accent-gradient\)/);
});
