import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const component = read("src/components/SponsorRibbon.tsx");
const css = read("src/app/globals.css");

test("sponsor invitation wiring uses the configured WhatsApp destination and exact copy", () => {
  assert.match(component, /publicEnv\.whatsappNumber\.replace\(\/\\D\/g, ""\)/);
  assert.match(component, /encodeURIComponent\(invitationMessage\)/);
  assert.match(component, /Hola, quiero conocer las opciones para ser sponsor de ACROX TV/);
  assert.match(component, /Próximamente/);
  assert.match(component, /Tu marca acá/);
  assert.match(component, /Ser sponsor de ACROX TV/);
});

test("empty programs receive repeated visual-only invitation slots and keyboard focus treatment", () => {
  assert.match(component, /Math\.max\(0, 7 - sponsors\.length\)/);
  assert.match(component, /aria-hidden=\{canonical \? undefined : true\}/);
  assert.match(component, /className="sponsor-ribbon-invitation-cell" aria-hidden=\{canonical \? undefined : true\}/);
  assert.match(component, /tabIndex=\{canonical \? undefined : -1\}/);
  assert.match(css, /sponsor-ribbon-motion:has\(a:focus-visible\)/);
  assert.match(css, /sponsor-ribbon-viewport \{ scroll-behavior: auto; \}/);
});
