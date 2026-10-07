import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const form = read("src/components/ContactForm.tsx");
const analytics = read("src/lib/google-analytics.ts");
const consent = read("src/components/AnalyticsConsent.tsx");
const privacy = read("src/app/privacy/page.tsx");
const docs = read("docs/analytics-gbp.md");

test("contact funnel records user edits once and unlocked invalid attempts only", () => {
  assert.match(form, /trackContactFormStart/);
  assert.match(form, /contactFormStartTrackedRef/);
  assert.match(form, /updateForm[\s\S]*trackContactFormStart/);
  assert.doesNotMatch(form, /onFocus=.*trackContactFormStart/);
  assert.match(form, /Object\.keys\(nextErrors\)\.length > 0[\s\S]*trackContactFormInvalidSubmit/);
  assert.match(form, /trackContactFormInvalidSubmit\(\)/);
  assert.match(form, /trackContactFormStart\(\)/);
});

test("existing WhatsApp event retains its fixed channel and platform parameters", () => {
  const whatsappHelper = analytics.slice(analytics.indexOf("export function trackWhatsAppClick"));
  assert.match(whatsappHelper, /gtag\("event", "click_enviar_whatsapp", \{ channel: "contact_form", platform: "whatsapp" \}\)/);
});

test("GA funnel helpers are consent-gated and expose fixed non-PII event parameters", () => {
  for (const name of ["contact_form_start", "contact_form_invalid_submit"]) {
    assert.ok(analytics.includes(name), `missing ${name}`);
  }
  assert.match(analytics, /explicitlyGranted[\s\S]*ga-disable-/);
  assert.match(analytics, /channel:\s*["']contact_form["']/);
  const funnelHelper = analytics.slice(analytics.indexOf("function trackContactFormEvent"), analytics.indexOf("export function trackWhatsAppClick"));
  assert.doesNotMatch(funnelHelper, /firstName|lastName|message|service|url|error|field/i);
  assert.match(analytics, /contact_form_start[\s\S]*contact_form_invalid_submit/);
});

test("withdrawal purges both queued funnel events and disclosures describe aggregate-only measurement", () => {
  const purge = analytics.slice(analytics.indexOf("function purgeQueuedGaCommands"), analytics.indexOf("export function disableAnalytics"));
  assert.match(purge, /contact_form_start/);
  assert.match(purge, /contact_form_invalid_submit/);
  assert.match(consent, /solo si aceptás[\s\S]*Google Analytics mide/i);
  assert.match(consent, /inicio de edición|edición del formulario/i);
  assert.match(consent, /intentos? de envío inválidos|intentos? inválidos/i);
  assert.match(privacy, /inicio de edición|edición del formulario/i);
  assert.match(privacy, /intentos? de envío inválidos|intentos? inválidos/i);
  assert.match(docs, /contact_form_start/);
  assert.match(docs, /contact_form_invalid_submit/);
  assert.match(docs, /contact_form_start[\s\S]*contact_form_invalid_submit[\s\S]*únicamente el parámetro fijo `channel: contact_form`/);
  assert.match(docs, /click_enviar_whatsapp[\s\S]*`channel: contact_form` y `platform: whatsapp`/);
  assert.match(docs, /no se envían|no envía/i);
});
