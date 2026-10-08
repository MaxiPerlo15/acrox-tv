import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PROGRAMS } from "../../src/domain/programs.ts";

const component = readFileSync(new URL("../../src/components/ProgramPage.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../../src/components/ProgramPage.module.css", import.meta.url), "utf8");

test("program hero metadata uses converted silhouettes and existing program logos", () => {
  assert.deepEqual(PROGRAMS.map(({ heroArtworkSrc }) => heroArtworkSrc), [
    "/programs/hero/silueta-luichi.webp",
    "/programs/hero/silueta-conductora-masnutri.webp"
  ]);
  assert.deepEqual(PROGRAMS.map(({ heroArtworkWidth, heroArtworkHeight }) => [heroArtworkWidth, heroArtworkHeight]), [
    [1122, 1402],
    [1122, 1402]
  ]);
  assert.deepEqual(PROGRAMS.map(({ coverLogoSrc }) => coverLogoSrc), [
    "/alta-data-logo.png",
    "/programs/logos/mas-que-nutricion.webp"
  ]);
});

test("host names share a responsive slot and Nutrition portrait preserves source dimensions and alpha", async () => {
  const names = PROGRAMS.map(({ hostNameArtworkWidth, hostNameArtworkHeight }) => [hostNameArtworkWidth, hostNameArtworkHeight]);
  assert.deepEqual(names, [[2101, 259], [2088, 470]]);
  assert.match(styles, /aspect-ratio:\s*2101\s*\/\s*259/);
  const metadata = await sharp(fileURLToPath(new URL("../../public/programs/hero/silueta-conductora-masnutri.webp", import.meta.url))).metadata();
  assert.deepEqual([metadata.width, metadata.height], [1122, 1402]);
  assert.equal(metadata.hasAlpha, true);
});

test("program hero exposes a semantic H1 with decorative visible logo and required reading order", () => {
  assert.match(component, /aria-labelledby="program-title"/);
  assert.match(component, /<h1[^>]*id="program-title"[\s\S]*?<span[^>]*className=\{styles\.visuallyHidden\}[\s\S]*?program\.name[\s\S]*?<Image[\s\S]*?src=\{program\.coverLogoSrc!\}[\s\S]*?alt=""/);
  assert.match(component, /ACROX TV<\/p>/);
  assert.doesNotMatch(component, /PROGRAMACIÓN ORIGINAL/);
  const logo = component.indexOf("program.coverLogoSrc!");
  const silhouette = component.indexOf("program.heroArtworkSrc");
  const copy = component.indexOf("program-hero-summary");
  assert.ok(logo < silhouette && silhouette < copy, "mobile reading order is logo, silhouette/name, then copy");
  assert.match(component, /alt=\{program\.hostNameArtworkAlt\}/);
  assert.match(styles, /\.visuallyHidden/);
  assert.doesNotMatch(styles, /\.hero \.title[^}]*display:\s*none/);
});
