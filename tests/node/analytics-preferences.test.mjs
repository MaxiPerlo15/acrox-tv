import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const consent = read("src/components/AnalyticsConsent.tsx");
const styles = read("src/components/AnalyticsConsent.module.css");
const button = (() => { try { return read("src/components/AnalyticsPreferencesButton.tsx"); } catch { return ""; } })();
const footer = read("src/components/Footer.tsx");
const privacy = read("src/app/privacy/page.tsx");
const analytics = read("src/lib/google-analytics.ts");

test("explicit preview removes its parameter before restoring saved choice", () => {
  const previewFlow = consent.slice(consent.indexOf("const frame = window.requestAnimationFrame"), consent.indexOf("return () => {", consent.indexOf("const frame = window.requestAnimationFrame")));
  assert.match(previewFlow, /replaceState/);
  assert.match(previewFlow, /history\.state/);
  assert.ok(previewFlow.indexOf("replaceState") < previewFlow.indexOf("setChoice(stored)"));
  assert.ok(previewFlow.indexOf("replaceState") < previewFlow.indexOf("setReady(true)"));
  assert.ok(previewFlow.indexOf("replaceState") < previewFlow.indexOf("setOpen(true)"));
  assert.match(previewFlow, /analytics-preferences/);
  assert.match(previewFlow, /requestAnimationFrame/);
});

test("analytics preferences reopen in-flow without a permanent floating trigger", () => {
  assert.match(button, /AnalyticsPreferencesButton/);
  assert.doesNotMatch(footer, /AnalyticsPreferencesButton/);
  assert.match(footer, /Politica de privacidad/);
  assert.match(footer, /Terminos de servicio/);
  assert.match(privacy, /AnalyticsPreferencesButton/);
  assert.match(consent, /acrox:open-analytics-preferences/);
  assert.doesNotMatch(consent, /position:\s*fixed/);
  assert.doesNotMatch(consent, /styles\.preferences/);
  assert.match(consent, /readAnalyticsChoice\(\)/);
  assert.match(analytics, /localStorage\.getItem\(GA_CONSENT_KEY\)/);
  assert.doesNotMatch(consent, /Esta elección no modifica la telemetría de Vercel ni el funcionamiento de Google Maps/);
  assert.match(styles, /var\(--(?:text|panel|line|blue|violet)[^)]+\)/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /@media\s*\(max-width:/);
  assert.match(styles, /min-height:\s*2\.75rem/);
});
