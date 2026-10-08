import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PROGRAMS } from "../../src/domain/programs.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const expectedSponsors = [
  ["Pinar Tenis Las Varillas", "/programs/sponsors/alta-data/pinar-tenis.webp", "https://www.instagram.com/pinartenislasvarillas/"],
  ["Magnus", "/programs/sponsors/alta-data/magnus.webp", "https://www.instagram.com/empanadasmagnus/"],
  ["FG Beauty", "/programs/sponsors/alta-data/fg-beauty.webp", "https://www.instagram.com/fgbeautyday/"],
  ["San José", "/programs/sponsors/alta-data/san-jose.webp", "https://www.instagram.com/distribuidora_sanjose/"],
  ["Sharol moda", "/programs/sponsors/alta-data/sharol-moda.webp", "https://www.instagram.com/sharolmoda/"]
];

test("only Alta Data has the five verified sponsor logos", async () => {
  const altaData = PROGRAMS.find(({ slug }) => slug === "alta-data-te-tire");
  const nutrition = PROGRAMS.find(({ slug }) => slug === "mas-que-nutricion");

  assert.deepEqual(altaData.sponsors?.map(({ name, logoSrc, instagramUrl }) => [name, logoSrc, instagramUrl]), expectedSponsors);
  assert.equal(nutrition.sponsors, undefined);

  for (const [, logoSrc] of expectedSponsors) {
    const file = path.join(root, "public", logoSrc);
    const bytes = await readFile(file);
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 1254);
    assert.equal(metadata.height, 1254);
    assert.equal(metadata.hasAlpha, true);
  }
});
