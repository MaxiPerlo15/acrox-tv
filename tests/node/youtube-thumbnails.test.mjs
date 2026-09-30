import test from "node:test";
import assert from "node:assert/strict";
import { selectYouTubeThumbnail } from "../../src/domain/youtube-thumbnails.ts";

test("selects maxres before high when supplied", () => {
  assert.equal(
    selectYouTubeThumbnail({ maxres: { url: "maxres.jpg" }, high: { url: "high.jpg" } }),
    "maxres.jpg"
  );
});

test("falls back to standard when maxres is absent", () => {
  assert.equal(selectYouTubeThumbnail({ standard: { url: "standard.jpg" } }), "standard.jpg");
});

test("skips an empty maxres URL", () => {
  assert.equal(
    selectYouTubeThumbnail({ maxres: { url: "" }, high: { url: "high.jpg" } }),
    "high.jpg"
  );
});
