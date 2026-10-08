import test from "node:test";
import assert from "node:assert/strict";
import { PROGRAMS } from "../../src/domain/programs.ts";

test("approved covers and registered logos belong to their programs, with sponsors scoped to Alta Data", () => {
  assert.deepEqual(PROGRAMS.map(({ slug, coverSrc }) => [slug, coverSrc]), [
    ["alta-data-te-tire", "/programs/covers/adtt-1.webp"],
    ["mas-que-nutricion", "/programs/covers/mas-que-nutricion-1.webp"]
  ]);
  assert.equal(PROGRAMS[0].coverLogoSrc, "/alta-data-logo.png");
  assert.equal(PROGRAMS[1].coverLogoSrc, "/programs/logos/mas-que-nutricion.webp");
  assert.match(PROGRAMS[1].coverLogoSrc, /\.webp$/);
  assert.equal(PROGRAMS[0].sponsors?.length, 5);
  assert.equal(PROGRAMS[1].sponsors, undefined);
});
